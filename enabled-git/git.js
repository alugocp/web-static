const resolve=require("path").resolve;
const readline = require("readline");
const colors=require("colors");
const fs=require("fs");

function gitError(msg){
  if(msg) process.exit(console.log("GIT ERROR".red,msg));
}
function parseParams(params){
  var p={dir:".",branch:"master"}
  var a=0;
  while(a<params.length){
    if(params[a]=="--branch"){
      if(params.length>a+1) p.branch=params[++a];
      else gitError("Destination branch not specified");
    }else p.dir=params[a];
    a++;
  }
  return p;
}

module.exports=function(params){
  params=parseParams(params);
  const path=params.dir;
  if(!fs.existsSync(resolve(path,".git"))) gitError("Target is not a git directory")
  const git=require("simple-git")(path);

  /*this.decommit=async function(){
    await git.raw(["reset","--hard","HEAD^"],(err,result) => {
      if(err) gitError(err);
      process.exit(console.log("Decommit".green,"successful"));
    });
  }*/

  this.push=function(){

    // capture .gitignore file contents
    ignorePath=resolve(path,".gitignore");
    var ignore=(
      fs.existsSync(ignorePath)?
      fs.readFileSync(ignorePath).toString().split("\n"):
      []
    );
    for(var a=0;a<ignore.length;a++) ignore[a]=ignore[a].trim();

    // add .build to .gitignore
    if(!ignore.includes(".build")) ignore.push(".build");
    fs.writeFileSync(ignorePath,ignore.join("\n"));

    var rl=readline.createInterface({
      input:process.stdin,
      output:process.stdout
    });
    rl.question("Please add a commit message: ",async function(message){
      rl.close();
      git.branchLocal(async function(err,br){
        if(!br.branches["source"]) await git.raw(["checkout","-b","source"]);
        await git.add(".").commit(message).push("origin","source",(err,result) => gitError(err));

        // remove .build from .gitignore
        ignore.splice(ignore.indexOf(".build"),1);
        fs.writeFileSync(ignorePath,ignore.join("\n"));

        // upload .build to gh-pages
        await git.add(".build").commit(message).raw([
          "subtree","push","--prefix",".build","origin",params.branch
        ],(err,result) => gitError(err));
        console.log("Push".green,"complete");
        process.exit();
      });
    });
  }
}
