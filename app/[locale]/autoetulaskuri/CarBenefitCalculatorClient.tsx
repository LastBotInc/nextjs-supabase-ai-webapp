'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useFormatter } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

interface CarBenefitCalculatorClientProps {
  locale: string
  translations: {
    calculatorTab: any
    inputs: any
    results: any
  }
}

export default function CarBenefitCalculatorClient({ locale, translations }: CarBenefitCalculatorClientProps) {
  // Client-side localization
  const t = useTranslations('CarBenefitCalculator')
  const format = useFormatter()

  // State for calculator
  const [calculatorTab, setCalculatorTab] = useState('free')
  const [carValue, setCarValue] = useState(40000)
  const [monthlyCost, setMonthlyCost] = useState(600)
  const [annualDriving, setAnnualDriving] = useState(20000)
  const [homeToWork, setHomeToWork] = useState(30)
  const [results, setResults] = useState<any>(null)
  
  // Derived values
  const monthlyKm = Math.round(annualDriving / 12)
  const workKm = Math.round((homeToWork * 2) * 21) // 21 work days per month
  const privateKm = monthlyKm - workKm > 0 ? monthlyKm - workKm : 0

  // Calculate results on input change
  useEffect(() => {
    if (calculatorTab === 'free') {
      // Free car benefit calculations (example)
      const taxValue = Math.round(carValue * 0.01 + 300)
      const netCostPerMonth = Math.round(taxValue * 0.4) // Assuming 40% tax rate
      const costPerKm = (netCostPerMonth / privateKm).toFixed(2)
      
      setResults({
        taxValue,
        netCostPerMonth,
        costPerKm: privateKm > 0 ? costPerKm : '0.00',
        annualTaxCost: taxValue * 12,
        privateUsePercentage: Math.round((privateKm / monthlyKm) * 100),
        savings: 0
      })
    } else {
      // Usage benefit calculations (example)
      const baseTaxValue = Math.round(carValue * 0.008 + 120)
      const kmAddition = Math.round(annualDriving * 0.08)
      const taxValue = baseTaxValue + kmAddition
      const netCostPerMonth = Math.round(taxValue * 0.4) // Assuming 40% tax rate
      const costPerKm = (netCostPerMonth / privateKm).toFixed(2)
      
      setResults({
        taxValue,
        netCostPerMonth,
        costPerKm: privateKm > 0 ? costPerKm : '0.00',
        annualTaxCost: taxValue * 12,
        privateUsePercentage: Math.round((privateKm / monthlyKm) * 100),
        savings: Math.round(monthlyCost - netCostPerMonth)
      })
    }
  }, [calculatorTab, carValue, monthlyCost, annualDriving, homeToWork, privateKm, monthlyKm])

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <Tabs defaultValue="free">
        <div className="p-6 bg-beige">
          <h3 className="text-2xl font-bold text-piki mb-4">
            {t('calculator.selectBenefitType')}
          </h3>
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="free">{t('calculator.tabs.freeBenefit')}</TabsTrigger>
            <TabsTrigger value="usage">{t('calculator.tabs.usageBenefit')}</TabsTrigger>
          </TabsList>
          <div className="text-sm text-gray-600">
            <InformationCircleIcon className="inline-block h-4 w-4 mr-1" />
            {t('calculator.benefitTypeDescription')}
          </div>
        </div>

        <div className="p-8">
          <TabsContent value="free" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium text-piki mb-6">
                  {t('calculator.inputs.title')}
                </h4>
                
                {/* Car value slider */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t('calculator.inputs.carValue')}
                    </label>
                    <span className="text-lg font-bold text-kupari">
                      {format.number(carValue, { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <Slider
                    value={[carValue]}
                    onValueChange={(val) => setCarValue(val[0])}
                    min={10000}
                    max={100000}
                    step={1000}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10 000 €</span>
                    <span>100 000 €</span>
                  </div>
                </div>
                
                {/* Annual driving slider */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t('calculator.inputs.annualDriving')}
                    </label>
                    <span className="text-lg font-bold text-kupari">
                      {format.number(annualDriving)} km
                    </span>
                  </div>
                  <Slider
                    value={[annualDriving]}
                    onValueChange={(val) => setAnnualDriving(val[0])}
                    min={5000}
                    max={50000}
                    step={1000}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>5 000 km</span>
                    <span>50 000 km</span>
                  </div>
                </div>
                
                {/* Home to work distance slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t('calculator.inputs.homeToWork')}
                    </label>
                    <span className="text-lg font-bold text-kupari">
                      {homeToWork} km
                    </span>
                  </div>
                  <Slider
                    value={[homeToWork]}
                    onValueChange={(val) => setHomeToWork(val[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0 km</span>
                    <span>100 km</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-piki mb-6">
                  {t('calculator.results.title')}
                </h4>
                
                {results && (
                  <div className="space-y-6">
                    <div className="bg-beige p-6 rounded-lg text-center">
                      <div className="text-sm text-gray-700 mb-1">
                        {t('calculator.results.taxableValue')}
                      </div>
                      <div className="text-3xl font-bold text-piki">
                        {format.number(results.taxValue, { style: 'currency', currency: 'EUR' })}
                        <span className="text-sm font-normal text-gray-600 ml-1">/ {t('calculator.results.month')}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-700 mb-1">
                          {t('calculator.results.netCost')}
                        </div>
                        <div className="text-xl font-bold text-piki">
                          {format.number(results.netCostPerMonth, { style: 'currency', currency: 'EUR' })}
                          <span className="text-xs font-normal text-gray-600 ml-1">/ {t('calculator.results.month')}</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-700 mb-1">
                          {t('calculator.results.costPerKm')}
                        </div>
                        <div className="text-xl font-bold text-piki">
                          {results.costPerKm} €
                          <span className="text-xs font-normal text-gray-600 ml-1">/ km</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <span className="text-gray-700">{t('calculator.results.annualTaxCost')}</span>
                        <span className="font-medium text-piki">
                          {format.number(results.annualTaxCost, { style: 'currency', currency: 'EUR' })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <span className="text-gray-700">{t('calculator.results.monthlyDriving')}</span>
                        <span className="font-medium text-piki">{monthlyKm} km</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <span className="text-gray-700">{t('calculator.results.workDriving')}</span>
                        <span className="font-medium text-piki">{workKm} km</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <span className="text-gray-700">{t('calculator.results.privateDriving')}</span>
                        <span className="font-medium text-piki">{privateKm} km</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">{t('calculator.results.privateUsePercentage')}</span>
                        <span className="font-medium text-piki">{results.privateUsePercentage}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="usage" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium text-piki mb-6">
                  {t('calculator.inputs.title')}
                </h4>
                
                {/* Car value slider */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t('calculator.inputs.carValue')}
                    </label>
                    <span className="text-lg font-bold text-kupari">
                      {format.number(carValue, { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <Slider
                    value={[carValue]}
                    onValueChange={(val) => setCarValue(val[0])}
                    min={10000}
                    max={100000}
                    step={1000}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10 000 €</span>
                    <span>100 000 €</span>
                  </div>
                </div>
                
                {/* Monthly cost slider - only shown for usage benefit */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t('calculator.inputs.monthlyCost')}
                    </label>
                    <span className="text-lg font-bold text-kupari">
                      {format.number(monthlyCost, { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <Slider
                    value={[monthlyCost]}
                    onValueChange={(val) => setMonthlyCost(val[0])}
                    min={300}
                    max={1500}
                    step={50}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>300 €</span>
                    <span>1 500 €</span>
                  </div>
                </div>
                
                {/* Annual driving slider */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t('calculator.inputs.annualDriving')}
                    </label>
                    <span className="text-lg font-bold text-kupari">
                      {format.number(annualDriving)} km
                    </span>
                  </div>
                  <Slider
                    value={[annualDriving]}
                    onValueChange={(val) => setAnnualDriving(val[0])}
                    min={5000}
                    max={50000}
                    step={1000}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>5 000 km</span>
                    <span>50 000 km</span>
                  </div>
                </div>
                
                {/* Home to work distance slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t('calculator.inputs.homeToWork')}
                    </label>
                    <span className="text-lg font-bold text-kupari">
                      {homeToWork} km
                    </span>
                  </div>
                  <Slider
                    value={[homeToWork]}
                    onValueChange={(val) => setHomeToWork(val[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0 km</span>
                    <span>100 km</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-piki mb-6">
                  {t('calculator.results.title')}
                </h4>
                
                {results && (
                  <div className="space-y-6">
                    <div className="bg-beige p-6 rounded-lg text-center">
                      <div className="text-sm text-gray-700 mb-1">
                        {t('calculator.results.monthlySavings')}
                      </div>
                      <div className="text-3xl font-bold text-piki">
                        {format.number(results.savings, { style: 'currency', currency: 'EUR' })}
                        <span className="text-sm font-normal text-gray-600 ml-1">/ {t('calculator.results.month')}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-700 mb-1">
                          {t('calculator.results.taxableValue')}
                        </div>
                        <div className="text-xl font-bold text-piki">
                          {format.number(results.taxValue, { style: 'currency', currency: 'EUR' })}
                          <span className="text-xs font-normal text-gray-600 ml-1">/ {t('calculator.results.month')}</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-700 mb-1">
                          {t('calculator.results.netCost')}
                        </div>
                        <div className="text-xl font-bold text-piki">
                          {format.number(results.netCostPerMonth, { style: 'currency', currency: 'EUR' })}
                          <span className="text-xs font-normal text-gray-600 ml-1">/ {t('calculator.results.month')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <span className="text-gray-700">{t('calculator.results.annualTaxCost')}</span>
                        <span className="font-medium text-piki">
                          {format.number(results.annualTaxCost, { style: 'currency', currency: 'EUR' })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <span className="text-gray-700">{t('calculator.results.monthlyDriving')}</span>
                        <span className="font-medium text-piki">{monthlyKm} km</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <span className="text-gray-700">{t('calculator.results.workDriving')}</span>
                        <span className="font-medium text-piki">{workKm} km</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <span className="text-gray-700">{t('calculator.results.privateDriving')}</span>
                        <span className="font-medium text-piki">{privateKm} km</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">{t('calculator.results.privateUsePercentage')}</span>
                        <span className="font-medium text-piki">{results.privateUsePercentage}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
      
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <div className="text-center">
          <Button 
            size="lg"
            className="bg-kupari hover:bg-kupari/90 text-white px-8"
            asChild
          >
            <Link href={`/${locale}/leasing-solutions`}>
              {t('calculator.callToAction')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 