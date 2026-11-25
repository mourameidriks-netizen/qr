// Monta um arquivo ZIP (sem compressão) direto no navegador.
const TABELA_CRC = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t.push(c >>> 0); }
  return t;
})();
const crc32 = u => { let c = ~0; for (const b of u) c = TABELA_CRC[(c ^ b) & 255] ^ (c >>> 8); return ~c >>> 0; };

// arquivos = [{ name: "Pasta/arquivo.png", blob: Blob }, ...]
async function montarZip(arquivos) {
  const partes = [], central = [], enc = new TextEncoder();
  let pos = 0;
  for (const f of arquivos) {
    const nome = enc.encode(f.name), dados = new Uint8Array(await f.blob.arrayBuffer()), crc = crc32(dados);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x800, true);
    h.setUint32(14, crc, true); h.setUint32(18, dados.length, true); h.setUint32(22, dados.length, true); h.setUint16(26, nome.length, true);
    const e = new DataView(new ArrayBuffer(46));
    e.setUint32(0, 0x02014b50, true); e.setUint16(4, 20, true); e.setUint16(6, 20, true); e.setUint16(8, 0x800, true);
    e.setUint32(16, crc, true); e.setUint32(20, dados.length, true); e.setUint32(24, dados.length, true); e.setUint16(28, nome.length, true); e.setUint32(42, pos, true);
    partes.push(h, nome, dados); central.push(e, nome);
    pos += 30 + nome.length + dados.length;
  }
  const tam = central.reduce((a, p) => a + p.byteLength, 0), fim = new DataView(new ArrayBuffer(22));
  fim.setUint32(0, 0x06054b50, true); fim.setUint16(8, arquivos.length, true); fim.setUint16(10, arquivos.length, true);
  fim.setUint32(12, tam, true); fim.setUint32(16, pos, true);
  return new Blob([...partes, ...central, fim], { type: "application/zip" });
}
