const resolve=require("path").resolve;
const html=require("./html-base.js")
const fs=require("fs");

module.exports=function(params){
  // Setup working directory
  const path=params.length==0?".":params[0];
  if(path!="." && !fs.existsSync(path)) fs.mkdirSync(path);

  // Create required folders
  var folders=["components","scripts","styles","pages"];
  for(var a=0;a<folders.length;a++){
    var fpath=resolve(path,folders[a]);
    if(!fs.existsSync(fpath)) fs.mkdirSync(fpath);
  }

  fs.writeFileSync(path+"/pages/index.html",html);
  console.log("Webstatic directory initialized");
}
