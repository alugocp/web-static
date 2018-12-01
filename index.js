// Import
const build=require("./build/build.js");
const init=require("./init/init.js");
const open=require("./open/open.js");
const auto=require("./auto/auto.js");

function isHelp(f){
  return f.match(/\-(\-)?h(elp)?/) || f=="help";
}

// Check for command
if(process.argv.length==2 || isHelp(process.argv[2])){
  console.log("Usage: static (init|build|auto|open|push) [path]");
  console.log(" init:\tInitializes the path or current directory as a WebStatic front-end project");
  console.log(" build:\tBuilds the path or current WebStatic front-end project");
  console.log(" auto:\tStarts a build daemon for the path or current directory");
  console.log(" open:\tOpens the path or current WebStatic project in your default browser");
  console.log(" push:\tUploads the path or current WebStatic project's build to GitHub");
  process.exit();
}
const command=process.argv[2];
const params=process.argv.slice(3,process.argv.length);

// Run proper command
if(command=="init") init(params);
else if(command=="build") build(params);
else if(command=="open") open(params);
else if(command=="auto") auto(params);
else if(command=="push"){

  const GitCommand=require("./enabled-git/git.js");
  const git=new GitCommand(params);
  git.push();

}else console.log("WebStatic command '"+command+"' not found");
