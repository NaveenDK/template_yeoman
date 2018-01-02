'use strict';

var generators = require('yeoman-generator');

module.exports = class extends generators{
    method1(){
        this.log('Hello World');
    }

     writing()
      {
        this.fs.copyTpl(
            this.templatePath('ReactWebApp'),
            this.destinationPath('src/ReactWebApp')
          // {title: Test }
        )
    }
    




}


    ///////
  /*  prompting() {
        return this.prompt([{
          type    : 'input',
          name    : 'name',
          message : 'Your project name',
          default : this.appname // Default to current folder name
        }, {
          type    : 'confirm',
          name    : 'cool',
          message : 'Would you like to enable the Cool feature?'
        }]).then((answers) => {
          this.log('app name', answers.name);
          this.log('cool feature', answers.cool);
        });
      }*/
    //