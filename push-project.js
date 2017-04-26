
var fs = require('fs');
var path = require('path');

var request = require('request');
var useragent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36';

// silence logging ...
var log = function() {};
// var log = console.log;


// export login and push functions seperately ...
module.exports = {
  login: login,
  push: create_and_push,
  push_project: push_project
};

// login and push
function push_project(username, projectId, callback) {

  var jar = request.jar();

  login(username, jar,
  function(jar) {
    create(projectId, jar,
    function(jar) {
      push(username, projectId, jar,
      function(jar) {
        log('done.');
        callback(jar);
      });
    });
  });

}


function create_and_push(username, projectId, jar, callback) {

  jar = jar || request.jar();

  create(projectId, jar,
  function(jar) {
    push(username, projectId, jar,
    function(jar) {
      log('done.');
      callback(jar);
    });
  });

}


// just login
function login(username, jar, callback) {

  // password is defined by an environment variable
  var password =process.env.NODEBOX_PASSWORD;

  if(!password) {
    console.error('$NODEBOX_PASSWORD is not defined!');
    process.exit(1);
  }

  log('logging in as', username);

  jar = jar || request.jar();

  var url = 'https://nodebox.live/login';

  var headers = {
    'User-Agent': useragent,
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  var form = {
    'login': username,
    'password': password
  };


  request.post({
    url: url,
    form: form,
    headers: headers,
    followAllRedirects: true,
    jar: jar
  },
  function (error, response, body) {
    if (!error  && response.statusCode === 200) {
      log( 'logged in successfully' );
      callback(jar);
    } else {
      console.error(body);
    }
  });

}


function create(projectId, jar, callback) {

  log('creating %s.', projectId);

  jar = jar || request.jar();

  var url = 'https://nodebox.live/projects/create';

  var headers = {
    'User-Agent': useragent,
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  var form = {
    'access': 'public',
    'projectId': projectId,
    'template': 'graphics'
  };

  request.post({
    url: url,
    form: form,
    headers: headers,
    followAllRedirects: true,
    jar: jar
  },
  function (error, response, body) {
    if (!error && response.statusCode === 200 ) {
      log( 'project created successfully' );
      callback(jar);
    } else {
      console.error(body);
    }
  });

}


function push(username, projectId, jar, callback) {

  jar = jar || request.jar();

  var filename = path.join('projects', projectId + '.json');

  var json = fs.readFile( filename, function(err, data) {

    if (err) throw err;

    log('reading %s', filename);

    var json = JSON.parse(data);

    var url = [ 'https://nodebox.live', 'api', 'projects', username, projectId ].join('/');

    var headers = {
      'User-Agent': useragent,
      'content-type': 'application/json',
    };

    request.post({
      url: url,
      json: json,
      headers: headers,
      followAllRedirects: true,
      jar: jar
    },
    function (error, response, body) {
      if (!error && response.statusCode === 200 ) {
        log( 'project pushed successfully' );
        callback(jar);
      } else {
        console.error(body);
      }
    });

  });

}
