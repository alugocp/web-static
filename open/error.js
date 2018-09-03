const colors=require("colors");

module.exports={
  buildPathError:function(path){
    console.log("OPEN ERROR".red,path,"does not exist");
    process.exit();
  }
}
