// source: Laskentakaava on seuraava (Excel kaava): 
// =MAKSU(korko%/12;sopimusaika;-rahoitettava kokonaissumma;auton verollinen kokonaishinta*jäännösarvo%;1)
/*
About the formula:
Excelissä MAKSU-funktiolla lasketaan lainan maksuerä. Kaava on 
=MAKSU(korko_per_jakso; jaksot; nykyarvo; [tuleva_arvo]; [tyyppi]). 
Tärkeimmät argumentit ovat korko per jakso (esim. kuukausikorko), 
jaksojen lukumäärä (esim. kuukausien määrä) ja nykyarvo (lainan määrä). 
Lisäargumentit ovat tuleva arvo (lainan arvo jakson lopussa) ja tyyppi (maksun ajankohta, 0 tai 1). 

// The paymentDueAtStart parameter indicates whether payments are made at the beginning or end of each period.
// In Excel's PMT function, the fifth argument (type) does this: 1 means payments are due at the beginning (like leasing), 0 means at the end (like standard loans).
// Many vehicle leases and equipment leases assume payments are due at the start of each month.
*/

export function roundValue(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateMonthlyPayment(
  interestRatePerMonth: number,
  totalMonths: number,
  principal: number,
  futureValue: number = 0,
  paymentDueAtStart: boolean = true
): number {
  const paymentType = paymentDueAtStart ? 1 : 0;
  if (interestRatePerMonth === 0) return -(principal + futureValue) / totalMonths;
  return roundValue((
    (interestRatePerMonth * (principal * Math.pow(1 + interestRatePerMonth, totalMonths) + futureValue)) /
    ((1 + interestRatePerMonth * paymentType) * (1 - Math.pow(1 + interestRatePerMonth, totalMonths)))
  ))*-1;
}

// source: AI
// THIS IS INCORRECT. DO NOT USE.
// the residualValue is reducted from the purchasePrice, 
// and there for interests are calculated on the wrong amount.

export function leasingCalculator({
  purchasePrice,
  downPayment,
  residualValue,
  loanTermMonths,
  annualInterestRate,
  vatRate,
}: {
  purchasePrice: number;
  downPayment: number;
  residualValue: number;
  loanTermMonths: number;
  annualInterestRate: number;
  vatRate: number;
}) { 
  throw new Error("This function is incorrect. Do not use.");
  // Calculate the loan amount after down payment and residual value
  const loanAmount = purchasePrice - downPayment - residualValue;
  // Convert annual interest rate to monthly
  const monthlyInterestRate = annualInterestRate / 12 / 100;

  let monthlyPayment: number;
  if (monthlyInterestRate === 0) {
    // No interest case
    monthlyPayment = loanAmount / loanTermMonths;
  } else {
    // Standard annuity formula for monthly payment
    monthlyPayment =
      loanAmount *
      (monthlyInterestRate /
        (1 - Math.pow(1 + monthlyInterestRate, -loanTermMonths)));
  }

  // Total interest paid over the loan term
  const totalInterest = monthlyPayment * loanTermMonths - loanAmount;
  // Total paid including down payment and residual value
  const totalPaid = downPayment + monthlyPayment * loanTermMonths + residualValue;
  // Total paid including VAT
  const totalPaidVat = totalPaid * (1 + vatRate / 100);


  // Return the results
  return {
    monthlyPaymentExclVat: roundValue(monthlyPayment),
    monthlyPaymentInclVat: roundValue(monthlyPayment * (1 + vatRate / 100)),
    totalInterestExclVat: roundValue(totalInterest),
    totalInterestInclVat: roundValue(totalInterest * (1 + vatRate / 100)),
    totalCostExclVat: roundValue(totalPaid),
    totalCostInclVat: roundValue(totalPaidVat),
    annualPercentageRate: annualInterestRate,
  };
}


