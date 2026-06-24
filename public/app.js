const form = document.getElementById('form-financiamento');
const resultado = document.getElementById('resultado');

function formatarMoeda(valor) {
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function arredondar(valor) {
  return Number(valor.toFixed(2));
}

function calcularParcelaPrice(valorFinanciado, numeroMeses, taxaJuros) {
  const valor = Number(valorFinanciado);
  const meses = Number(numeroMeses);
  const taxa = Number(taxaJuros);

  if (!Number.isFinite(valor) || !Number.isFinite(meses) || !Number.isFinite(taxa)) {
    throw new Error('Valores inválidos. Informe números válidos.');
  }

  if (valor <= 0 || meses <= 0) {
    throw new Error('O valor financiado e a quantidade de meses devem ser maiores que zero.');
  }

  if (taxa < 0) {
    throw new Error('A taxa de juros não pode ser negativa.');
  }

  if (taxa === 0) {
    return arredondar(valor / meses);
  }

  const i = taxa / 100;
  return arredondar((valor * i) / (1 - Math.pow(1 + i, -meses)));
}

function gerarTabelaAmortizacao(valorFinanciado, numeroMeses, taxaJuros) {
  const parcela = calcularParcelaPrice(valorFinanciado, numeroMeses, taxaJuros);
  const meses = Number(numeroMeses);
  const taxa = Number(taxaJuros);
  let saldoDevedor = arredondar(Number(valorFinanciado));
  const tabela = [];

  for (let mes = 1; mes <= meses; mes += 1) {
    const juros = arredondar(saldoDevedor * (taxa / 100));
    let amortizacao;
    let prestacao;

    if (mes === meses) {
      amortizacao = arredondar(saldoDevedor);
      prestacao = arredondar(juros + amortizacao);
    } else {
      amortizacao = arredondar(parcela - juros);
      prestacao = parcela;
    }

    const saldoFinal = arredondar(saldoDevedor - amortizacao);

    tabela.push({
      mes,
      saldoInicial: arredondar(saldoDevedor),
      prestacao,
      juros,
      amortizacao,
      saldoFinal,
    });

    saldoDevedor = saldoFinal;
  }

  const valorTotalPago = arredondar(tabela.reduce((total, linha) => total + linha.prestacao, 0));
  const totalJuros = arredondar(valorTotalPago - Number(valorFinanciado));

  return { parcelaMensal: parcela, valorTotalPago, totalJuros, tabela };
}

form.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const dados = new FormData(form);
  const valorFinanciado = dados.get('valorFinanciado');
  const numeroMeses = dados.get('numeroMeses');
  const taxaJuros = dados.get('taxaJuros');

  try {
    const dadosResposta = gerarTabelaAmortizacao(valorFinanciado, numeroMeses, taxaJuros);

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
  } catch (erro) {
    resultado.innerHTML = `<strong>Erro:</strong> ${erro.message}`;
  }
});
