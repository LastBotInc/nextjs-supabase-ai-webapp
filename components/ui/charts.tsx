'use client'

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

interface ChartData {
  name: string
  value: number
}

interface ChartProps {
  data: ChartData[]
}

const DynamicLineChart = dynamic(
  () => import('./DynamicLineChart'),
  { ssr: false }
) as ComponentType<ChartProps>

const DynamicBarChart = dynamic(
  () => import('./DynamicBarChart'),
  { ssr: false }
) as ComponentType<ChartProps>

export function LineChart(props: ChartProps) {
  return <DynamicLineChart {...props} />
}

export function BarChart(props: ChartProps) {
  return <DynamicBarChart {...props} />
} 