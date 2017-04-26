
var async = require('async');
var path = require('path');
var fs = require('fs');

var push = require('./push-project').push;
var login = require('./push-project').login;

var account_file = path.join('accounts', 'test-accounts.txt');
var accounts = fs.readFileSync(account_file).toString().trim().split("\n");

var project_file = path.join('projects', 'projects.txt');
var projects = fs.readFileSync(project_file).toString().trim().split("\n");
var separator = '---------------------------------------';

// do it
push_workshop(accounts, projects);

// pushing projects in synchronous order (because we can)
function push_workshop(accounts, projects) {

  comboSeries(accounts, projects, login, push, {

    intro: function() {
      console.log(separator);
    },
    outerIntro: function(username) {
      console.log('pushing projects for', username);
      console.log(separator);
    },
    innerIntro: function(username, projectId) {
      console.log('pushing project', projectId);
    },
    innerOutro: function(username, projectId) {
      console.log('done pushing project');
    },
    outerOutro: function(username) {
      console.log('done pushing', username);
      console.log(separator);
    },
    outro: function() {
      console.log('done.');
    }
  });

}

// synchronous cross-product function application
// with inter-woven callback functions ...
function comboSeries(a1, a2, fn1, fn2, cb, c1) {
  cb.intro();
  async.forEachSeries(a1, function(e1, callback) {
    cb.outerIntro(e1);
    fn1(e1, c1, function(c2) {
      async.forEachSeries(a2, function(e2, callback) {
        cb.innerIntro(e1, e2);
        fn2(e1, e2, c2, function() {
          cb.innerOutro(e1, e2);
          callback();
        });
      }, function () {
        cb.outerOutro(e1);
        callback();
      } );
    });
  },
  cb.outro);
}
