const fs=require("fs");

module.exports={
  checkForDirectories:function(path){
    var dirs=["components","pages","styles","scripts"];
    for(var a=0;a<dirs.length;a++){
      if(!fs.existsSync(path+"/"+dirs[a])){
        console.log("Missing directory",dirs[a]);
        process.exit();
      }
    }
  },
  ensureNoDir:function(dir,files){
    for(var a=0;a<files.length;a++){
      if(files[a].includes("/")){
        console.log("You're not supposed to have any subdirectories in",dir);
        process.exit();
      }
    }
  },
  cssError:function(comp){
    console.log("CSS error in component",comp);
    process.exit();
  }
}
