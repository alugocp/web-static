// Import
const build=require("./build/build.js");
const init=require("./init/init.js");
const open=require("./open/open.js");
const auto=require("./auto/auto.js");

function isHelp(f){
  return f=="-h" || f=="--h" || f=="-help" || f=="--help" || f=="help";
}

// Check for command
if(process.argv.length==2 || isHelp(process.argv[2])){
  console.log("Usage: static (init|build|open|push)");
  console.log(" init:\tInitializes the target or current directory as a WebStatic front-end project");
  console.log(" build:\tBuilds the target or current WebStatic front-end project");
  console.log(" auto:\tStarts a build daemon for the current or target directory");
  console.log(" open:\tOpens the target or current WebStatic project in your default browser");
  console.log(" push:\tUploads the target or current WebStatic project's build to GitHub");
  process.exit();
}
const command=process.argv[2];
const params=process.argv.slice(3,process.argv.length);

// Run proper command
if(command=="init") init(params);
else if(command=="build") build(params);
else if(command=="open") open(params);
else if(command=="auto") auto(params);
else if(["push","decommit"].includes(command)){

  const GitCommand=require("./enabled-git/git.js");
  const git=new GitCommand(params);
  if(command=="decommit"){
    console.log("Please don't use the","decommit".green,"command, it's unstable and soon to be deprecated");
    //git.decommit();
  }else if(command=="push") git.push();

}else console.log("Command '"+command+"' not found");
