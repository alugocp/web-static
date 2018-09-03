const build=require("../build/build.js");
const resolve=require("path").resolve;
const lib=require("../lib.js");
const fs=require("fs");

function checkFolder(path){
  var dir=[];
  fs.readdirSync(path).forEach((file) => {
    if(!lib.ignoreInBuild(file)){
      var fpath=resolve(path,file);
      var stats=fs.lstatSync(fpath);
      dir.push(stats.isFile()?stats.mtime:checkFolder(fpath));
    }
  });
  return dir;
}
function isSame(obj1,obj2){
  if(!Array.isArray(obj1)) return !(obj1-obj2);
  if(obj1.length!=obj2.length) return false;
  for(var a=0;a<obj1.length;a++){
    if(!isSame(obj1[a],obj2[a])) return false;
  }
  return true;
}

module.exports=async function(params){
  const path=(params.length==0)?".":params[0];
  var oldTree,newTree;

  while(true){
    newTree=checkFolder(path);
    if(oldTree){
      if(!isSame(newTree,oldTree)) build(params);
      await new Promise(accept => setTimeout(accept,3000));
    }
    oldTree=newTree;
  }
}
