"use client";

import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconCar, IconTruck, IconTools, IconCalendar } from "@/app/components/Icons";
import SectionContainer from "@/app/components/SectionContainer";
import Link from "next/link";
// import { calculateFinancialLeasePayment } from '@/lib/calculations' // Commented out unused import causing error

type LeasingSolutionsPageProps = {
  locale: string;
};

export default function LeasingSolutionsPage({ locale }: LeasingSolutionsPageProps) {
  const t = useTranslations("LeasingSolutions");

  // State for calculator
  const [calculatorValues, setCalculatorValues] = useState({
    vehiclePrice: 35000,
    downPayment: 5000,
    term: 36,
    residualValue: 14000,
    interestRate: 3.5,
  });
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);

  // Handle calculator input change
  const handleCalculatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCalculatorValues({
      ...calculatorValues,
      [name]: parseFloat(value) || 0,
    });
  };

  // Calculate monthly payment
  const calculatePayment = () => {
    const { vehiclePrice, downPayment, term, residualValue, interestRate } = calculatorValues;

    const loanAmount = vehiclePrice - downPayment;
    const monthlyInterestRate = interestRate / 100 / 12;
    const futureValue = -residualValue;

    const payment =
      (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, term) - futureValue * monthlyInterestRate) /
      (Math.pow(1 + monthlyInterestRate, term) - 1);

    setMonthlyPayment(Math.round(payment * 100) / 100);
  };

  // For FAQ accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("hero.title")}</h1>
            <p className="text-xl text-blue-100 mb-10">{t("hero.description")}</p>
          </div>
        </div>
      </section>

      {/* Financial Leasing Section */}
      <SectionContainer bgColor="bg-white">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <div className="mb-6">
              <IconCar className="w-12 h-12 text-blue-600 mb-2" />
              <h2 className="text-3xl font-bold mb-2 text-gray-900">{t("financialLeasing.title")}</h2>
              <p className="text-lg font-medium text-blue-600 mb-4">{t("financialLeasing.subtitle")}</p>
              <p className="text-gray-700">{t("financialLeasing.description")}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{t("financialLeasing.features.title")}</h3>
                <ul className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <li key={i} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{t(`financialLeasing.features.feature${i}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{t("financialLeasing.idealFor.title")}</h3>
                <ul className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <li key={i} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-gray-700">{t(`financialLeasing.idealFor.type${i}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 bg-gray-50 p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4 text-gray-900">{t("financialLeasing.calculator.title")}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("financialLeasing.calculator.vehicle")}
                </label>
                <div className="relative rounded-md shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">€</span>
                  <input
                    type="number"
                    name="vehiclePrice"
                    value={calculatorValues.vehiclePrice}
                    onChange={handleCalculatorChange}
                    className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                    min="1000"
                    max="200000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("financialLeasing.calculator.downpayment")}
                </label>
                <div className="relative rounded-md shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">€</span>
                  <input
                    type="number"
                    name="downPayment"
                    value={calculatorValues.downPayment}
                    onChange={handleCalculatorChange}
                    className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                    min="0"
                    max={calculatorValues.vehiclePrice}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("financialLeasing.calculator.term")}
                </label>
                <input
                  type="number"
                  name="term"
                  value={calculatorValues.term}
                  onChange={handleCalculatorChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                  min="12"
                  max="72"
                  step="12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("financialLeasing.calculator.residual")}
                </label>
                <div className="relative rounded-md shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">€</span>
                  <input
                    type="number"
                    name="residualValue"
                    value={calculatorValues.residualValue}
                    onChange={handleCalculatorChange}
                    className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                    min="0"
                    max={calculatorValues.vehiclePrice}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("financialLeasing.calculator.interest")}
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="interestRate"
                    value={calculatorValues.interestRate}
                    onChange={handleCalculatorChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                    min="0"
                    max="15"
                    step="0.1"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">%</span>
                </div>
              </div>

              <button
                onClick={calculatePayment}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
              >
                {t("financialLeasing.calculator.calculate")}
              </button>

              {monthlyPayment !== null && (
                <div className="mt-4 p-4 bg-gray-100 rounded-md">
                  <p className="font-medium text-gray-900">
                    {t("financialLeasing.calculator.result")}{" "}
                    <span className="text-xl font-bold text-blue-600">€{monthlyPayment}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">{t("financialLeasing.calculator.disclaimer")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* Flexible Leasing Section */}
      <SectionContainer bgColor="bg-gray-50">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-3 text-gray-900">{t("flexibleLeasing.caseStudy.title")}</h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Challenge:</h4>
                <p className="text-gray-700">{t("flexibleLeasing.caseStudy.challenge")}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Solution:</h4>
                <p className="text-gray-700">{t("flexibleLeasing.caseStudy.solution")}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Result:</h4>
                <p className="text-gray-700">{t("flexibleLeasing.caseStudy.result")}</p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4 py-2 mt-4">
                <p className="text-gray-700 italic">{t("flexibleLeasing.caseStudy.quote")}</p>
                <p className="text-sm font-medium text-gray-900 mt-2">— {t("flexibleLeasing.caseStudy.person")}</p>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2">
            <div className="mb-6">
              <IconTruck className="w-12 h-12 text-blue-600 mb-2" />
              <h2 className="text-3xl font-bold mb-2 text-gray-900">{t("flexibleLeasing.title")}</h2>
              <p className="text-lg font-medium text-blue-600 mb-4">{t("flexibleLeasing.subtitle")}</p>
              <p className="text-gray-700">{t("flexibleLeasing.description")}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{t("flexibleLeasing.features.title")}</h3>
                <ul className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <li key={i} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{t(`flexibleLeasing.features.feature${i}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{t("flexibleLeasing.idealFor.title")}</h3>
                <ul className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <li key={i} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-gray-700">{t(`flexibleLeasing.idealFor.type${i}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* Maintenance Leasing Section */}
      <SectionContainer bgColor="bg-white">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <div className="mb-6">
              <IconTools className="w-12 h-12 text-blue-600 mb-2" />
              <h2 className="text-3xl font-bold mb-2 text-gray-900">{t("maintenanceLeasing.title")}</h2>
              <p className="text-lg font-medium text-blue-600 mb-4">{t("maintenanceLeasing.subtitle")}</p>
              <p className="text-gray-700">{t("maintenanceLeasing.description")}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{t("maintenanceLeasing.features.title")}</h3>
                <ul className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <li key={i} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{t(`maintenanceLeasing.features.feature${i}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{t("maintenanceLeasing.idealFor.title")}</h3>
                <ul className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <li key={i} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-gray-700">{t(`maintenanceLeasing.idealFor.type${i}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2">
            <h3 className="text-xl font-bold mb-4 text-gray-900">{t("maintenanceLeasing.comparison.title")}</h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    ></th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("maintenanceLeasing.comparison.option1")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("maintenanceLeasing.comparison.option2")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {t("maintenanceLeasing.comparison.option3")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { key: "financing", included: [true, true, true] },
                    { key: "maintenance", included: [false, true, true] },
                    { key: "tires", included: [false, true, true] },
                    { key: "repairs", included: [false, false, true] },
                    { key: "insurance", included: [false, false, "optional"] },
                    { key: "roadside", included: [false, "optional", true] },
                    { key: "replacement", included: [false, "optional", true] },
                  ].map((row) => (
                    <tr key={row.key}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {t(`maintenanceLeasing.comparison.${row.key}`)}
                      </td>
                      {row.included.map((status, index) => (
                        <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                          {status === true && (
                            <span className="text-green-600 font-medium">
                              {t("maintenanceLeasing.comparison.included")}
                            </span>
                          )}
                          {status === false && (
                            <span className="text-red-600 font-medium">
                              {t("maintenanceLeasing.comparison.excluded")}
                            </span>
                          )}
                          {status === "optional" && (
                            <span className="text-yellow-600 font-medium">
                              {t("maintenanceLeasing.comparison.optional")}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}

                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {t("maintenanceLeasing.comparison.flexibility")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                      <span className="font-medium">{t("maintenanceLeasing.comparison.high")}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                      <span className="font-medium">{t("maintenanceLeasing.comparison.medium")}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                      <span className="font-medium">{t("maintenanceLeasing.comparison.low")}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* MiniLeasing Section */}
      <SectionContainer bgColor="bg-gray-50">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4 text-gray-900">{t("miniLeasing.pricing.title")}</h3>

            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{t(`miniLeasing.pricing.category${i}`)}</h4>
                  </div>
                  <div className="text-lg font-bold text-blue-600">{t(`miniLeasing.pricing.price${i}`)}</div>
                </div>
              ))}

              <p className="text-sm text-gray-500 mt-3 italic">{t("miniLeasing.pricing.note")}</p>
            </div>
          </div>

          <div className="lg:w-1/2">
            <div className="mb-6">
              <IconCalendar className="w-12 h-12 text-blue-600 mb-2" />
              <h2 className="text-3xl font-bold mb-2 text-gray-900">{t("miniLeasing.title")}</h2>
              <p className="text-lg font-medium text-blue-600 mb-4">{t("miniLeasing.subtitle")}</p>
              <p className="text-gray-700">{t("miniLeasing.description")}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{t("miniLeasing.features.title")}</h3>
                <ul className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <li key={i} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{t(`miniLeasing.features.feature${i}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{t("miniLeasing.idealFor.title")}</h3>
                <ul className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <li key={i} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-gray-700">{t(`miniLeasing.idealFor.type${i}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* FAQ Section */}
      <SectionContainer bgColor="bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">{t("faq.title")}</h2>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className="w-full flex justify-between items-center p-4 text-left font-medium bg-gray-50 hover:bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  onClick={() => toggleFaq(i)}
                >
                  <span>{t(`faq.q${i}`)}</span>
                  <svg
                    className={`w-5 h-5 transition-transform text-blue-600 ${
                      openFaqIndex === i ? "transform rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openFaqIndex === i && (
                  <div className="p-4 pt-0 border-t border-gray-200 bg-white text-gray-800">
                    <p className="py-3">{t(`faq.a${i}`)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>

      {/* CTA Section */}
      <SectionContainer bgColor="bg-blue-600">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t("cta.title")}</h2>
          <p className="text-lg text-blue-100 mb-8">{t("cta.description")}</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button size="lg" asChild>
              <Link href={`/${locale}${t("cta.buttonHref")}`}>{t("cta.button")}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
              asChild
            >
              <Link href="tel:+358501234567">{t("cta.contact")}</Link>
            </Button>
          </div>
        </div>
      </SectionContainer>
    </main>
  );
}
