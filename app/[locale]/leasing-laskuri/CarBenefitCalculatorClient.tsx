"use client";

import { useState, useEffect } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { calculateCarBenefit, CarBenefitOutput } from "@/app/utils/car-benefit-calculator";
import { RadioGroup, RadioGroupOption } from "@/components/ui/radio-group";
import { Columns } from "@/app/components/v2/core/Columns";
import { Heading3 } from "@/app/components/v2/core/Headings";
import { Flex } from "@/app/components/v2/core/Flex";

interface CarBenefitCalculatorClientProps {
  locale: string;
}

// Helper: get current year for default values
const CURRENT_YEAR = new Date().getFullYear();

export default function CarBenefitCalculatorClient({ locale }: CarBenefitCalculatorClientProps) {
  // Client-side localization
  const t = useTranslations("LeasingCalculator");
  const format = useFormatter();

  // State for calculator inputs
  type BenefitType = "freeUseBenefit" | "useBenefit";
  const [calculatorTab, setCalculatorTab] = useState<BenefitType>("useBenefit");
  const [carType, setCarType] = useState<"electric" | "plugInHybrid" | "gasoline">("gasoline");
  const [basePrice, setBasePrice] = useState(40000); // Car base price
  const [extraEquipmentPrice, setExtraEquipmentPrice] = useState(0); // Extra equipment price
  const [calculationYear, setCalculationYear] = useState(CURRENT_YEAR); // Calculation year
  const [firstRegistrationYear, setFirstRegistrationYear] = useState(CURRENT_YEAR); // Registration year

  // Derived: benefit type for utility
  const benefitType = calculatorTab;

  // State for results
  const [results, setResults] = useState<CarBenefitOutput | null>(null);

  // Calculate results on input change
  useEffect(() => {
    // Prepare input for utility
    const input = {
      calculationYear,
      firstRegistrationYear,
      basePrice,
      extraEquipmentPrice,
      latestExtraEquipmentYear: CURRENT_YEAR, // Not user-editable in UI, always current year
      benefitType,
      isElectric: carType === "electric",
      isPlugInHybrid: carType === "plugInHybrid",
    };
    setResults(calculateCarBenefit(input));
  }, [calculationYear, firstRegistrationYear, basePrice, extraEquipmentPrice, benefitType, carType]);

  // Helper: generate year options for selects
  const yearOptions = Array.from({ length: 7 }, (_, i) => CURRENT_YEAR - i);

  return (
    <Columns columns={{ default: 1, md: 2 }} gaps="large">
      <Flex direction="column" gaps="large">
        <Flex direction="column" gaps="small">
          <Heading3>{t("calculator.selectBenefitType")}</Heading3>
          <RadioGroup
            className="flex flex-row gap-4"
            value={calculatorTab}
            onValueChange={(value) => setCalculatorTab(value as BenefitType)}
          >
            <RadioGroupOption value="useBenefit" label={t("calculator.tabs.usageBenefit")} />
            <RadioGroupOption value="freeUseBenefit" label={t("calculator.tabs.freeBenefit")} />
          </RadioGroup>
        </Flex>
        <Flex direction="column" gaps="large">
          {/* Car base price slider */}
          <Heading3>{t("calculator.inputs.title")}</Heading3>
          <div>
            <div className="flex justify-between items-center">
              <label className="font-medium">{t("calculator.inputs.carValue")}</label>
              <span className="font-bold text-kupari">
                {format.number(basePrice, { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
              </span>
            </div>
            <Slider
              value={[basePrice]}
              onValueChange={(val) => setBasePrice(val[0])}
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
          {/* Extra equipment price slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium">{t("calculator.inputs.extraEquipment")}</label>
              <span className="font-bold text-kupari">
                {format.number(extraEquipmentPrice, { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
              </span>
            </div>
            <Slider
              value={[extraEquipmentPrice]}
              onValueChange={(val) => setExtraEquipmentPrice(val[0])}
              min={0}
              max={20000}
              step={500}
              className="py-4"
            />
            <div className="flex justify-between text-xs">
              <span>0 €</span>
              <span>20 000 €</span>
            </div>
          </div>

          {/* Electric/Biogas toggle */}
          <Flex direction="column" gaps="small">
            <Heading3>{t("calculator.inputs.engineType")}</Heading3>
            <RadioGroup
              value={carType}
              onValueChange={(value) => setCarType(value as "electric" | "plugInHybrid" | "gasoline")}
              className="flex flex-row gap-4"
            >
              <RadioGroupOption value="gasoline" label={t("calculator.inputs.gasoline")} />
              <RadioGroupOption value="plugInHybrid" label={t("calculator.inputs.plugInHybrid")} />
              <RadioGroupOption value="electric" label={t("calculator.inputs.electric")} />
            </RadioGroup>
          </Flex>
          {/* Calculation year select */}
          <Flex>
            <div>
              <label htmlFor="calculationYear" className="text-sm font-medium text-gray-700 block mb-1">
                {t("calculator.inputs.calculationYear")}
              </label>
              <select
                className="w-full border rounded px-3 py-2"
                value={calculationYear}
                onChange={(e) => setCalculationYear(Number(e.target.value))}
                name="calculationYear"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            {/* First registration year select */}
            <div>
              <label htmlFor="firstRegistrationYear" className="text-sm font-medium text-gray-700 block mb-1">
                {t("calculator.inputs.firstRegistrationYear")}
              </label>
              <select
                className="w-full border rounded px-3 py-2"
                value={firstRegistrationYear}
                onChange={(e) => setFirstRegistrationYear(Number(e.target.value))}
                name="firstRegistrationYear"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </Flex>
        </Flex>
      </Flex>
      <div className="p-10 self-center align-middle w-full">
        <div className="bg-white p-10 rounded-lg text-center">
          <Heading3>{t("calculator.results.taxableValue")}</Heading3>
          {results && (
            <div className="text-3xl font-bold text-piki pt-4">
              {format.number(results.monthlyValue, { style: "currency", currency: "EUR" })}
              <span className="text-sm font-normal text-gray-600 ml-1">/ {t("calculator.results.month")}</span>
            </div>
          )}
        </div>
      </div>
    </Columns>
  );
}
