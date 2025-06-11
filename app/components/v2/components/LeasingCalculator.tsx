"use client";

import { useState } from "react";
import { Flex } from "../core/Flex";
import { Heading2, Heading3, Heading3Small } from "../core/Headings";
import { Card } from "../core/Card";

// Props: t is a translation function, e.g. from useTranslations("CarLeasing.calculator")
export default function LeasingCalculator({ texts }: { texts: Record<string, string> }) {
  // State for car price, contract length, interest rate, down payment, tax rate
  const [carPrice, setCarPrice] = useState(30000);
  const [contractLength, setContractLength] = useState(36); // months
  const [downPayment, setDownPayment] = useState(0);
  const [interestRate, setInterestRate] = useState(3.0); // percent
  const [taxRate, setTaxRate] = useState(30); // percent

  // Calculate monthly fee (simple annuity formula, not including fees/insurance)
  const principal = carPrice - downPayment;
  const monthlyInterest = interestRate / 100 / 12;
  const months = contractLength;
  const monthlyFee =
    monthlyInterest > 0
      ? (principal * monthlyInterest) / (1 - Math.pow(1 + monthlyInterest, -months))
      : principal / months;

  // After-tax cost (assuming the monthly fee is paid from net income)
  const afterTaxMonthly = monthlyFee / (1 - taxRate / 100);

  return (
    <Flex direction="column">
      <Heading2>{texts.title}</Heading2>
      <Flex direction="row" gaps="large" className="w-full">
        <Flex direction="column" className="grow">
          <div className="calculator-row">
            <label htmlFor="carPrice">{texts.carPrice}</label>
            <Flex gaps="small">
              <input
                id="carPrice"
                type="range"
                min={5000}
                max={150000}
                step={500}
                value={carPrice}
                onChange={(e) => setCarPrice(Number(e.target.value))}
                className="w-full"
                aria-valuenow={carPrice}
                aria-valuemin={5000}
                aria-valuemax={150000}
              />
              <input
                type="number"
                min={5000}
                max={150000}
                step={500}
                value={carPrice}
                onChange={(e) => setCarPrice(Number(e.target.value))}
                aria-label={texts.carPrice}
              />
              <span className="unit-marker">€</span>
            </Flex>
          </div>
          {/* Contract Length */}
          <div className="calculator-row">
            <label htmlFor="contractLength" className="block font-medium mb-1">
              {texts.contractLength} ({texts.months})
            </label>
            <Flex gaps="small">
              <input
                id="contractLength"
                type="range"
                min={12}
                max={60}
                step={1}
                value={contractLength}
                onChange={(e) => setContractLength(Number(e.target.value))}
                className="w-full"
                aria-valuenow={contractLength}
                aria-valuemin={12}
                aria-valuemax={60}
              />
              <input
                type="number"
                min={12}
                max={60}
                step={1}
                value={contractLength}
                onChange={(e) => setContractLength(Number(e.target.value))}
                aria-label={texts.contractLength}
              />
            </Flex>
          </div>
          {/* Down Payment */}
          <div className="calculator-row">
            <label htmlFor="downPayment" className="block font-medium mb-1">
              {texts.downPayment}
            </label>
            <Flex gaps="small">
              <input
                id="downPayment"
                type="range"
                min={0}
                max={carPrice}
                step={500}
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full"
                aria-valuenow={downPayment}
                aria-valuemin={0}
                aria-valuemax={carPrice}
              />
              <input
                type="number"
                min={0}
                max={carPrice}
                step={500}
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                aria-label={texts.downPayment}
              />
              <span className="unit-marker">€</span>
            </Flex>
          </div>
          {/* Interest Rate */}
          <div className="calculator-row">
            <label htmlFor="interestRate" className="block font-medium mb-1">
              {texts.interestRate}
            </label>
            <Flex gaps="small">
              <input
                id="interestRate"
                type="range"
                min={0}
                max={10}
                step={0.1}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full"
                aria-valuenow={interestRate}
                aria-valuemin={0}
                aria-valuemax={10}
              />
              <input
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                aria-label={texts.interestRate}
              />
              <span className="unit-marker">%</span>
            </Flex>
          </div>
          {/* Tax Rate */}
          <div className="calculator-row">
            <label htmlFor="taxRate" className="block font-medium mb-1">
              {texts.taxRate}
            </label>
            <Flex gaps="small">
              <input
                id="taxRate"
                type="range"
                min={0}
                max={60}
                step={1}
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full"
                aria-valuenow={taxRate}
                aria-valuemin={0}
                aria-valuemax={60}
              />
              <input
                type="number"
                min={0}
                max={60}
                step={1}
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                aria-label={texts.taxRate}
              />
              <span className="unit-marker">%</span>
            </Flex>
          </div>
        </Flex>
        {/* Results */}
        <Card
          palette="light-gray"
          className="w-1/3 flex flex-col gap-4 apply-palette main-level-padding-small  rounded-lg border"
        >
          <Heading3Small>{texts.resultTitle}</Heading3Small>
          <div className="flex flex-col">
            {texts.monthlyFee}:{" "}
            <span className="font-bold text-2xl">
              {monthlyFee.toLocaleString(undefined, { maximumFractionDigits: 2 })} €
            </span>
          </div>
          <div className="flex flex-col">
            {texts.afterTaxMonthly}:{" "}
            <span className="font-bold text-2xl">
              {afterTaxMonthly.toLocaleString(undefined, { maximumFractionDigits: 2 })} €
            </span>
          </div>
          <div className="text-xs">{texts.disclaimer}</div>
        </Card>
      </Flex>
    </Flex>
  );
}
