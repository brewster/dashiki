Dash.namespace('Overview');

Dash.Overview = function(cfg) {
  this.from = '-1h';
  this.classes = [ 'red' ];
  this.element = '#overview';
  $.extend(true, this, cfg);
  this.projects = [];
  return this;
}

Dash.Overview.prototype = {

  // return true if array of classes intersects with the requested classes
  intersects: function(classes) {
    return function(a, b) {
      var match = false,
          i = j = 0,
          alen = a.length,
          blen = b.length;
      while ( !match && i<alen ) {
        while ( !match && j<blen ) {
          (a[i] == b[j++]) && (match = true);
        }
        j=0, i++;
      }
      return match;
    }(this.classes, classes);
  },

  // return subset of stats that could potentially match
  matchingStats: function(stats) {
    var self = this;
    return stats.filter(function(stat) {
      return stat.thresholds && stat.thresholds.filter(function(threshold) {
        return self.intersects(threshold.class.split(/[\s,]+/));
      }).length > 0;
    });
  },

  project: function(project, path) {
    project.div = $('<div>');
    $(this.element).append(project.div); // add to dom now so in alpha order

    var self = this;
    project.ready(function() {
      project.stats = self.matchingStats(project.stats);
      if ( project.stats.length > 0 ) {
        project.path = path;
        self
          .createRow(project)
          .updateProject(project)
          .projects.push(project);
      } else {
        project.div.remove();           // nothing matches, rm from dom
      }
    });
    return this;
  },

  // update all stats for a project, show them if they match class list
  updateProject: function(project) {
    var self = this;
    project.row.empty();  // clear currently-displayed stats
    project.title.hide(); // hide title, will re-show below if any stats match

    project.stats.forEach(function(stat) {
      stat.update(self, function() {
        if ( self.intersects(stat.classes) ) {
          project.title.show();
          project.row.append(self.createBox(stat));
        }
      });
    });
    return this;
  },

  // update everything
  update: function(from) {
    (from != undefined) && (this.from = from);
    this.projects.forEach(function(project) {
      this.updateProject(project);
    }, this);
    return this;
  },

  // create row in dom to display given project
  createRow: function(project) {
    project.title = $('<div>')
      .attr('class', 'span2 statbox project')
      .append($('<a>', { 'href': project.path.join('/') }).text(project.path.join(' » ')));
    project.row = $('<div>').attr('class', 'row');
    project.div.append(project.title, project.row);
    return this;
  },

  // create dom element to display given stat
  createBox: function(stat) {
    stat.box = $('<div>')
      .attr('class', ['statbox'].concat(stat.classes).join(' '))
      .append(
        $('<span>', { class: 'title' }).text(stat.title),
        $('<div>',  { class: 'value' }).text(stat.value)
      )
    return $('<div>', {class: 'span1'}).append(stat.box);
  }

};
