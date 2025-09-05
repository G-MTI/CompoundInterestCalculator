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
