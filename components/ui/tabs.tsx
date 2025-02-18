'use client'

import * as React from 'react'

interface TabsContextValue {
  selectedTab: string
  setSelectedTab: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string
}

export function Tabs({ defaultValue, children, ...props }: TabsProps) {
  const [selectedTab, setSelectedTab] = React.useState(defaultValue)

  return (
    <TabsContext.Provider value={{ selectedTab, setSelectedTab }}>
      <div {...props}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}
      {...props}
    />
  )
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export function TabsTrigger({ value, className, ...props }: TabsTriggerProps) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')

  const { selectedTab, setSelectedTab } = context
  const isSelected = selectedTab === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isSelected
          ? 'bg-background text-foreground shadow-sm'
          : 'hover:bg-background/50 hover:text-foreground'
      } ${className}`}
      onClick={() => setSelectedTab(value)}
      {...props}
    />
  )
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export function TabsContent({ value, className, ...props }: TabsContentProps) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')

  const { selectedTab } = context
  if (selectedTab !== value) return null

  return <div className={`mt-2 ring-offset-background ${className}`} {...props} />
} 