const Folder=require("./tree.js");
const resolve=require("path").resolve;

var root=new Folder("");
var files=new Array();

// Publicly-accessed functions
module.exports={
  addPage:function(path){
    root.getFolder(path).addChild("index.html");
  },
  addFile:function(build,dir,name){
    // Fix this, find out what's up with build
    // Refactor for use with resolve
    root.getFolder(dir.substring(build.length+1).split("/")).addChild(name);
    files.push(name);
  },
  consolidate:function(){
    for(var a=0;a<files.length;a++){
      while(root.getInstances(files[a])>1){
        var d=root.getDeepestLevel(0,files[a]);
        ascend(root,0,files[a],d);
      }
    }
  },
  getPath:function(file){
    if(file.substring(file.length-5)==".html") return file.substring(0,file.length-5);
    return getPathAuxiliary(root,file);
  },
  getFileDepth:function(file){
    return files.includes(file)?getFileDepthAuxiliary(root,0,file):0;
  }
}

// Recursive functions
function getFileDepthAuxiliary(folder,level,file){
  if(folder.files.includes(file)) return level;
  for(var a=0;a<folder.folders.length;a++){
    var result=getFileDepthAuxiliary(folder.folders[a],level+1,file);
    if(result!=null) return result;
  }
  return null;
}
function getPathAuxiliary(folder,file){
  if (folder.files.includes(file)) return [folder.name];
  for(var a=0;a<folder.folders.length;a++){
    var result=getPathAuxiliary(folder.folders[a],file);
    if(result!=null){
      var value=[folder.name];
      for(var b=0;b<result.length;b++){
        value.push(result[b]);
      }
      console.log(value);
      return value;
    }
  }
  return null;
}
function ascend(folder,level,file,deepest){
  if(level==deepest){
    if(folder.files.includes(file)) return folder.files.splice(folder.files.indexOf(file),1)[0];
  }else{
    for(var a=0;a<folder.folders.length;a++){
      var result=ascend(folder.folders[a],level+1,file,deepest);
      if(result!=null && !folder.files.includes(result)) folder.files.push(result);
    }
  }
  return null;
}
