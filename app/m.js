require('dotenv').load();
var VERSION = "v0.10";
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');
var Generator = require('yeoman-generator');
var mkdirp = require('mkdirp');
var promptOptions = {};

module.exports = Generator.extend({
  constructor: function() {
    Generator.apply(this, arguments);
    this.destinationRoot('./out');
    this.conflicter.force = true;
    console.log("Welcome to pacy install script " + VERSION);
  },
  initializing: function() {
    var portCheckCmd = 'netstat -tapn | grep 400 | grep LISTEN | awk -F \' \' \'{print $4}\' | awk -F \':\' \'{print $2}\'';
    var spawnSync = require('child_process').spawnSync;
    var spawn = spawnSync('sh', ['-c', portCheckCmd], { stdio: 'pipe', encoding : 'utf8' });
    if(spawn.status === 0) {
      console.log("Current pacy ports in use:");
      console.log(spawn.stdout);
    } else {
      console.log("Error getting ports in use");
    }
  },
  prompting: function() {
    return this.prompt([
      {
        type: 'input',
        name: 'instanceName',
        message: 'Instance name e.g. customwebsite',
        store: true
      },
      {
        type: 'input',
        name: 'instancePort',
        message: 'Port to run on',
        store: true
      },
      {
        type: 'input',
        name: 'adminEmail',
        message: 'Email to send initial instance details to',
        default: 'admin@customwebsite.co.nz',
        store: true
      }
    ]).then(function(answers) {
      promptOptions = answers;
    });
  },
  method1: function() {
    var done = this.async();
    this._createSubdomain().then(function() {
      console.log("Created subdomain in Route 53");
      done();
    }).catch(function(err) {
      console.log(err);
    });
  },
  writing: function() {
    this._initializeFolders();
    this._clonePacyRepo();
    this.fs.copyTpl(this.templatePath('_.env'), this.destinationPath('_.env'), promptOptions);
    this.fs.copy(this.destinationPath('_.env'), process.env.BASE_INSTANCE_INSTALL_DIR + promptOptions.instanceName + ".pacy.io/app/.env");
    this.fs.copyTpl(this.templatePath('nginx-vhost'), this.destinationPath(promptOptions.instanceName + '.pacy.io-80'), promptOptions);
    this.fs.copyTpl(this.templatePath('nginx-vhost-ssl'), this.destinationPath(promptOptions.instanceName + '.pacy.io-443'), promptOptions);

  },
  install: function() {
    var dir = process.env.BASE_INSTANCE_INSTALL_DIR + promptOptions.instanceName + ".pacy.io/app";
    console.log("Installing npm: " + dir);
    process.chdir(dir);
    this.npmInstall();
  },
  end: function() {
    this._setupPm2();
    console.log("Jobs Done!");
  },
  _createSubdomain: function() {
    var route53 = new AWS.Route53();
    return new Promise(function(resolve, reject) {
      var params = {
        HostedZoneId: '/hostedzone/Z3QJ7G124YC0MV', //pacy.io
        ChangeBatch: {
          Changes: [
            {
              Action: 'CREATE',
              ResourceRecordSet: {
                Name: promptOptions.instanceName + '.pacy.io',
                Type: 'A',
                TTL: 300,
                ResourceRecords: [
                  {
                    Value: process.env.PACY_SERVER
                  }
                ]
              }
            }
          ]
        }
      };
      route53.changeResourceRecordSets(params, function(err, data) {
        if(err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  },
  _initializeFolders: function() {
    mkdirp.sync(process.env.BASE_INSTANCE_INSTALL_DIR + promptOptions.instanceName + ".pacy.io/app");
    mkdirp.sync(process.env.BASE_INSTANCE_INSTALL_DIR + promptOptions.instanceName + ".pacy.io/logs");
  },
  _clonePacyRepo: function() {
    var cloneCmd = 'git clone ssh://git@' + process.env.GIT_HOST + '/ri/passwd-web.git ' + process.env.BASE_INSTANCE_INSTALL_DIR + promptOptions.instanceName + ".pacy.io/app";
    var spawnSync = require('child_process').spawnSync;
    var spawn = spawnSync('sh', ['-c', cloneCmd], { stdio: 'pipe', encoding : 'utf8' });
    if(spawn.status === 0) {
      console.log(spawn.stdout);
    } else {
      console.log("Error cloning pacy repo");
      console.log(spawn.stderr);
    }
  },
  _setupPm2: function() {
    var spawnPm2StartSync = require('child_process').spawnSync;
    var spawnPm2StartupSync = require('child_process').spawnSync;
    var spawnPm2SaveSync = require('child_process').spawnSync;
    //process.chdir(process.env.BASE_INSTANCE_INSTALL_DIR + promptOptions.instanceName + ".pacy.io/app");

    var pm2Start = spawnPm2StartSync('pm2', ['start', 'app.js', '--name', promptOptions.instanceName + '.pacy.io'], { stdio: 'pipe', encoding : 'utf8' });
    if(pm2Start.status === 0) {
      console.log("Started PM2 process");
      console.log(pm2Start.stdout);
      var pm2Save = spawnPm2SaveSync('pm2', ['save'], { stdio: 'pipe', encoding : 'utf8' });
      if(pm2Save.status === 0) {
        console.log("Saving PM2 process list");
        console.log(pm2Save.stdout);
      } else {
        console.log(pm2Save.stderr);
      }

    } else {
      console.log("Error starting PM2 process");
      console.log(pm2Start.stderr);
    }

  }
});