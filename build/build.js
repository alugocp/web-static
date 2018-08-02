const comp=require("./components.js");
const depend=require("./depend.js");
const error=require("./error.js");
const resolve=require("path").resolve;
const copydir=require("copy-dir");
const cheerio=require("cheerio");
const rimraf=require("rimraf");
const fs=require("fs");

module.exports=function(params){
  const path=params.length==0?".":params[0];
  error.check.exists(path);

  // Process folders
  const build=resolve(path,".build");
  rimraf(resolve(build,"*"),function(){
    if(!fs.existsSync(build)) fs.mkdirSync(build);
    buildProcess(path,build);
  });
}
function buildProcess(path,build){
  var components=getProjectFolder(resolve(path,"components"),".html");
  var scripts=getProjectFolder(resolve(path,"scripts"),".js");
  var styles=getProjectFolder(resolve(path,"styles"),".css");
  var pages=getProjectFolder(resolve(path,"pages"),".html");

  pages.forEach(function(file){
    var dir=addPageToBuild(build,file);
    if(!fs.existsSync(dir)) fs.mkdirSync(dir);
    var $=cheerio.load(fs.readFileSync(resolve(path,"pages",file)));

    $(".component").each(function(){
      comp.getDependencies(
        path,comp.getClass(components,$(this).attr("class")),scripts,styles
      ).forEach(function(d){
        depend.addFile(build,dir,d);
      });
    });
    $("link[rel=stylesheet]").each(function(){
      if(styles.includes($(this).attr("href"))) depend.addFile(build,dir,$(this).attr("href"));
    });
    $("script").each(function(){
      if(scripts.includes($(this).attr("src"))) depend.addFile(build,dir,$(this).attr("src"));
    });
  });

  depend.consolidate();
  buildProjectFolder(path,build,"scripts",scripts);
  buildProjectFolder(path,build,"styles",styles);

  pages.forEach(function(file){
    var $=cheerio.load(fs.readFileSync(resolve(path,"pages",file)));
    $("head").prepend("<!-- Built with WebStatic v1 -->");
    $(".component").each(function(){
      $(this).html(comp.scopeify(
        path,comp.getClass(components,$(this).attr("class")),scripts,styles
      ));
    });

    var depth=(file=="index.html"?0:1);
    $("*").each(function(){
      var src=$(this).attr("src");
      var href=$(this).attr("href");
      if(src!=undefined) $(this).attr("src","../".repeat(depth-depend.getFileDepth(src))+src);
      if(!$(this).is("a") && href!=undefined && !href.includes("://")) $(this).attr("href","../".repeat(depth-depend.getFileDepth(href))+href);
    });
    fs.writeFileSync(resolve(build,depth==0?"":depend.getPath(file),"index.html"),$.html());
  });

  fs.readdirSync(path).forEach(function(obj){
    var obuild=resolve(build,obj);
    var opath=resolve(path,obj);
    if(fs.lstatSync(opath).isFile()){
      fs.copyFileSync(opath,obuild);
    }else if(!(obj=="pages" || obj=="scripts" || obj=="styles" || obj=="components" || obj==".build")){
      if(!fs.existsSync(obuild)) fs.mkdirSync(obuild);
      copydir.sync(opath,obuild);
    }
  });
  error.passed();
}

function getProjectFolder(dirpath,type){
  var files=fs.existsSync(dirpath)?fs.readdirSync(dirpath):[];
  error.check.noChildren(dirpath,files);
  error.check.filetype(dirpath,files,type);
  return files;
}
function buildProjectFolder(path,build,dir,files){
  files.forEach(function(file){
    fs.copyFileSync(
      resolve(path,dir,file),
      resolve.apply(null,[build].concat(depend.getPath(file)).concat([file]))
    );
  });
}
function addPageToBuild(build,file){
  var dir=file.substring(0,file.length-5);
  if(dir=="index"){
    depend.addPage([]);
    return build;
  }
  depend.addPage(dir);
  dir=resolve(build,dir);
  if(!fs.existsSync(dir)) fs.mkdirSync(dir);
  return dir;
}
