// Heirarchy node
function Folder(name){
  this._folders=new Array();
  this._files=new Array();
  this.name=name;

  this.addChild=function(child){
    if((typeof child)=="string"){
      this._files.push(child);
    }else{
      this._folders.push(child);
    }
    return child;
  };
  this.getInstances=function(file){
    var i=0;
    if(this._files.includes(file)) i++;
    for(var a=0;a<this._folders.length;a++){
      i+=this._folders[a].getInstances(file);
    }
    return i;
  };
  this.getFolder=function(folders){
    var current=this;
    for(var a=0;a<folders.length;a++){
      for(var b=0;b<this._folders.length;b++){
        if(this._folders[b].name==folders[a]){
          current=this._folders[b];
          break;
        }
      }
      if(current==this) current=this.addChild(new Folder(folders[a]));
    }
    return current;
  };
}
var root=new Folder("");
var files=new Array();

// Publicly-accessed functions
module.exports={
  addPage:function(path){
    root.getFolder(path).addChild("index.html");
  },
  addFile:function(dir,name){
    root.getFolder(dir.split("/")).addChild(name);
    files.push(name);
  },
  consolidate:function(){
    for(var a=0;a<files.length;a++){
      while(root.getInstances(files[a])>1){
        var deepest=getDeepestLevel(root,0,files[a]);
        ascendAuxiliary(root,0,files[a],deepest);
      }
    }
  },
  getPath:function(file){
    return getPathAuxiliary(root,file).join("/");
  },
  getFileDepth:function(file){
    return files.includes(file)?getFileDepthAuxiliary(root,0,file):0;
  }
}

// Export auxiliary functions
function getFileDepthAuxiliary(folder,level,file){
  if(folder._files.includes(file)) return level;
  for(var a=0;a<folder._folders.length;a++){
    var result=getFileDepthAuxiliary(folder._folders[a],level+1,file);
    if(result!=null) return result;
  }
  return null;
}
function getPathAuxiliary(folder,file){
  if (folder._files.includes(file)) return [folder.name];
  for(var a=0;a<folder._folders.length;a++){
    var result=getPathAuxiliary(folder._folders[a],file);
    if(result!=null){
      var value=[folder.name];
      for(var b=0;b<result.length;b++){
        value.push(result[b]);
      }
      return value;
    }
  }
  return null;
}
function getDeepestLevel(folder,level,file){
  var deepest=folder._files.includes(file)?level:-1;
  for(var a=0;a<folder._folders.length;a++){
    var d=getDeepestLevel(folder._folders[a],level+1,file);
    deepest=deepest>d?deepest:d;
  }
  return deepest;
}
function ascendAuxiliary(folder,level,file,deepest){
  if(level==deepest){
    if(folder._files.includes(file)) return folder._files.splice(folder._files.indexOf(file),1)[0];
  }else{
    for(var a=0;a<folder._folders.length;a++){
      var result=ascendAuxiliary(folder._folders[a],level+1,file,deepest);
      if(result!=null && !folder._files.includes(result)) folder._files.push(result);
    }
  }
  return null;
}
