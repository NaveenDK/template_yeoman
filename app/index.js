'use strict';

var generators = require('yeoman-generator');
var titleInput;

module.exports = class extends generators{
    method1(){
        this.log('Hello World');
    }
   prompting(){
        this.log("test prompt")
        return this.prompt([{
          type:'input',
          name:'name',
          message:'what is your project name',
          default:this.appname
        }]).then((answers)=>{
          this.log('app name',answers.name)
          titleInput=answers.name;
        })
   }
    writing()
    {
      this.fs.copyTpl(
          this.templatePath('ReactWebApp'),
          this.destinationPath('src/ReactWebApp'),
         { title: titleInput}
  
 
      )
  }
    
  /*  prompting() {
      return this.prompt([{
        type    : 'input',
        name    : 'title',
        message : 'Your project name',
        default : this.appname // Default to current folder name
      }]).then((answers) => {
        this.log('app name', answers.name);
      
      });*/

     
    



}
