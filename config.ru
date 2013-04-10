require 'rubygems'
require 'sinatra'

require File.join(File.dirname(__FILE__), 'server.rb')
run Sinatra::Application
