const fmtMoney = (v) => new Intl.NumberFormat('it-IT', { 
    style: 'currency', 
    currency: 'EUR' 
}).format(v);

/* P = capitale iniziale (principal).

r = tasso di interesse annuo (es. 0.05 per 5%).

n = numero di capitalizzazioni all’anno (es. 12 per mensile). 

t = numero di anni totali.
   
PMT = contributo periodico costante (facoltativo, default 0).

contribAtStart → true se i contributi sono versati all’inizio del periodo, false se alla fine.*/

function calcFinal(P, r, n, t, PMT=0, contribAtStart=false) {
    if (r === 0) {
      return P + PMT * n * t;
    }
    const RoverN = r / n; // r/n, tasso d'ineresse relativo al periodo
    const factor = Math.pow(1 + RoverN, n * t); // (1+r/n)^(n*t), Math.pow calcola potenze
    if (!PMT || PMT === 0) { // se non ci sono contributi o sono 0
      return P * factor;
    }
    // contributi alla fine del periodo:
    let contribTerm = PMT * (factor - 1) / RoverN; // (factor - 1) approssimazione della somma di tutti i contributi nel tempo
    if (contribAtStart) contribTerm *= (1 + RoverN); // se i contributi sono all'inizio del periodo, si capitalizzano per un periodo in più
    return P * factor + contribTerm;
}

    // Costruisce il saldo anno per anno (utile per il grafico e tabella)
    function yearlyBalances(P, r, n, t, PMT=0, contribAtStart=false) {
      const totalPeriods = Math.round(n * t); //
      let balances = [];
      let balance = P;
      let periodCount = 0;
      for (let i = 1; i <= totalPeriods; i++) {
        if (contribAtStart && PMT) balance += PMT;
        balance *= (1 + r / n);
        if (!contribAtStart && PMT) balance += PMT;
        periodCount++;
        // ogni n periodi push il saldo di fine anno (o se ultimo periodo)
        if (periodCount === n || i === totalPeriods) {
          balances.push(balance);
          periodCount = 0;
        }
      }
      return balances;
    }

    let chartInstance = null;

    document.getElementById('calcBtn').addEventListener('click', () => {
      const P = parseFloat(document.getElementById('principal').value) || 0;
      const ratePercent = parseFloat(document.getElementById('rate').value) || 0;
      const r = ratePercent / 100;
      const n = parseInt(document.getElementById('compFreq').value, 10) || 1;
      const t = parseFloat(document.getElementById('duration').value) || 0;
      const PMT = parseFloat(document.getElementById('contribution').value) || 0;
      const contribAtStart = document.querySelector('input[name="contribTiming"]:checked').value === 'start';

      const finalAmount = calcFinal(P, r, n, t, PMT, contribAtStart);
      const totalContributions = P + PMT * Math.round(n * t);
      const interestEarned = finalAmount - totalContributions;

      const resultDiv = document.getElementById('result');
      resultDiv.innerHTML = `
        <div><strong>Saldo finale:</strong> ${fmtMoney(finalAmount)}</div>
        <div class="small">Contributi totali stimati: ${fmtMoney(totalContributions)}</div>
        <div class="small">Interessi guadagnati: ${fmtMoney(interestEarned)}</div>
      `;

      // Tabella annuale + grafico
      const balances = yearlyBalances(P, r, n, t, PMT, contribAtStart);
      const yearsLabels = balances.map((_, i) => `Anno ${i+1}`);
      const tableWrap = document.getElementById('tableWrap');
      // Tabella semplice
      let html = `<table><thead><tr><th>Periodo</th><th>Saldo</th></tr></thead><tbody>`;
      balances.forEach((b, i) => {
        html += `<tr><td style="text-align:left">Anno ${i+1}</td><td>${fmtMoney(b)}</td></tr>`;
      });
      html += `</tbody></table>`;
      tableWrap.innerHTML = html;

      // Grafico (Chart.js)
      const canvas = document.getElementById('chart');
      canvas.style.display = balances.length ? 'block' : 'none';
      if (chartInstance) {
        chartInstance.destroy();
      }
      if (balances.length) {
        chartInstance = new Chart(canvas, {
          type: 'line',
          data: {
            labels: yearsLabels,
            datasets: [{
              label: 'Saldo',
              data: balances,
              fill: false,
              tension: 0.25,
            }]
          },
          options: {
            scales: {
              y: { beginAtZero: false, ticks: { callback: (v) => v } }
            },
            plugins: { legend: { display: false } }
          }
        });
      }
    });