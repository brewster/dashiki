## proxy google analytics api requests using ruby client for auth
require 'google/api_client'

## never do this, it is just to get around ruby ssl crapitude on osx for dev
require 'openssl'
OpenSSL::SSL::VERIFY_PEER = OpenSSL::SSL::VERIFY_NONE

module Dash
  module GoogleAnalytics

    ## get google api auth token using private key for a service account
    def google_auth(params)
      set :client, {} unless (settings.client rescue false) # initialize cache

      settings.client.fetch(params[:public_key]) do |k| # create a new auth client if none cached
        client = Google::APIClient.new

        # load credentials for the service account
        key = Google::APIClient::KeyUtils.load_from_pkcs12(params[:private_key], params[:password])

        client.authorization = Signet::OAuth2::Client.new(
          :token_credential_uri => 'https://accounts.google.com/o/oauth2/token',
          :audience             => 'https://accounts.google.com/o/oauth2/token',
          :scope                => 'https://www.googleapis.com/auth/analytics.readonly',
          :issuer               => params[:email_address],
          :signing_key          => key
        )
        
        client.authorization.fetch_access_token!
        settings.client[k] = client  # cache client w/tokens
      end.authorization.access_token # return token
    end
    
    ## get data using a pre-authed client
    def google_get(params)
      client = settings.client[params[:public_key]] # get from cache
      analytics = client.discovered_api('analytics','v3')    
      client.execute(
        :api_method => analytics.data.ga.get,
        :parameters => params,
        :headers    => {'Content-Type' => 'application/json'}
        ).data                      # return data
    end

  end
end
