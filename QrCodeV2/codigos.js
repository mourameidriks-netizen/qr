const DIAS = [
  {
    nome: "Segunda",
    cor: "#1f3a93",
    corTexto: "#ffffff",
    padrao: { prefixo: "AF-N-", sufixo: "-NVY" },
    lista: `
    `
  },
  {
    nome: "Terça",
    cor: "#ffd814",
    corTexto: "#0f1111",
    padrao: { prefixo: "EU-N-", sufixo: "-YLW" },
    lista: `
    `
  },
  {
    nome: "Quarta",
    cor: "#111111",
    corTexto: "#ffffff",
    padrao: { prefixo: "AF-N-", sufixo: "-BLK" },
    lista: `
    `
  },
  {
    nome: "Quinta",
    cor: "#2e8b3d",
    corTexto: "#ffffff",
    padrao: { prefixo: "AF-N-", sufixo: "-GRN" },
    lista: `
    `
  },
  {
    nome: "Sexta",
    cor: "#c62828",          
    corTexto: "#ffffff",
    padrao: { prefixo: "AF-N-", sufixo: "-GRN" },            
    lista: `
    `
  },
  {
    nome: "Sábado",
    cor: "#ff9900",          
    corTexto: "#0f1111",
    padrao: { prefixo: "EU-N-", sufixo: "-YLW" },
    lista: `
    `
  },
  {
    nome: "Domingo",
    cor: "#6b7280",          
    corTexto: "#ffffff",
    padrao: { prefixo: "AF-N-", sufixo: "-BLK" },
    lista: `
    `
  }
];

function listaDoDia(dia) {
  const colados = dia.lista.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (colados.length) return [...new Set(colados)].slice(0, 500);
  if (!dia.padrao) return [];
  const codigos = [];
  for (let n = 1; n <= 500; n++) {
    codigos.push(dia.padrao.prefixo + (2000 + n) + "-" + String(n).padStart(3, "0") + dia.padrao.sufixo);
  }
  return codigos;
}
