# -*- coding: utf-8 -*-
class Dash

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
  
end
