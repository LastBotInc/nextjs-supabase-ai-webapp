'use client'

import { useEffect } from 'react'
import ABTestButton from '@/components/ab-testing/ABTestButton'
import { initializeABTesting } from '@/lib/ab-testing'

export default function ABTestingDemo() {
  useEffect(() => {
    // Initialize A/B testing when the component mounts
    initializeABTesting()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            A/B Testing Demo
          </h1>
          <p className="text-xl text-gray-600">
            This page demonstrates our A/B testing system in action
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Hero Section Test */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Hero Button Test</h2>
            <p className="text-gray-600 mb-6">
              We're testing different button colors to see which converts better.
              The experiment "Homepage Hero Button Test" will show either a blue or green button.
            </p>
            
            <div className="text-center">
              <ABTestButton
                experimentName="Homepage Hero Button Test"
                conversionGoal="hero_button_click"
                defaultText="Get Started"
                defaultColor="blue"
                onClick={() => {
                  alert('Button clicked! This conversion has been tracked.')
                }}
                className="px-8 py-4 text-lg font-semibold"
              />
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-gray-700">How it works:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Users are randomly assigned to Control (blue) or Variant A (green)</li>
                <li>• Each button click is tracked as a conversion</li>
                <li>• Statistical significance is calculated automatically</li>
                <li>• Results are available in the admin analytics dashboard</li>
              </ul>
            </div>
          </div>

          {/* CTA Section Test */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Call-to-Action Test</h2>
            <p className="text-gray-600 mb-6">
              Testing different CTA button styles and text to optimize conversions.
              This would be a separate experiment with different variants.
            </p>
            
            <div className="text-center">
              <button 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-lg"
                onClick={() => {
                  alert('This could be another A/B test!')
                }}
              >
                Start Free Trial
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-gray-700">Potential tests:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• "Start Free Trial" vs "Get Started Free"</li>
                <li>• Purple vs Orange button color</li>
                <li>• Large vs Medium button size</li>
                <li>• With vs Without button icon</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Current Experiment Status */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Current Experiments</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Homepage Hero Button Test</h3>
                <p className="text-blue-700">Testing button colors for conversion optimization</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Running
                </span>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-blue-600">Hypothesis</p>
                <p className="text-sm text-blue-900">A green button will have higher conversion rate than the current blue button</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">Primary Goal</p>
                <p className="text-sm text-blue-900">hero_button_click</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">Traffic Allocation</p>
                <p className="text-sm text-blue-900">100%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Implementation Guide */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Implementation Guide</h2>
          
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">1. Set up the experiment in the database</h3>
            <p className="text-gray-600 mb-4">
              The "Homepage Hero Button Test" experiment is already created with two variants:
            </p>
            <ul className="text-gray-600 mb-6">
              <li>• Control (Blue): Original blue button</li>
              <li>• Variant A (Green): Green button alternative</li>
            </ul>
            
            <h3 className="text-lg font-semibold mb-3 text-gray-800">2. Use the ABTestButton component</h3>
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <code className="text-sm">
{`<ABTestButton
  experimentName="Homepage Hero Button Test"
  conversionGoal="hero_button_click"
  defaultText="Get Started"
  defaultColor="blue"
  onClick={() => {
    // Handle button click
  }}
/>`}
              </code>
            </div>
            
            <h3 className="text-lg font-semibold mb-3 text-gray-800">3. View results in the admin dashboard</h3>
            <p className="text-gray-600">
              Navigate to Admin → Analytics → A/B Testing to view experiment results, 
              statistical significance, and performance metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 