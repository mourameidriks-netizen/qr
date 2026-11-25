// NÃO MEXA NESTE ARQUIVO.
// Aqui fica o "cérebro" que transforma um texto em QR Code.
// ===== Gerador de QR (nível M, modo byte, versões 1-40) =====
const EC=[0,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28];
const BL=[0,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49];
const gmul=(x,y)=>{let z=0;for(let i=7;i>=0;i--){z=(z<<1)^((z>>>7)*0x11D);z^=((y>>>i)&1)*x}return z};
function rsDiv(d){const r=Array(d).fill(0);r[d-1]=1;let k=1;for(let i=0;i<d;i++){for(let j=0;j<d;j++){r[j]=gmul(r[j],k);if(j+1<d)r[j]^=r[j+1]}k=gmul(k,2)}return r}
function rsRem(dat,dv){const r=dv.map(()=>0);for(const b of dat){const f=b^r.shift();r.push(0);dv.forEach((c,i)=>r[i]^=gmul(c,f))}return r}
const raw=v=>{let r=(16*v+128)*v+64;if(v>=2){const a=Math.floor(v/7)+2;r-=(25*a-10)*a-55;if(v>=7)r-=36}return r};
function makeQR(text){
 const data=[...new TextEncoder().encode(text)];let v=1;
 for(;;v++){if(v>40)throw Error("Código muito longo");const cc=v<10?8:16;if(4+cc+data.length*8<=(Math.floor(raw(v)/8)-EC[v]*BL[v])*8)break}
 const cap=Math.floor(raw(v)/8)-EC[v]*BL[v],bits=[],put=(x,n)=>{for(let i=n-1;i>=0;i--)bits.push((x>>>i)&1)};
 put(4,4);put(data.length,v<10?8:16);data.forEach(b=>put(b,8));
 put(0,Math.min(4,cap*8-bits.length));put(0,(8-bits.length%8)%8);
 for(let p=0xEC;bits.length<cap*8;p^=0xEC^0x11)put(p,8);
 const cw=[];for(let i=0;i<bits.length;i+=8)cw.push(parseInt(bits.slice(i,i+8).join(""),2));
 const nb=BL[v],ne=EC[v],rc=Math.floor(raw(v)/8),ns=nb-rc%nb,sl=Math.floor(rc/nb),dv=rsDiv(ne),blocks=[];
 for(let i=0,k=0;i<nb;i++){const d=cw.slice(k,k+sl-ne+(i<ns?0:1));k+=d.length;const e=rsRem(d,dv);if(i<ns)d.push(0);blocks.push(d.concat(e))}
 const all=[];for(let i=0;i<blocks[0].length;i++)blocks.forEach((b,j)=>{if(i!=sl-ne||j>=ns)all.push(b[i])});
 const n=v*4+17,m=[],f=[];for(let i=0;i<n;i++){m.push(Array(n).fill(false));f.push(Array(n).fill(false))}
 const set=(x,y,d)=>{if(x>=0&&y>=0&&x<n&&y<n){m[y][x]=d;f[y][x]=true}};
 for(let i=0;i<n;i++){set(6,i,i%2==0);set(i,6,i%2==0)}
 for(const [cx,cy] of [[3,3],[n-4,3],[3,n-4]])for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const d=Math.max(Math.abs(dx),Math.abs(dy));set(cx+dx,cy+dy,d!=2&&d!=4)}
 if(v>1){const na=Math.floor(v/7)+2,st=v==32?26:Math.ceil((v*4+4)/(na*2-2))*2,ps=[6];for(let p=n-7;ps.length<na;p-=st)ps.splice(1,0,p);
  for(let i=0;i<na;i++)for(let j=0;j<na;j++){if((i==0&&j==0)||(i==0&&j==na-1)||(i==na-1&&j==0))continue;
   for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(ps[i]+dx,ps[j]+dy,Math.max(Math.abs(dx),Math.abs(dy))!=1)}}
 const fmt=mk=>{const d=mk;let r=d;for(let i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);const b=((d<<10)|r)^0x5412,g=i=>((b>>>i)&1)!=0;
  for(let i=0;i<=5;i++)set(8,i,g(i));set(8,7,g(6));set(8,8,g(7));set(7,8,g(8));for(let i=9;i<15;i++)set(14-i,8,g(i));
  for(let i=0;i<8;i++)set(n-1-i,8,g(i));for(let i=8;i<15;i++)set(8,n-15+i,g(i));set(8,n-8,true)};
 fmt(0);
 if(v>=7){let r=v;for(let i=0;i<12;i++)r=(r<<1)^((r>>>11)*0x1F25);const b=(v<<12)|r;for(let i=0;i<18;i++){const c=((b>>>i)&1)!=0,a=n-11+i%3,q=Math.floor(i/3);set(a,q,c);set(q,a,c)}}
 let i=0;for(let rt=n-1;rt>=1;rt-=2){if(rt==6)rt=5;for(let vt=0;vt<n;vt++)for(let j=0;j<2;j++){const x=rt-j,y=((rt+1)&2)==0?n-1-vt:vt;if(!f[y][x]&&i<all.length*8){m[y][x]=((all[i>>>3]>>>(7-(i&7)))&1)!=0;i++}}}
 const MK=[(x,y)=>(x+y)%2==0,(x,y)=>y%2==0,(x,y)=>x%3==0,(x,y)=>(x+y)%3==0,(x,y)=>(Math.floor(x/3)+Math.floor(y/2))%2==0,(x,y)=>x*y%2+x*y%3==0,(x,y)=>(x*y%2+x*y%3)%2==0,(x,y)=>((x+y)%2+x*y%3)%2==0];
 const app=k=>{for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(!f[y][x]&&MK[k](x,y))m[y][x]=!m[y][x]};
 const pen=()=>{let p=0;for(let a=0;a<n;a++)for(const t of [0,1]){let run=1;for(let b=1;b<n;b++){const c=t?m[b][a]:m[a][b],pr=t?m[b-1][a]:m[a][b-1];if(c==pr){run++;if(run==5)p+=3;else if(run>5)p++}else run=1}}
  for(let y=0;y<n-1;y++)for(let x=0;x<n-1;x++)if(m[y][x]==m[y][x+1]&&m[y][x]==m[y+1][x]&&m[y][x]==m[y+1][x+1])p+=3;return p};
 let best=0,bp=1e9;for(let k=0;k<8;k++){app(k);fmt(k);const p=pen();if(p<bp){bp=p;best=k}app(k)}
 app(best);fmt(best);return m}
