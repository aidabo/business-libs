export interface InvestmentInput {
  purchasePrice: number;
  downPaymentPct?: number;
  interestRate?: number;
  holdingYears?: number;
  monthlyRent?: number;
  appreciationRate?: number;
  annualPropertyTax?: number;
  monthlyManagementFee?: number;
  monthlyMaintenance?: number;
  annualInsurance?: number;
  vacancyRate?: number;
  closingCostPct?: number;
  capitalGainsTaxRate?: number;
  sellingCostPct?: number;
}

export interface YearlyProjection {
  year: number;
  propertyValue: number;
  remainingLoan: number;
  equity: number;
  rentalIncome: number;
  rentalExpenses: number;
  netRentalIncome: number;
  cumulativeCashFlow: number;
  totalEquity: number;
  roiPct: number;
  annualizedReturnPct: number;
}

export interface InvestmentResult {
  purchasePrice: number;
  downPayment: number;
  loanAmount: number;
  totalClosingCosts: number;
  totalInitialInvestment: number;
  monthlyLoanPayment: number;
  grossYieldPct: number;
  netYieldPct: number;
  yearlyProjections: YearlyProjection[];
  summary: {
    finalPropertyValue: number;
    finalEquity: number;
    totalRoiPct: number;
    annualizedReturnPct: number;
    breakEvenYear: number | null;
    totalRentalCashFlow: number;
    capitalGain: number;
  };
  assumptions: Record<string, number>;
}
