#!/usr/bin/env ruby
# -*- coding: utf-8 -*-
require 'sinatra'
require 'open-uri'

set :dashdir, 'cfg'    # subdir where dashboard js files live
set :show_exceptions, false

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
        path.unshift(nil) if path.length == 1 # prepend nil to path array for js files at top level
      end
    end.inject(Hash.new{|h,k| h[k]=[]}) do |dashboards, path|
      dashboards.tap do |d|       # populate hash by section (top-level dir or nil)
        d[path.first].push(path)
      end
    end
  end

end

get '/' do
  @title = "Dashboard" # keep it short for iphone display
  @dashboards = dashboards
  haml :index
end

get '/overview' do
  @classes = (params[:class] || params[:classes] || "red").split(/[\s,]+/)
  @title = "Overview " + @classes.map(&:capitalize).join(' | ')
  @dashboards = dashboards
  @projects = @dashboards.values.flatten(1)
  haml :overview
end

## proxy requests from the front-end to get around issues like
## same-origin policies and firewalls
post '/_proxy_/' do
  open(params['url'], params['headers'] || {}) do |f|
    f.read
  end
end

## cheap and cheerful generator for some vaguely periodic test data
get '/_testdata_/' do
  require 'json'

  target    =  params[:target] || 'unknown'          # name of metric
  to        = (params[:to] || Time.now).to_i         # starting epoch
  from      = (params[:from] || now-3600).to_i       # ending epoch
  step      = (params[:step] || (to-from<12*3600 ? 10 : 60)).to_i # discretization in sec
  max       = (params[:max] || 1.0).to_f             # max amplitude
  period    = (params[:period] || 24*3600).to_i      # periodic over this many secs
  jitter    = (params[:jitter] || 1.0).to_f          # random jitter amount
  sparsity  = (params[:sparsity] || 0.1).to_f        # probability of a datum being zero

  scale = period/(2*Math::PI)                      # scale factor for time range
  epochs = (from-from%step).step(to-to%step, step) # discrete time buckets
  bytesum = target.each_byte.inject(0) { |b, sum| sum += b } # uniq-ish int by metric name

  datapoints = epochs.map do |time|
    r = Random.new(bytesum+time)        # deterministic based on time
    y = if sparsity >= r.rand(0.0..1.0)
          0.0
        else
          jit = r.rand(0.0..jitter) - r.rand(0.0..jitter) # +/- half-amplitude
          (jit + (Math.cos(time/scale) + 1)/2) / 2
        end
    { x: time, y: y * max }
  end

  JSON([{ name: target, data: datapoints }])
end

## return array of count fake metrics for use with test data
get '/_testfind_/*' do |count|
  require 'json'
  count = 1 if count.empty?

  ## fake word generator
  consonants = 'bcdfghjklmnpqrstvwxy'
  vowels = 'aeiou'
  mkword = lambda do |length|
    length.times.map do |i|
      i.even? ? consonants[rand(21)] : vowels[rand(5)]
    end.join
  end

  ## make count metrics
  metrics = count.to_i.times.map do |x|
    3.times.map { mkword.call(rand(7)+4) }.join('.')
  end
  JSON(metrics)
end

## display a dashboard
get %r{^/([\w/]+)$} do
  @dashboards = dashboards
  @dashboard = params[:captures].first

  if File.exists?(File.join(settings.dashdir, "#{@dashboard}.js"))
    @title = @dashboard.split('/')[1..-1].map{ |p| p.gsub(/_/, ' ').capitalize }.join(' » ')
    haml :boxes
  else
    @title = 'Dashboards'
    @error = "Unknown dashboard '#{@dashboard}'."
    @dashboards = dashboards
    haml :boxes
  end
end
