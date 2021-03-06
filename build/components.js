const csstree=require("css-tree");
const error=require("./error.js");
const cheerio=require("cheerio");
const fs=require("fs");

// Main scope-ify method
module.exports={
  getDependencies:function(path,comp,scripts,styles){
    var $=cheerio.load(fs.readFileSync(path+"/components/"+comp+".html"));

    var d=[];
    $("script").each(function(){
      var src=$(this).attr("src");
      if(src!=undefined && scripts.includes(src)){
        d.push(src);
      }
    });
    $("link[rel=stylesheet]").each(function(){
      var href=$(this).attr("href");
      if(href!=undefined && styles.includes(href)){
        d.push(href);
      }
    });
    return d;
  },
  getClass:function(components,c){
    var classes=c.split(/\s+/);
    for(var b=0;b<classes.length;b++){
      if(components.includes(classes[b]+".html")){
        return classes[b];
      }
    }
    return null;
    //error.comp("No valid component name in ("+classes.join(", ")+")");
  },

  scopeify:function(path,comp,scripts,styles){
    var $=cheerio.load(
      fs.readFileSync(path+"/components/"+comp+".html")
    );
    $("script").each(function(){
      var src=$(this).attr("src");
      if(src==undefined){
        $(this).html(scopeifyScript(comp,$(this).html()));
      }else if(!src.includes("://")){
        $(this).html(scopeifyScript(comp,getHtml(path,src,scripts,"scripts")));
        $(this).removeAttr("src");
      }
    });
    $("style").each(function(){
      $(this).html(scopeifyStyle(comp,$(this).html()));
    });
    $("link[rel=stylesheet]").each(function(){
      var href=$(this).attr("href");
      if(href!=undefined && !href.includes("://")){
        var tag=$("<style>");
        tag.html(scopeifyStyle(comp,getHtml(path,href,styles,"styles")));
        $(this).after(tag);
        $(this).remove();
      }
    });
    return $.html();
  }
}

// Auxiliary scope-ify methods
function scopeifyScript(comp,data){
  var quotes=["\"","'","\\\""];
  var selector=".component."+comp+" ";
  var double=selector+"."+comp;
  for(var a=0;a<quotes.length;a++){
    data=data.split("$("+quotes[a]).join("$("+quotes[a]+selector);
    data=data.split("$("+quotes[a]+double).join("$("+quotes[a]+"."+comp);
  }
  return data;
}
/*function scopeifyStyle(comp,data){
  var selector=".component."+comp+" ";
  var ast=csstree.parse(data);
  csstree.walk(ast,{enter:function(node){
    if(node.type=="SelectorList"){*/
      /*node.children.head={
        prev:null,
        next:node.children.head,
        data:{type:"ClassSelector",loc:null,name:"Hi"}
      };
      node.children.head.next.prev=node.children.head;
      node.children.unshift(node.children.head);*/
      /*console.log(node);
    }
  }});
  return csstree.generate(ast);
}*/
function scopeifyStyle(comp,data){
  var cbClose=0;
  var cbOpen=data.indexOf("{");
  var selector=".component."+comp+" ";
  while(cbOpen!=-1){
    var segment=data.substring(cbClose,cbOpen);
    var parsed=segment.replace(/\s+/g,"").replace("}","");
    var insert=cbClose+segment.indexOf(parsed[0]);
    if(parsed!="."+comp){
      data=data.substring(0,insert)+selector+data.substring(insert);
    }
    cbClose=data.indexOf("}",cbOpen);
    if(cbClose==-1){
      error.css(comp,"Missing a close bracket");
    }
    cbOpen=data.indexOf("{",cbClose);
  }
  return data;
}

// Miscellaneous auxiliary methods
function getHtml(path,file,dir,dirname){
  return cheerio.load(fs.readFileSync(
    dir.includes(file)?
    path+"/"+dirname+"/"+file:
    path+"/"+file
  )).html();
}
