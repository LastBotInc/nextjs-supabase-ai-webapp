import { Metadata } from 'next'
import { generateLocalizedMetadata } from '@/utils/metadata'
import AdminLayoutClient from './AdminLayoutClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{
    locale: string
  }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return generateLocalizedMetadata(locale, 'Admin', {
    title: 'Admin',
    description: 'LastBot Admin Dashboard',
    type: 'website',
    canonicalUrl: '/admin',
    noindex: true // Admin pages should not be indexed
  })
}

// Server component wrapper
export default async function AdminLayout({
  children,
  params
}: Props) {
  const { locale } = await params
  return <AdminLayoutClient params={{ locale }}>{children}</AdminLayoutClient>
} 