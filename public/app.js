const form = document.getElementById('form-financiamento');
const resultado = document.getElementById('resultado');

function formatarMoeda(valor) {
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const dados = new FormData(form);

  const resposta = await fetch('/calcular', {
    method: 'POST',
    body: new URLSearchParams(dados),
  });

  const dadosResposta = await resposta.json();

  if (!resposta.ok) {
    resultado.innerHTML = `<strong>Erro:</strong> ${dadosResposta.erro}`;
    return;
  }

  const linhasTabela = dadosResposta.tabela
    .map((linha) => `
      <tr>
        <td>${linha.mes}</td>
        <td>${formatarMoeda(linha.saldoInicial)}</td>
        <td>${formatarMoeda(linha.prestacao)}</td>
        <td>${formatarMoeda(linha.juros)}</td>
        <td>${formatarMoeda(linha.amortizacao)}</td>
        <td>${formatarMoeda(linha.saldoFinal)}</td>
      </tr>
    `)
    .join('');

  resultado.innerHTML = `
    <div class="resumo">
      <p><strong>Parcela mensal:</strong> ${formatarMoeda(dadosResposta.parcelaMensal)}</p>
      <p><strong>Total pago:</strong> ${formatarMoeda(dadosResposta.valorTotalPago)}</p>
      <p><strong>Total de juros:</strong> ${formatarMoeda(dadosResposta.totalJuros)}</p>
    </div>

    <div class="tabela-wrapper">
      <table>
        <thead>
          <tr>
            <th>Mês</th>
            <th>Saldo inicial</th>
            <th>Prestação</th>
            <th>Juros</th>
            <th>Amortização</th>
            <th>Saldo final</th>
          </tr>
        </thead>
        <tbody>${linhasTabela}</tbody>
      </table>
    </div>
  `;
});
