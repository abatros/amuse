import { Meteor } from 'meteor/meteor';

import http_server from './http-server.js'

Meteor.startup(() => {
  // code to run on server at startup
  http_server.startup();
});

// StaticServer.add('/static', '/home/dkz/museum-v9');
