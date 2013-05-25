## proxy google analytics api requests using ruby client for auth
##
## any client for this module should hit /_google_/auth once per
## refresh (e.g. from .pre() method) with params :public_key,
## :private_key, :email_address, :password to auth (first time) or
## refresh (expired), the resulting token will be stored in
## sessions.db sqlite file
##
## to get data hit /_google_/get with params public_key, :ids,
## :target, "start-date", "end-date", "metrics", "dimensions", this
## will load the stored auth from sessions.db

require 'google/api_client'
require 'data_mapper'

## never do this, it is just to get around ruby ssl crapitude on osx for dev
require 'openssl'
OpenSSL::SSL::VERIFY_PEER = OpenSSL::SSL::VERIFY_NONE

## db for storing session data
DataMapper.setup(:default, ENV['DATABASE_URL'] || "sqlite3://#{Dir.pwd}/sessions.db")

## model for stored auth session
class GoogleAuthToken
  include DataMapper::Resource
  property :id,            Serial
  property :public_key,    String, :length => 255
  property :access_token,  String, :length => 255
  property :refresh_token, String, :length => 255
  property :expires_in,    Integer
  property :issued_at,     Integer
end
DataMapper.auto_upgrade!

class Dash < Sinatra::Base

  helpers do

    ## fetch access token using private key file, return Signet::OAuth2::Client
    def get_google_auth(params)

      ## load credentials for the service account
      key = Google::APIClient::KeyUtils.load_from_pkcs12(params[:private_key], params[:password])

      auth = Signet::OAuth2::Client.new(
        :token_credential_uri => 'https://accounts.google.com/o/oauth2/token',
        :audience             => 'https://accounts.google.com/o/oauth2/token',
        :scope                => 'https://www.googleapis.com/auth/analytics.readonly',
        :issuer               => params[:email_address],
        :signing_key          => key
      )

      auth.fetch_access_token!
      auth
    end
  end
  
  ## auth our token if needed (non-existent or expired)
  post '/_google_/auth' do

    ## get stored auth token
    session = GoogleAuthToken.first_or_new(:public_key => params[:public_key])

    ## re-auth if no stored token, or it has expired
    if session.attributes[:access_token].nil? or
        (Time.now.to_i - session.attributes[:issued_at] > session.attributes[:expires_in])

      auth = get_google_auth(params)

      session.attributes = {
        :access_token  => auth.access_token,
        :refresh_token => auth.refresh_token,
        :expires_in    => auth.expires_in,
        :issued_at     => auth.issued_at.to_i, #serialize to epoch,
      }
      session.save
    end

  end
  
  ## execute google client request and return data
  get '/_google_/get' do
    content_type :json

    ## get stored auth
    session = GoogleAuthToken.first(:public_key => params[:public_key])

    client = Google::APIClient.new(
      :application_name    => 'dashiki', # just send these to stop warnings
      :application_version => '0.1'
    )
    client.authorization.update_token!(session.attributes)

    client.execute(
      :api_method => client.discovered_api('analytics','v3').data.ga.get,
      :parameters => params,
      :headers    => { 'Content-Type' => 'application/json' },
    ).data.rows.to_json
  end
  
end
