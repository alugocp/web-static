const error=require("./error.js");
const resolve=require("path").resolve;
const opn=require("opn");
const fs=require("fs");

module.exports=function(params){
  const path=resolve(
    process.cwd(),
    params.length==0?"":params[0],
    ".build",
    "index.html"
  );
  if(fs.existsSync(path)){
    opn("file://"+path,{wait:false});
  }else{
    error.buildPathError(path);
  }
}
