class Dash

  ## proxy requests from the front-end to get around issues like
  ## same-origin policies and firewalls
  post '/_proxy_/' do
    open(params['url'], params['headers'] || {}) do |f|
      f.read
    end
  end

end
