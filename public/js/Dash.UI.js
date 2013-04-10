Dash.namespace('UI');

Dash.UI = function() {
  this.interval = 15000;
  return this;
};

// update page title to stat title
Dash.UI.updatePageTitle = function(stat) {
  $('title').text(stat.title + ' (' + stat.value + ')');
  return this;
};

// update favicon to reflect value [and css of element]
Dash.UI.updateFaviconBadge = function(value, element) {
  var canvas = document.createElement('canvas'),
      img = document.createElement('img'),
      background_color = '#555',
      color = '#eee';

  if ( element != undefined ) {
    background_color = element.css('background-color') || background_color;
    color = element.css('color') || color;
  }

  if ( canvas.getContext ) {
    canvas.height = canvas.width = 16; // set the size
    var text = canvas.getContext('2d');
    img.onload = function () { // once the image has loaded
      text.drawImage(this, 0, 0);
      text.font = 'bold 9px "helvetica", sans-serif';
      var textValue = value.toString();
      var width = text.measureText(textValue).width;
      text.fillStyle = background_color;
      text.fillRect(0, 0, 20, 20);
      text.globalAlpha = 1.0;
      text.fillStyle = color;
      text.fillText(textValue, parseInt((17 - width) / 2), 11);
      $('#favicon').attr('href', canvas.toDataURL('image/png'));
    };
    img.src = '/favicon.ico';
  }

  return this;
};

Dash.UI.prototype = {

  // set refresh interval in msec for auto-play
  setInterval: function(value) {
    this.interval = value;
    return this;
  },
  
  // create play-pause control, triggers callback w/arg true/false for play/pause
  playPause: function(element, callback) {
    var icon = $(element).children('span'),
        self = this;
    $(element).click(function() {
      if ( icon.hasClass("icon-play") ) {
        icon.attr("class", "icon-pause icon-white");
        self.interval_id = setInterval(function() {
          callback(true);
        }, self.interval);
      } else {
        icon.attr("class", "icon-play icon-white");
        clearInterval(self.interval_id);
        callback(false);
      }
    });
    return this;
  },
    
  // create refresh control to trigger callback
  refresh: function(element, callback) {
    $(element).click(function() {
      callback();
    });
    return this;
  },

  // toggle event icon on or off
  eventsToggle: function(selector, on_callback, off_callback) {
    var icon = $(selector).children('i');
    
    $(selector).click(function() {
      if ( icon.hasClass('on') ) {
        off_callback();
      } else {
        on_callback();
      }
      icon.toggleClass('on');
    });
    
    return this;
  },

  
  // set up time period controls described by given selector
  timeControls: function(selector, callback) {
    this.times = $(selector);
    var presets = this.times.not('.dropdown'),
        other   = this.times.filter('.dropdown'),
        inputs  = other.find('input');
      
    presets.children('a').click(function(event) {
      event.preventDefault();                  // prevent page reload
      $(this).parent('li').addClass('active').siblings().removeClass('active');
      callback($(this).data('from'));
    });

    // on dropdown click, focus first input after dropdown appears
    other.children('a').click(function(event) {
      setTimeout(function() { inputs.first().focus() }, 700);
    });

    // add return key handler to dropdown text box
    inputs.keypress(function(event) {
      if (event.which == 13) {                    // return key in text input
        event.preventDefault();                   // prevent page reload
        other.addClass('active').siblings().removeClass('active');
        callback(this.value);
        other.filter('.open').click();              // dismiss dropdown
      }
    });

    return this;
  },

  // activate any time controls that match given from string
  timeSet: function(from) {
    $("ul.times li")
      .has("a[data-from='" + from + "']")
      .addClass('active');
    return this;
  },

  // create keybindings (FIXME: to be generic)
  bindKeys: function() {
    $(document).keyup(function(e) {
      if ( e.metaKey || e.ctrlKey ) {
        return;
      }
      switch (e.which) {
      case 69: // e
        $('.dash_event').click();
        break;
      case 80: // p
        $('#playpause').click();
        break;
      case 82: // r
        $('#refresh').click();
        break;
      case 79: // o
        $('ul.times li.dropdown a').click();
        break;
      case 191: // / or ?
        alert(
          "e: event text\n" +
            "o: other time period\n" +
            "p: toggle play/pause\n" +
            "r: refresh data\n" +
            "?: show keys"
        );
        break;
      default:
        return; // exit this handler for other keys
      }
      e.preventDefault();
    });
    return this;
  }

};
