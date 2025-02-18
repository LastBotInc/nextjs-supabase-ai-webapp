'use client'

import { ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ClientTabsProps {
  pageViews: ReactNode
  topPages: ReactNode
  translations: {
    pageViews: string
    topPages: string
  }
}

export default function ClientTabs({ pageViews, topPages, translations }: ClientTabsProps) {
  return (
    <Tabs defaultValue="pageViews" className="space-y-4">
      <TabsList>
        <TabsTrigger value="pageViews" className="dark:text-white">{translations.pageViews}</TabsTrigger>
        <TabsTrigger value="topPages" className="dark:text-white">{translations.topPages}</TabsTrigger>
      </TabsList>
      <TabsContent value="pageViews">
        {pageViews}
      </TabsContent>
      <TabsContent value="topPages">
        {topPages}
      </TabsContent>
    </Tabs>
  )
} 