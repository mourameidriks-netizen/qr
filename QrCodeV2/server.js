http://localhost:3000
const http=require("http"),fs=require("fs"),path=require("path");
const types={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".png":"image/png"};
http.createServer((req,res)=>{let p=req.url.split("?")[0];if(p=="/")p="/index.html";
 const f=path.join(__dirname,path.normalize(p).replace(/^(\.\.[\/\\])+/,""));
 fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);return res.end("Não encontrado")}res.writeHead(200,{"Content-Type":types[path.extname(f)]||"application/octet-stream"});res.end(d)})
}).listen(3000,"127.0.0.1",()=>console.log("QR Generator rodando em http://localhost:3000 (feche esta janela para parar)"));
