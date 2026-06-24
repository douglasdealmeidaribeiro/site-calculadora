const http = require('http');
const fs = require('fs');
const path = require('path');
const { gerarTabelaAmortizacao } = require('./calculator');

const PORT = process.env.PORT || 3000;

function servirArquivo(res, filePath, contentType) {
  fs.readFile(filePath, (erro, dados) => {
    if (erro) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Erro ao ler o arquivo solicitado.');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(dados);
  });
}

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    let corpo = '';
    req.on('data', (chunk) => {
      corpo += chunk;
    });
    req.on('end', () => resolve(corpo));
    req.on('error', reject);
  });
}

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/') {
    servirArquivo(res, path.join(__dirname, 'public', 'index.html'), 'text/html; charset=utf-8');
    return;
  }

  if (req.method === 'GET' && url.pathname === '/style.css') {
    servirArquivo(res, path.join(__dirname, 'public', 'style.css'), 'text/css; charset=utf-8');
    return;
  }

  if (req.method === 'GET' && url.pathname === '/app.js') {
    servirArquivo(res, path.join(__dirname, 'public', 'app.js'), 'application/javascript; charset=utf-8');
    return;
  }

  if (req.method === 'POST' && url.pathname === '/calcular') {
    try {
      const corpo = await lerCorpo(req);
      const dados = new URLSearchParams(corpo);

      const valorFinanciado = Number(dados.get('valorFinanciado'));
      const numeroMeses = Number(dados.get('numeroMeses'));
      const taxaJuros = Number(dados.get('taxaJuros'));

      const resultado = gerarTabelaAmortizacao(valorFinanciado, numeroMeses, taxaJuros);

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(resultado));
    } catch (erro) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ erro: erro.message }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Página não encontrada.');
});

servidor.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
