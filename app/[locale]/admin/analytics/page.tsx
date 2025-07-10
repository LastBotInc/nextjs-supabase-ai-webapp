'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { 
  getAnalyticsData, 
  getRealtimeAnalytics, 
  getConversionData, 
  getEngagementData,
  type AnalyticsData,
  type RealtimeAnalytics,
  type ConversionData,
  type EngagementData
} from './services'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCw, Users, Eye, Clock, TrendingUp, Globe, Monitor, MousePointer, Calendar, Smartphone } from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import UserAgentAnalytics from './user-agents'

// Color palette for charts
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
    </div>
  )
}

// Chart loading skeleton
function ChartSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  )
}

// Date range selector component
function DateRangeSelector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const dateRangeOptions = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ]

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {dateRangeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// Metric card component
function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  loading = false,
  change,
  changeType = 'neutral'
}: {
  title: string
  value: string | number
  icon: any
  trend?: string
  loading?: boolean
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
}) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <p className={`text-xs ${getChangeColor()}`}>
                {change} from previous period
              </p>
            )}
            {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Page views chart component
function PageViewsChart({ data, loading }: { data?: AnalyticsData; loading: boolean }) {
  if (loading) {
    return <ChartSkeleton />
  }

  // Use actual time series data from the analytics service
  const chartData = data?.timeSeriesData || []

  // Show empty state if no data
  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-2xl mb-2">📊</div>
          <p>No data available for the selected period</p>
          <p className="text-sm">Start browsing your site to see analytics data</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="date" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="pageViews" 
          stroke="#3b82f6" 
          fillOpacity={1} 
          fill="url(#colorViews)"
          name="Page Views"
        />
        <Area 
          type="monotone" 
          dataKey="uniqueVisitors" 
          stroke="#10b981" 
          fillOpacity={1} 
          fill="url(#colorUsers)"
          name="Unique Users"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// Top pages bar chart
function TopPagesChart({ data, loading }: { data?: AnalyticsData; loading: boolean }) {
  if (loading) {
    return <ChartSkeleton />
  }

  const chartData = data?.topPages.slice(0, 8).map(page => ({
    page: page.page.length > 20 ? page.page.substring(0, 20) + '...' : page.page,
    views: page.views,
    time: page.avg_time
  })) || []

  // Show empty state if no data
  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-2xl mb-2">📄</div>
          <p>No page data available</p>
          <p className="text-sm">Page views will appear here once you have traffic</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="horizontal">
        <XAxis type="number" />
        <YAxis dataKey="page" type="category" width={120} />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Bar dataKey="views" fill="#3b82f6" name="Views" />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Traffic sources pie chart
function TrafficSourcesChart({ data, loading }: { data?: AnalyticsData; loading: boolean }) {
  if (loading) {
    return <ChartSkeleton />
  }

  const chartData = data?.trafficSources.map((source, index) => ({
    name: source.source,
    value: source.visitors,
    percentage: source.percentage
  })) || []

  // Show empty state if no data
  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-2xl mb-2">🌐</div>
          <p>No traffic source data available</p>
          <p className="text-sm">Traffic sources will appear here once you have visitors</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

// Engagement metrics chart
function EngagementChart({ data, loading }: { data?: EngagementData; loading: boolean }) {
  if (loading) {
    return <ChartSkeleton />
  }

  // Only show real data - no mock data
  if (!data || (data.averageTimeOnPage === 0 && data.averageScrollDepth === 0 && data.engagementRate === 0)) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-2xl mb-2">📈</div>
          <p>No engagement data available</p>
          <p className="text-sm">Engagement metrics will appear here once you have user interactions</p>
        </div>
      </div>
    )
  }

  // Create a simple single-point chart with actual data
  const chartData = [{
    date: 'Current',
    timeOnPage: Math.round(data.averageTimeOnPage),
    scrollDepth: Math.round(data.averageScrollDepth),
    engagementRate: Math.round(data.engagementRate)
  }]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="timeOnPage" 
          stroke="#3b82f6" 
          name="Avg Time on Page (s)"
        />
        <Line 
          type="monotone" 
          dataKey="scrollDepth" 
          stroke="#10b981" 
          name="Avg Scroll Depth (%)"
        />
        <Line 
          type="monotone" 
          dataKey="engagementRate" 
          stroke="#f59e0b" 
          name="Engagement Rate (%)"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// Device types chart
function DeviceTypesChart({ data, loading }: { data?: AnalyticsData; loading: boolean }) {
  if (loading) {
    return <ChartSkeleton />
  }

  const chartData = data?.deviceTypes.map((device, index) => ({
    name: device.type,
    value: device.percentage
  })) || []

  // Show empty state if no data
  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-2xl mb-2">📱</div>
          <p>No device data available</p>
          <p className="text-sm">Device types will appear here once you have visitors</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

// Real-time activity component
function RealtimeActivity({ data, loading }: { data?: RealtimeAnalytics; loading: boolean }) {
  const t = useTranslations('Admin.analytics')

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            {t('realtime.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          {t('realtime.title')}
          <Badge variant="secondary">{data?.metrics.activeUsers || 0} active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Page Views</p>
              <p className="text-xl font-semibold">{data?.metrics.pageViews || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-xl font-semibold">€{data?.metrics.totalRevenue?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
          
          {data?.content.topPages && data.content.topPages.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Top Pages Right Now</p>
              <div className="space-y-1">
                {data.content.topPages.slice(0, 3).map((page, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="truncate">{page.page}</span>
                    <span className="text-muted-foreground">{page.views}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Top pages component
function TopPagesTable({ data, loading }: { data?: AnalyticsData; loading: boolean }) {
  const t = useTranslations('Admin.analytics')

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t('tables.topPages')}</h3>
      <div className="rounded-md border">
        <div className="grid grid-cols-3 gap-4 p-4 font-medium border-b">
          <div>Page</div>
          <div>Views</div>
          <div>Avg. Time</div>
        </div>
        {data?.topPages.map((page, index) => (
          <div key={index} className="grid grid-cols-3 gap-4 p-4 border-b last:border-b-0">
            <div className="truncate">{page.page}</div>
            <div>{page.views}</div>
            <div>{Math.round(page.avg_time)}s</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Traffic sources component
function TrafficSourcesTable({ data, loading }: { data?: AnalyticsData; loading: boolean }) {
  const t = useTranslations('Admin.analytics')

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t('tables.trafficSources')}</h3>
      <div className="rounded-md border">
        <div className="grid grid-cols-3 gap-4 p-4 font-medium border-b">
          <div>Source</div>
          <div>Visitors</div>
          <div>Percentage</div>
        </div>
        {data?.trafficSources.map((source, index) => (
          <div key={index} className="grid grid-cols-3 gap-4 p-4 border-b last:border-b-0">
            <div className="truncate">{source.source}</div>
            <div>{source.visitors}</div>
            <div>{source.percentage.toFixed(1)}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsDashboard() {
  const t = useTranslations('Admin.analytics')
  const [dateRange, setDateRange] = useState('7d')
  const [loading, setLoading] = useState(true)
  const [realtimeLoading, setRealtimeLoading] = useState(true)
  
  // Data states
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>()
  const [realtimeData, setRealtimeData] = useState<RealtimeAnalytics>()
  const [conversionData, setConversionData] = useState<ConversionData>()
  const [engagementData, setEngagementData] = useState<EngagementData>()

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const [analytics, conversions, engagement] = await Promise.all([
        getAnalyticsData(dateRange),
        getConversionData(dateRange),
        getEngagementData(dateRange)
      ])
      
      setAnalyticsData(analytics)
      setConversionData(conversions)
      setEngagementData(engagement)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch real-time data
  const fetchRealtimeData = async () => {
    try {
      setRealtimeLoading(true)
      const realtime = await getRealtimeAnalytics()
      setRealtimeData(realtime)
    } catch (error) {
      console.error('Error fetching real-time data:', error)
    } finally {
      setRealtimeLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange])

  useEffect(() => {
    fetchRealtimeData()
    
    // Set up real-time data refresh every 30 seconds
    const interval = setInterval(fetchRealtimeData, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold dark:text-white">{t('title')}</h1>
        <div className="flex items-center gap-4">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
          <Button onClick={fetchAnalyticsData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Page Views"
          value={analyticsData?.totalPageViews || 0}
          icon={Eye}
          loading={loading}
        />
        <MetricCard
          title="Unique Visitors"
          value={analyticsData?.uniqueVisitors || 0}
          icon={Users}
          loading={loading}
        />
        <MetricCard
          title="Avg. Session Duration"
          value={`${Math.round((analyticsData?.avgSessionDuration || 0) / 60)}m`}
          icon={Clock}
          loading={loading}
        />
        <MetricCard
          title="Bounce Rate"
          value={`${analyticsData?.bounceRate?.toFixed(1) || 0}%`}
          icon={TrendingUp}
          loading={loading}
        />
      </div>

      {/* Real-time Activity */}
      <RealtimeActivity data={realtimeData} loading={realtimeLoading} />

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Page Views Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <PageViewsChart data={analyticsData} loading={loading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <TrafficSourcesChart data={analyticsData} loading={loading} />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="user-agents">User Agents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Pages Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <TopPagesChart data={analyticsData} loading={loading} />
              </CardContent>
            </Card>
            <div className="space-y-6">
              <TopPagesTable data={analyticsData} loading={loading} />
            </div>
          </div>
          <TrafficSourcesTable data={analyticsData} loading={loading} />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Avg. Time on Page"
              value={`${Math.round(engagementData?.averageTimeOnPage || 0)}s`}
              icon={Clock}
              loading={loading}
            />
            <MetricCard
              title="Avg. Scroll Depth"
              value={`${Math.round(engagementData?.averageScrollDepth || 0)}%`}
              icon={MousePointer}
              loading={loading}
            />
            <MetricCard
              title="Engagement Rate"
              value={`${engagementData?.engagementRate?.toFixed(1) || 0}%`}
              icon={TrendingUp}
              loading={loading}
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Engagement Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <EngagementChart data={engagementData} loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard
              title="Total Revenue"
              value={`€${conversionData?.totalRevenue?.toFixed(2) || '0.00'}`}
              icon={TrendingUp}
              loading={loading}
            />
            <MetricCard
              title="Total Transactions"
              value={conversionData?.totalTransactions || 0}
              icon={TrendingUp}
              loading={loading}
            />
            <MetricCard
              title="Avg. Order Value"
              value={`€${conversionData?.averageOrderValue?.toFixed(2) || '0.00'}`}
              icon={TrendingUp}
              loading={loading}
            />
            <MetricCard
              title="Conversion Rate"
              value={`${conversionData?.conversionRate?.toFixed(2) || 0}%`}
              icon={TrendingUp}
              loading={loading}
            />
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Device Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Device Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DeviceTypesChart data={analyticsData} loading={loading} />
              </CardContent>
            </Card>

            {/* Countries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Countries
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <LoadingSkeleton />
                ) : (
                  <div className="space-y-2">
                    {analyticsData?.countries.map((country, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{country.country}</span>
                        <span>{country.percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="user-agents" className="space-y-4">
          <UserAgentAnalytics dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 