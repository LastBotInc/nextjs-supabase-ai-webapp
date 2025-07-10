'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  Globe, 
  MapPin, 
  Languages, 
  Users, 
  Shield,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { useTranslations } from 'next-intl'

interface GeographicData {
  country: string
  countryCode: string
  region: string
  city: string
  preferredLanguage: string
  continent: string
  marketingRegion: string
  currency: string
  isEU: boolean
  isGDPRRegion: boolean
  languageFamily: string
}

interface GeographicInsights {
  totalUsers: number
  uniqueCountries: number
  uniqueLanguages: number
  topCountry: string
  topLanguage: string
  topMarketingRegion: string
  gdprPercentage: number
  languageDiversity: number
  geographicSpread: number
}

interface ChartDataItem {
  name: string
  value: number
  percentage: string
}

interface GeographicAnalyticsData {
  insights: GeographicInsights
  chartData: ChartDataItem[]
  groupBy: string
  totalEvents: number
  dateRange: {
    startDate: string | null
    endDate: string | null
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

export default function GeographicAnalytics({ dateRange }: { dateRange: string }) {
  const t = useTranslations('Admin.Analytics.Geographic')
  const [data, setData] = useState<GeographicAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [groupBy, setGroupBy] = useState('country')
  const [collectingGeoData, setCollectingGeoData] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        group_by: groupBy,
        limit: '100'
      })
      
      // Convert dateRange string to actual dates
      const now = new Date()
      let startDate: string | null = null
      let endDate: string | null = null
      
      switch (dateRange) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000).toISOString()
          break
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
          break
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
          break
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
          break
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
          break
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString()
          break
      }
      
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      
      const response = await fetch(`/api/analytics/geographic?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const collectGeographicData = async () => {
    try {
      setCollectingGeoData(true)
      
      const response = await fetch('/api/analytics/geographic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_url: window.location.pathname,
          timestamp: new Date().toISOString()
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Refresh the data after collecting
          await fetchData()
        }
      }
    } catch (err) {
      console.error('Error collecting geographic data:', err)
    } finally {
      setCollectingGeoData(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [dateRange, groupBy])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('retry')}
        </Button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">{t('noData')}</p>
        <Button onClick={collectGeographicData} disabled={collectingGeoData}>
          {collectingGeoData ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Globe className="h-4 w-4 mr-2" />
          )}
          {t('collectData')}
        </Button>
      </div>
    )
  }

  const { insights, chartData } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t('title')}</h2>
          <p className="text-gray-600">{t('description')}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={collectGeographicData} 
            disabled={collectingGeoData}
            variant="outline"
            size="sm"
          >
            {collectingGeoData ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Globe className="h-4 w-4 mr-2" />
            )}
            {t('collectData')}
          </Button>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('refresh')}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {t('acrossCountries', { count: insights.uniqueCountries })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('topCountry')}</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.topCountry}</div>
            <p className="text-xs text-muted-foreground">
              {t('mostPopularLocation')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('topLanguage')}</CardTitle>
            <Languages className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.topLanguage}</div>
            <p className="text-xs text-muted-foreground">
              {t('languagesTotal', { count: insights.uniqueLanguages })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('gdprCompliance')}</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.gdprPercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {t('gdprRegionUsers')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Group By Controls */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-sm font-medium">{t('groupBy')}:</span>
        {[
          { key: 'country', label: t('country') },
          { key: 'region', label: t('region') },
          { key: 'city', label: t('city') },
          { key: 'language', label: t('language') },
          { key: 'continent', label: t('continent') },
          { key: 'marketing_region', label: t('marketingRegion') },
          { key: 'currency', label: t('currency') },
          { key: 'timezone', label: t('timezone') }
        ].map((option) => (
          <Button
            key={option.key}
            variant={groupBy === option.key ? "default" : "outline"}
            size="sm"
            onClick={() => setGroupBy(option.key)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t('topLocations')} ({t(groupBy)})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, t('users')]}
                  labelFormatter={(label) => `${t(groupBy)}: ${label}`}
                />
                <Bar dataKey="value" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('distribution')} ({t(groupBy)})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.slice(0, 8).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, t('users')]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('diversityMetrics')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
                         <div className="flex justify-between items-center">
               <span className="text-sm">{t('languageDiversity')}</span>
               <Badge variant="secondary">
                 {(insights.languageDiversity * 100).toFixed(1)}%
               </Badge>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-sm">{t('geographicSpread')}</span>
               <Badge variant="secondary">
                 {(insights.geographicSpread * 100).toFixed(1)}%
               </Badge>
             </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">{t('topMarketingRegion')}</span>
              <Badge variant="secondary">
                {insights.topMarketingRegion}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('complianceOverview')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
                         <div className="flex justify-between items-center">
               <span className="text-sm">{t('gdprApplicable')}</span>
               <Badge variant={insights.gdprPercentage > 0 ? "error" : "secondary"}>
                 {insights.gdprPercentage.toFixed(1)}%
               </Badge>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-sm">{t('uniqueCountries')}</span>
               <Badge variant="secondary">
                 {insights.uniqueCountries}
               </Badge>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-sm">{t('uniqueLanguages')}</span>
               <Badge variant="secondary">
                 {insights.uniqueLanguages}
               </Badge>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('detailedBreakdown')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">{t(groupBy)}</th>
                  <th className="text-right p-2">{t('users')}</th>
                  <th className="text-right p-2">{t('percentage')}</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{item.name}</td>
                    <td className="p-2 text-right">{item.value.toLocaleString()}</td>
                    <td className="p-2 text-right">{item.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 