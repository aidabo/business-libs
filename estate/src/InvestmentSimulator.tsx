import React, { useState, useMemo } from "react";
import type { InvestmentInput, InvestmentResult } from "./types/investment";

interface InvestmentSimulatorProps {
  /** Pre-filled purchase price (when linked to a specific property) */
  purchasePrice?: number;
  /** Pre-filled monthly rent estimate (when linked to a specific property) */
  monthlyRent?: number;
  /** Host app API base URL */
  apiBase?: string;
  /** Property ID to auto-fill data from Ghost */
  propertyId?: string;
}

const formatYen = (v: number) =>
  v >= 100000000
    ? `${(v / 100000000).toFixed(1)}億`
    : v >= 10000
      ? `${(v / 10000).toFixed(0)}万`
      : v.toLocaleString();

const formatPct = (v: number) => `${v.toFixed(1)}%`;

const DEFAULT_INPUT: InvestmentInput = {
  purchasePrice: 30000000,
  monthlyRent: 150000,
  downPaymentPct: 0.2,
  interestRate: 0.015,
  holdingYears: 10,
  appreciationRate: 0.02,
  vacancyRate: 0.05,
  closingCostPct: 0.07,
  capitalGainsTaxRate: 0.20,
  sellingCostPct: 0.03,
  monthlyManagementFee: 0,
  monthlyMaintenance: 5000,
  annualInsurance: 20000,
};

const NumberSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step, format, onChange }) => (
  <div className="mb-3">
    <div className="mb-1 flex items-center justify-between">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <span className="text-xs font-semibold text-gray-900">
        {format ? format(value) : value}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full"
    />
  </div>
);

const InvestmentSimulator: React.FC<InvestmentSimulatorProps> = ({
  purchasePrice,
  monthlyRent,
  apiBase = "",
  propertyId,
}) => {
  const [input, setInput] = useState<InvestmentInput>({
    ...DEFAULT_INPUT,
    purchasePrice: purchasePrice || DEFAULT_INPUT.purchasePrice,
    monthlyRent: monthlyRent || DEFAULT_INPUT.monthlyRent,
  });
  const [result, setResult] = useState<InvestmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeYearTab, setActiveYearTab] = useState(0);

  const update = (key: keyof InvestmentInput, value: number) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const runSimulation = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `${apiBase}/api/ai/estate/investment-simulate`;
      const body: Record<string, any> = { ...input };
      if (propertyId) body.property_id = propertyId;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setResult(data as InvestmentResult);
    } catch (e: any) {
      setError(e.message || "Failed to run simulation");
    } finally {
      setLoading(false);
    }
  };

  useMemo(() => { runSimulation(); }, []);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-gray-900">Investment Simulator</h2>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input panel */}
        <div className="space-y-1">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Parameters</h3>

          <NumberSlider
            label="Purchase Price"
            value={input.purchasePrice}
            min={5000000}
            max={200000000}
            step={1000000}
            format={formatYen}
            onChange={(v) => update("purchasePrice", v)}
          />
          <NumberSlider
            label="Monthly Rent"
            value={input.monthlyRent || 0}
            min={0}
            max={1000000}
            step={10000}
            format={formatYen}
            onChange={(v) => update("monthlyRent", v)}
          />
          <NumberSlider
            label="Down Payment"
            value={(input.downPaymentPct || 0.2) * 100}
            min={5}
            max={100}
            step={5}
            format={(v) => `${v}%`}
            onChange={(v) => update("downPaymentPct", v / 100)}
          />
          <NumberSlider
            label="Interest Rate"
            value={(input.interestRate || 0.015) * 100}
            min={0.1}
            max={5}
            step={0.1}
            format={(v) => `${v}%`}
            onChange={(v) => update("interestRate", v / 100)}
          />
          <NumberSlider
            label="Holding Period"
            value={input.holdingYears || 10}
            min={1}
            max={30}
            step={1}
            format={(v) => `${v} years`}
            onChange={(v) => update("holdingYears", v)}
          />
          <NumberSlider
            label="Appreciation Rate"
            value={(input.appreciationRate || 0.02) * 100}
            min={-2}
            max={10}
            step={0.5}
            format={(v) => `${v}%`}
            onChange={(v) => update("appreciationRate", v / 100)}
          />

          <button
            onClick={runSimulation}
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Calculating..." : "Run Simulation"}
          </button>
        </div>

        {/* Results panel */}
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Results</h3>

          {result && (
            <div className="space-y-3">
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <p className="text-xs text-gray-500">Total ROI</p>
                  <p className="text-xl font-bold text-green-700">
                    {formatPct(result.summary.totalRoiPct)}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 text-center">
                  <p className="text-xs text-gray-500">Annualized Return</p>
                  <p className="text-xl font-bold text-blue-700">
                    {formatPct(result.summary.annualizedReturnPct)}
                  </p>
                </div>
                <div className="rounded-lg bg-purple-50 p-3 text-center">
                  <p className="text-xs text-gray-500">Cash Flow / Year</p>
                  <p className="text-lg font-bold text-purple-700">
                    {formatYen(Math.round(result.summary.totalRentalCashFlow / (input.holdingYears || 10)))}
                  </p>
                </div>
                <div className="rounded-lg bg-yellow-50 p-3 text-center">
                  <p className="text-xs text-gray-500">Break-even</p>
                  <p className="text-lg font-bold text-yellow-700">
                    {result.summary.breakEvenYear
                      ? `${result.summary.breakEvenYear} yr`
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Key metrics */}
              <div className="rounded bg-gray-50 p-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500">Gross yield:</span>
                    <span className="ml-2 font-medium">{formatPct(result.grossYieldPct)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Net yield:</span>
                    <span className="ml-2 font-medium">{formatPct(result.netYieldPct)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Loan payment:</span>
                    <span className="ml-2 font-medium">{formatYen(result.monthlyLoanPayment)}/mo</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Capital gain:</span>
                    <span className="ml-2 font-medium">{formatYen(result.summary.capitalGain)}</span>
                  </div>
                </div>
              </div>

              {/* Yearly table */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-gray-600">Yearly Projections</h4>
                  <div className="flex gap-1">
                    {result.yearlyProjections.slice(0, 10).map((p, i) => (
                      <button
                        key={p.year}
                        onClick={() => setActiveYearTab(i)}
                        className={`rounded px-2 py-0.5 text-xs ${
                          activeYearTab === i
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {p.year}
                      </button>
                    ))}
                  </div>
                </div>

                {result.yearlyProjections[activeYearTab] && (
                  <div className="rounded bg-gray-50 p-3 text-xs">
                    {(() => {
                      const y = result.yearlyProjections[activeYearTab];
                      return (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <span className="text-gray-500">Property value:</span>
                          <span className="text-right font-medium">{formatYen(y.propertyValue)}</span>
                          <span className="text-gray-500">Equity:</span>
                          <span className="text-right font-medium">{formatYen(y.equity)}</span>
                          <span className="text-gray-500">Rental income:</span>
                          <span className="text-right font-medium">{formatYen(y.rentalIncome)}</span>
                          <span className="text-gray-500">Net cash flow:</span>
                          <span className={`text-right font-medium ${y.netRentalIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {formatYen(y.netRentalIncome)}
                          </span>
                          <span className="text-gray-500">ROI:</span>
                          <span className="text-right font-medium">{formatPct(y.roiPct)}</span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="flex items-center justify-center py-12 text-sm text-gray-400">
              Adjust parameters and click "Run Simulation"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentSimulator;
