module.exports={
  ignoreInBuild:function(file){
    ignores=[".build",".git",".gitignore","README.md"];
    return ignores.includes(file);
  }
}
