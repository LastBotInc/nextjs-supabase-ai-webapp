// Source explanations for constants:
// FIXED_AMOUNT (90 €/month) → Based on Finnish tax authority car benefit rules (e.g., Vero.fi):
// https://www.vero.fi/en/individuals/tax-cards-and-tax-returns/benefits/car-benefit/
// For 2024–2025, the base amount is usually about €90/month.

// PERCENTAGE (0.0018) → Equivalent to 1.8% per month (21.6% annually) of car value, matches official formula.
// Vero.fi: The car benefit taxable value is the higher of: (fixed €) + (percentage of price).

// ELECTRIC/BIOGAS BENEFIT (170 €/month) → A standard deduction for zero-emission cars in Finland.
// Vero.fi: "Reduction €170/month for electric/biogas cars".

// AGE REDUCTION → Follows Vero.fi car benefit calculation tables: ~9% per year depreciation, capped at ~30%.

// FUEL_BENEFIT (300 €/month) → Example only, real value depends on private km driven × 0.18 €/km or a fixed method.

export interface CarBenefitInput {
  calculationYear: number;
  firstRegistrationYear: number;
  basePrice: number;
  extraEquipmentPrice: number;
  benefitType: 'useBenefit' | 'freeUseBenefit';
  isElectric: boolean;
  isPlugInHybrid: boolean;
}

export interface CarBenefitOutput {
  monthlyValue: number;
  annualValue: number;
  ageGroup: string;
  emissionReduction: number;
}

// based on https://www.vero.fi/syventavat-vero-ohjeet/paatokset/47380/verohallinnon-p%C3%A4%C3%A4t%C3%B6s-vuodelta-2025-toimitettavassa-verotuksessa-noudatettavista-luontoisetujen-laskentaperusteista/
export function calculateCarBenefit(data: CarBenefitInput): CarBenefitOutput {
  // Determine age group
  const regYear = data.firstRegistrationYear;
  let percent = 0;
  let fixedAmount = 0;
  let ageGroup = '';

  if (regYear >= 2023) {
    ageGroup = 'A';
    percent = 0.015; // 1.5% per month
    fixedAmount = data.benefitType === 'freeUseBenefit' ? 285 : 105;
  } else if (regYear >= 2020) {
    ageGroup = 'B';
    percent = 0.012; // 1.2% per month
    fixedAmount = data.benefitType === 'freeUseBenefit' ? 300 : 120;
  } else {
    ageGroup = 'C';
    percent = 0.009; // 0.9% per month
    fixedAmount = data.benefitType === 'freeUseBenefit' ? 315 : 135;
  }

  // Replacement price is base minus 3400 + excess equipment over €1200
  const extraEquip = Math.max(0, data.extraEquipmentPrice - 1200);
  const replacementPrice = Math.max(0, data.basePrice - 3400) + extraEquip;

  let monthlyValue = Math.floor(replacementPrice * percent) + fixedAmount;

  // CO2 reductions
  let emissionReduction = 0;
  if (data.isElectric) {
    emissionReduction = 120;
    monthlyValue -= emissionReduction;
  } else if (data.isPlugInHybrid) {
    emissionReduction = 60;
    monthlyValue -= emissionReduction;
  }

  return {
    monthlyValue: Math.round(monthlyValue),
    annualValue: Math.round(monthlyValue * 12),
    ageGroup,
    emissionReduction
  };
}


