// Import
const build=require("./build/build.js");
const init=require("./init/init.js");

module.exports=function(){
  // Check for command
  if(process.argv.length==2){
    console.log("Usage: static (init|build|push)");
    process.exit();
  }
  const command=process.argv[2];
  const params=process.argv.slice(3,process.argv.length);

  // Run proper command
  if(command=="init"){
    init(params);
  }else if(command=="build"){
    build(params);
  }else{
    console.log("Command '"+params[0]+"' not found");
  }
}
