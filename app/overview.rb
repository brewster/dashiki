## overview view of stats
class Dash

  get '/overview' do
    @classes = (params[:class] || params[:classes] || "red").split(/[\s,]+/)
    @title = "Overview " + @classes.map(&:capitalize).join(' | ')
    @dashboards = dashboards
    @projects = @dashboards.values.flatten(1)
    haml :overview
  end

end
