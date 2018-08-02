const resolve=require("path").resolve;
const colors=require("colors");
const fs=require("fs");

module.exports={
  check:{
    exists:function(path){
      if(!fs.existsSync(path)){
        console.log("PATH ERROR".red,"Could not find path",path);
        process.exit();
      }
    },
    noChildren:function(path,files){
      for(var a=0;a<files.length;a++){
        if(!fs.lstatSync(resolve(path,files[a])).isFile()){
          console.log("PROJECT ERROR".red,"No folders allowed in",path);
          process.exit();
        }
      }
    },
    filetype:function(path,files,type){
      for(var a=0;a<files.length;a++){
        var f=files[a];
        if(f.length<type.length || f.substring(f.length-type.length)!=type){
          console.log("PROJECT ERROR".red,"Only",type,"files allowed in",path);
          process.exit();
        }
      }
    }
  },
  css:function(comp,extra){
    console.log("CSS ERROR".red," in ",comp);
    if(extra!=""){
      console.log(extra);
    }
    process.exit();
  },
  comp:function(extra){
    console.log("COMPONENT ERROR".red,extra);
    process.exit();
  },
  passed:function(){
    console.log("BUILD SUCCESSFUL".green);
  }
}
