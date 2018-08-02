function Folder(name){
  this.folders=new Array();
  this.files=new Array();
  this.name=name;

  this.addChild=function(child){
    if((typeof child)=="string"){
      this.files.push(child);
    }else{
      this.folders.push(child);
    }
    return child;
  };
  this.getInstances=function(file){
    var i=0;
    if(this.files.includes(file)) i++;
    for(var a=0;a<this.folders.length;a++){
      i+=this.folders[a].getInstances(file);
    }
    return i;
  };
  this.getFolder=function(folders){
    var current=this;
    for(var a=0;a<folders.length;a++){
      if(folders[a]==this.name){
        break;
      }
      for(var b=0;b<this.folders.length;b++){
        if(this.folders[b].name==folders[a]){
          current=this.folders[b];
          break;
        }
      }
      if(current==this) current=this.addChild(new Folder(folders[a]));
    }
    return current;
  };
  this.getDeepestLevel=function(level,file){
    var deepest=this.files.includes(file)?level:-1;
    for(var a=0;a<this.folders.length;a++){
      var d=this.folders[a].getDeepestLevel(level+1,file);
      deepest=deepest>d?deepest:d;
    }
    return deepest;
  };
}
module.exports=Folder;
