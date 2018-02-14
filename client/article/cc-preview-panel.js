const app = require('../client-app.js');

Template.preview_panel.onCreated(function(){});

Template.preview_panel.onRendered(function(){});

Template.preview_panel.helpers({
  it() {
    return app.state.get('meta');
  },
  isTranscription() {
    let _meta = app.state.get('meta')
    return (_meta && (_meta.flag == 'T'));
  },
  part(x) {
    if (x>0) {
      return `part:${x+1} - `;
    }
  }

});
