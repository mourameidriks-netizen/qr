// ===== Atalhos =====
const $ = id => document.getElementById(id);
const pausa = () => new Promise(r => setTimeout(r));
const paraBlob = cv => new Promise(r => cv.toBlob(r, "image/png"));
const nomeArquivo = c => c.replace(/[\\/:*?"<>|]/g, "_") + ".png";
const semAcento = t => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const aviso = (t, erro) => { $("mensagem").textContent = t; $("mensagem").className = erro ? "erro" : ""; };
function travar(sim) { document.querySelectorAll("button").forEach(b => b.disabled = sim); }

// ===== Desenho da imagem do QR Code (o "preset") =====
function makeCanvas(code){
 const q=makeQR(code),n=q.length,W=800,H=1000,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
 const rr=(X,Y,w,h,r,col)=>{x.fillStyle=col;x.beginPath();x.roundRect(X,Y,w,h,r);x.fill()};
 x.fillStyle="#fff";x.fillRect(0,0,W,H);rr(0,0,W,H,64,"#000");rr(28,28,W-56,740,40,"#fff");
 const s=Math.floor(560/n),px=s*n,x0=(W-px)/2,y0=28+(740-px)/2;x.fillStyle="#000";
 for(let r=0;r<n;r++)for(let k=0;k<n;k++)if(q[r][k])x.fillRect(x0+k*s,y0+r*s,s,s);
 x.fillStyle="#fff";x.textAlign="center";x.textBaseline="middle";let fs=46,ls;
 do{ls=Math.round(fs*0.16);x.letterSpacing=ls+"px";x.font="bold "+fs+"px Arial,Helvetica,sans-serif";fs-=2}while(x.measureText(code).width>W-100&&fs>14);
 x.fillText(code,W/2+ls/2,884);return c}
// ===== Prévia à esquerda =====
function atualizarPrevia() {
  const primeira = $("entrada").value.split(/\r?\n/).map(l => l.trim()).find(Boolean) || "EU_ST-AP-0635_BLK";
  try { $("previa").src = makeCanvas(primeira).toDataURL(); } catch (e) { /* código inválido, mantém a prévia anterior */ }
}

// ===== Caixa de texto =====
function lerLista() {
  const vistos = new Set(); let repetidos = 0;
  for (const l of $("entrada").value.split(/\r?\n/)) {
    const t = l.trim(); if (!t) continue;
    if (vistos.has(t)) repetidos++; else vistos.add(t);
  }
  return { codigos: [...vistos], repetidos };
}
$("entrada").oninput = () => {
  const { codigos, repetidos } = lerLista();
  $("contador").textContent = codigos.length + " código(s)" + (repetidos ? " (" + repetidos + " repetido(s) ignorado(s))" : "");
  atualizarPrevia();
};

let imagens = [];
$("botao-gerar").onclick = async () => {
  const { codigos } = lerLista();
  if (!codigos.length) return aviso("Cole pelo menos um código.", true);
  if (codigos.length > 500) return aviso("Máximo de 500 códigos por vez (você colou " + codigos.length + ").", true);
  travar(true); imagens.forEach(i => URL.revokeObjectURL(i.url)); imagens = [];
  $("resultados").innerHTML = ""; $("area-resultados").hidden = false;
  const barra = $("progresso"); barra.max = codigos.length; barra.value = 0; const erros = [];
  for (let i = 0; i < codigos.length; i++) {
    try {
      const blob = await paraBlob(makeCanvas(codigos[i])), url = URL.createObjectURL(blob);
      imagens.push({ nome: nomeArquivo(codigos[i]), blob, url });
      const a = document.createElement("a"); a.href = url; a.download = nomeArquivo(codigos[i]);
      a.innerHTML = "<img src='" + url + "'>"; a.append(codigos[i]); $("resultados").append(a);
    } catch (e) { erros.push(codigos[i] + ": " + e.message); }
    barra.value = i + 1; aviso("Gerando " + (i + 1) + " de " + codigos.length + "...");
    if (i % 5 == 0) await pausa();
  }
  aviso("Pronto: " + imagens.length + " gerado(s)." + (erros.length ? " Erros: " + erros.join(" | ") : ""), erros.length);
  travar(false);
  if (!window.showDirectoryPicker) $("botao-pasta").hidden = true;
};

$("botao-pasta").onclick = async () => {
  try {
    const raiz = await showDirectoryPicker({ mode: "readwrite" });
    const pasta = await raiz.getDirectoryHandle("QR_CODES", { create: true });
    let k = 0;
    for (const img of imagens) {
      const arq = await pasta.getFileHandle(img.nome, { create: true }), w = await arq.createWritable();
      await w.write(img.blob); await w.close(); aviso("Salvando " + (++k) + " de " + imagens.length + "...");
    }
    aviso("Pronto! " + imagens.length + " arquivos salvos na pasta QR_CODES.");
  } catch (e) { if (e.name != "AbortError") aviso("Erro ao salvar: " + e.message, true); }
};

// ===== Botões dos dias =====
async function baixarDia(dia, pedido) {
  const todos = listaDoDia(dia);
  if (!todos.length) return aviso("Os códigos de " + dia.nome + " ainda não foram cadastrados (arquivo codigos.js).", true);
  const codigos = todos.slice(0, Math.max(1, Math.min(500, pedido)));
  travar(true);
  const barra = $("progresso"); barra.max = codigos.length; barra.value = 0;
  const pasta = semAcento(dia.nome), arquivos = [];
  try {
    for (let i = 0; i < codigos.length; i++) {
      arquivos.push({ name: pasta + "/" + nomeArquivo(codigos[i]), blob: await paraBlob(makeCanvas(codigos[i])) });
      barra.value = i + 1; aviso(dia.nome + ": gerando " + (i + 1) + " de " + codigos.length + "...");
      if (i % 5 == 0) await pausa();
    }
    aviso(dia.nome + ": montando o ZIP...");
    const zip = await montarZip(arquivos), a = document.createElement("a");
    a.href = URL.createObjectURL(zip); a.download = pasta + "_" + codigos.length + "_QRCodes.zip"; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    aviso("Pronto! " + dia.nome + ": ZIP com " + codigos.length + " QR Codes baixado." + (codigos.length < pedido ? " (Só existem " + codigos.length + " códigos cadastrados.)" : ""));
  } catch (e) { aviso("Erro em " + dia.nome + ": " + e.message, true); }
  travar(false);
}

function criarBotoesDosDias() {
  for (const dia of DIAS) {
    const caixa = document.createElement("div");
    caixa.innerHTML =
      '<button class="btn-dia" style="--cor:' + dia.cor + ';--texto-cor:' + dia.corTexto + '">' +
      '<span class="pontos" title="Escolher a quantidade"><i></i><i></i></span><span>' + dia.nome + '</span></button>' +
      '<div class="qtd" hidden><label>Quantos QR Codes? (máx. 500)</label>' +
      '<input type="number" min="1" max="500" value="500"></div>';
    const botao = caixa.querySelector("button"), barra = caixa.querySelector(".qtd"), campo = caixa.querySelector("input");
    botao.onclick = e => {
      if (e.target.closest(".pontos")) { barra.hidden = !barra.hidden; if (!barra.hidden) campo.focus(); return; }
      baixarDia(dia, parseInt(campo.value) || 500);
    };
    $("dias").append(caixa);
  }
}

// ===== Início =====
criarBotoesDosDias();
atualizarPrevia();
