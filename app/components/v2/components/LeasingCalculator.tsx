"use client";

import { useState } from "react";
import { Flex } from "../core/Flex";
import { Heading3 } from "../core/Headings";
import { calculateMonthlyPayment } from "@/app/utils/leasing-calculator";
import { Slider } from "@/components/ui/slider";
import { useFormatter } from "next-intl";
import { Columns } from "../core/Columns";

// Props: t is a translation function, e.g. from useTranslations("CarLeasing.calculator")
export default function LeasingCalculator({ texts }: { texts: Record<string, string> }) {
  // State for car price, contract length, interest rate, down payment, tax rate
  const format = useFormatter();
  const [carPrice, setCarPrice] = useState(30000);
  const [contractLength, setContractLength] = useState(36); // months
  const [downPayment, setDownPayment] = useState(0);
  const [residualValuePercent, setResidualValuePercent] = useState(10);
  const [interestRate] = useState(5.9); // percent. FIXED atm according to emails from Innolease stuff.

  const monthlyPayment = calculateMonthlyPayment(
    interestRate / 100 / 12,
    contractLength,
    carPrice - downPayment,
    ((carPrice * residualValuePercent) / 100) * -1,
    true
  );

  return (
    <Columns columns={{ default: 1, md: 2 }} gaps="large">
      <Flex direction="column">
        <div className="calculator-row w-full">
          <div className="flex justify-between items-center">
            <label htmlFor="carPrice">{texts.carPrice}</label>
            <span className="font-bold text-kupari">
              {format.number(carPrice, { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
            </span>
          </div>
          <Slider
            value={[carPrice]}
            onValueChange={(val) => setCarPrice(val[0])}
            min={10000}
            max={100000}
            step={1000}
            className="py-4"
          />
          <div className="flex justify-between text-xs">
            <span>10 000 €</span>
            <span>100 000 €</span>
          </div>
        </div>

        {/* Contract Length */}
        <div className="calculator-row">
          <div className="flex justify-between items-center">
            <label htmlFor="carPrice">{texts.contractLength}</label>
            <span className="font-bold text-kupari">
              {contractLength} {texts.months}
            </span>
          </div>
          <Slider
            value={[contractLength]}
            onValueChange={(val) => setContractLength(val[0])}
            min={12}
            max={60}
            step={1}
            className="py-4"
          />
          <div className="flex justify-between text-xs">
            <span>12 {texts.months}</span>
            <span>60 {texts.months}</span>
          </div>
        </div>

        {/* Down Payment */}
        <div className="calculator-row">
          <div className="flex justify-between items-center">
            <label htmlFor="carPrice">{texts.downPayment}</label>
            <span className="font-bold text-kupari">
              {format.number(downPayment, { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
            </span>
          </div>
          <Slider
            value={[downPayment]}
            onValueChange={(val) => setDownPayment(val[0])}
            min={0}
            max={carPrice}
            step={500}
            className="py-4"
          />
          <div className="flex justify-between text-xs">
            <span>0 €</span>
            <span>{format.number(carPrice, { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        {/* Residual Value */}
        <div className="calculator-row">
          <div className="flex justify-between items-center">
            <label htmlFor="carPrice">Jäännösarvo {texts.residualValue}</label>
            <span className="font-bold text-kupari">
              {format.number(carPrice * (residualValuePercent / 100), {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
          <Slider
            value={[carPrice * (residualValuePercent / 100)]}
            onValueChange={(val) => setResidualValuePercent((100 * val[0]) / carPrice)}
            min={0}
            max={carPrice}
            step={500}
            className="py-4"
          />
          <div className="flex justify-between text-xs">
            <span>0 €</span>
            <span>{format.number(carPrice, { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        <div className="calculator-row">
          <label htmlFor="interestRate" className="block">
            {texts.interestRate}
          </label>
          <span>{interestRate}%</span>
        </div>
      </Flex>
      {/* Results */}
      <div className="p-10 self-center align-middle w-full">
        <div className="bg-white p-10 rounded-lg text-center">
          <Heading3>{texts.resultTitle}</Heading3>
          <div className="text-3xl font-bold text-piki pt-4">
            {format.number(Math.max(0, monthlyPayment), { style: "currency", currency: "EUR" })}
            <span className="text-sm font-normal text-gray-600 ml-1">/ kk</span>
          </div>
          <div className="text-xs p-6">{texts.disclaimer}</div>
        </div>
      </div>
    </Columns>
  );
}
