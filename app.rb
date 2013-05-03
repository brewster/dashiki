#!/usr/bin/env ruby

require 'sinatra/base'
require 'open-uri'
require 'json'

class Dash < Sinatra::Base

  set :dashdir, 'cfg'    # subdir where dashboard js files live
  set :show_exceptions, true if development?

  configure do
    use Rack::Static, :urls => ["/#{settings.dashdir}"] # serve cfg dir as static content
  end

  helpers do

    ## return hash of top-level dirs in cfg, each is an array of paths-arrays
    ## for all .js files in all nested subdirs
    def dashboards
      Dir.chdir(settings.dashdir) do
        Dir.glob("**/[^_]*.js")     # recursive list of all js files not starting w/_
      end.sort.map do |file|        # split into array of path components
        file.sub(/\.js$/, '').split(File::SEPARATOR).tap do |path|
          path.unshift(nil) if path.length == 1 # prepend nil to path array for .js at toplevel
        end
      end.inject(Hash.new{|h,k| h[k]=[]}) do |dashboards, path|
        dashboards.tap do |d|       # populate hash by section (top-level dir or nil)
          d[path.first].push(path)
        end
      end
    end

  end

  ## landing page
  get '/' do
    @title = "Dashboard" # keep it short for iphone display
    @dashboards = dashboards
    haml :index
  end

end

## load all the Dash plugins
require_relative 'app/proxy'            # proxy requests
require_relative 'app/test'             # test data generator
require_relative 'app/google_analytics' # google analytics proxy with auth
require_relative 'app/overview'         # overview display
require_relative 'app/boxes'            # default display, always require this last
