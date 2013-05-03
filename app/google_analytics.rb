## proxy google analytics api requests using ruby client for auth

require 'google/api_client'

## never do this, it is just to get around ruby ssl crapitude on osx for dev
require 'openssl'
OpenSSL::SSL::VERIFY_PEER = OpenSSL::SSL::VERIFY_NONE

class Dash < Sinatra::Base

  configure do
    set :google_api_clients, {} # in-memory cache for authed api client
  end
  
  ## get an auth client if we do not have one cached
  post '/_google_/auth' do
    settings.google_api_clients.fetch(params[:public_key]) do |public_key|
      client = Google::APIClient.new

      ## load credentials for the service account
      key = Google::APIClient::KeyUtils.load_from_pkcs12(params[:private_key], params[:password])

      client.authorization = Signet::OAuth2::Client.new(
        :token_credential_uri => 'https://accounts.google.com/o/oauth2/token',
        :audience             => 'https://accounts.google.com/o/oauth2/token',
        :scope                => 'https://www.googleapis.com/auth/analytics.readonly',
        :issuer               => params[:email_address],
        :signing_key          => key
      )
      
      client.authorization.fetch_access_token!
      settings.google_api_clients[public_key] = client # cache client w/tokens
    end.authorization.access_token # return token
  end

  get '/_google_/get' do
    content_type :json

    client = settings.google_api_clients[params[:public_key]] # get from cache

    client.execute(
      :api_method => client.discovered_api('analytics','v3').data.ga.get,
      :parameters => params,
      :headers    => { 'Content-Type' => 'application/json' }
    ).data.rows.to_json
  end

end
