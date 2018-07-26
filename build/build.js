const comp=require("./components.js");
const depend=require("./depend.js");
const error=require("./error.js");
const copydir=require("copy-dir");
const cheerio=require("cheerio");
const rimraf=require("rimraf");
const path=require("path");
const fs=require("fs");

// Main build process
function buildProcess(path){
  var components=fs.readdirSync(path+"/components");
  var scripts=fs.readdirSync(path+"/scripts");
  var styles=fs.readdirSync(path+"/styles");
  var pages=fs.readdirSync(path+"/pages");
  error.ensureNoDir("components",components);
  error.ensureNoDir("scripts",scripts);
  error.ensureNoDir("styles",styles);
  error.ensureNoDir("pages",pages);

  // Setup build heirarchy
  pages.forEach(function(file){
    var dir=addPageToBuild(file);
    if(!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }
    var $=cheerio.load(
      fs.readFileSync(path+"/pages/"+file)
    );

    $(".component").each(function(){
      comp.getDependencies(
        path,comp.getClass(components,$(this).attr("class")),scripts,styles
      ).forEach(function(d){
        depend.addFile(dir,d);
      });
    });
    $("script").each(function(){
      if(scripts.includes($(this).attr("src"))){
        depend.addFile(dir,$(this).attr("src"));
      }
    });
    $("link[rel=stylesheet]").each(function(){
      if(styles.includes($(this).attr("href"))){
        depend.addFile(dir,$(this).attr("href"));
      }
    });
  });

  // Copy non-html files to correct filespaces
  depend.consolidate();
  scripts.forEach(function(file){
    fs.copyFileSync(
      path+"/scripts/"+file,
      build+"/"+depend.getPath(file)
    );
  });
  styles.forEach(function(file){
    fs.copyFileSync(
      path+"/styles/"+file,
      build+depend.getPath(file)+"/"+file
    );
  });

  // Process html
  pages.forEach(function(file){
    var dir=getPageDir(file);
    var $=cheerio.load(
      fs.readFileSync(path+"/pages/"+file)
    );
    $(".component").each(function(){
      $(this).html(comp.scopeify(
        path,comp.getClass(components,$(this).attr("class")),scripts,styles
      ));
    });

    var depth=getDepth(file);
    $("*").each(function(){
      var src=$(this).attr("src");
      if(src!=undefined){
        var d=depend.getFileDepth(src);
        $(this).attr("src","../".repeat(depth-d)+src);
      }
      var href=$(this).attr("href");
      if(href!=undefined && !href.includes("://")){
        var d=depend.getFileDepth(href);
        $(this).attr("href","../".repeat(depth-d)+href);
      }
    });

    fs.writeFileSync(dir+"/index.html",$.html());
  });

  // Copy other folders
  fs.readdirSync(path).forEach(function(obj){
    if(!fs.lstatSync(obj).isFile() && !(obj=="pages" || obj=="scripts" || obj=="styles" || obj=="components" || obj=="build")){
      if(!fs.existsSync(build+"/"+obj)){
        fs.mkdirSync(build+"/"+obj);
      }
      copydir.sync(path+"/"+obj,build+"/"+obj);
    }
  });
}
module.exports=function(params){
  // Load working directory
  const path=params.length==0?".":params[0];
  if(path!="." && !fs.existsSync(path)){
    console.log("Cannot find project path");
    process.exit();
  }

  // Process folders
  build=path+"/build";
  error.checkForDirectories(path);
  rimraf(build,function(){
    fs.mkdirSync(build);
    buildProcess(path);
  });
}

// Build folder population
var build;
function addPageToBuild(file){
  var dir=file.split(".");
  dir=dir.slice(0,dir.length-1);
  if(dir.length==1 && dir[0]=="index"){
    depend.addPage([]);
    return build;
  }
  depend.addPage(dir);
  dir=build+"/"+dir.join("/");
  if(!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  return dir;
}
function getPageDir(file){
  var dir=file.split(".");
  return dir.length==2 && dir[0]=="index"?build:
    build+"/"+dir.slice(0,dir.length-1).join("/");
}

// Miscellaneous
function getDepth(file){
  var pieces=file.split(".");
  if(pieces.length==2 && pieces[0]=="index"){
    return 0;
  }
  return pieces.length-1;
}

/* Build process:

for each page in pages
  import components
  scope-ify component references

*/
