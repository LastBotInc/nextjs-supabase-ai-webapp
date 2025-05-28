import { createClient } from '@/utils/supabase/server'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/utils/date'
import { Database } from '@/types/database'
import { LandingPagePublishToggle } from './LandingPagePublishToggle'

type LandingPage = Database['public']['Tables']['landing_pages']['Row']

interface Props {
  params: Promise<{
    locale: string
  }>
  searchParams: { 
    search?: string 
  }
}

export default async function LandingPagesPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  const t = await getTranslations('LandingPages')
  const supabase = await createClient(undefined, true)

  // Fetch landing pages with search filter
  const searchTerm = searchParams.search;
  let query = supabase
    .from('landing_pages')
    .select('*')
    .eq('locale', locale)
    .order('created_at', { ascending: false })

  if (searchTerm) {
    query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
  }

  const { data: pages, error } = await query

  if (error) {
    console.error('Error fetching landing pages:', error)
    return (
      <div className="p-4">
        <div className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 p-4 rounded-lg">
          {t('error.load')}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            {t('description')}
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link href={`/${locale}/admin/landing-pages/new`}>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              {t('createPage')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6 flex gap-4">
        <div className="relative flex-1 max-w-lg">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -mt-2 h-4 w-4 text-gray-400 dark:text-gray-600" />
          <Input
            type="search"
            name="search"
            defaultValue={searchTerm}
            placeholder={t('search')}
            className="pl-10"
          />
        </div>
      </div>

      {/* Landing pages list */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">
                      {t('form.title')}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t('form.slug')}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t('status')}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t('lastModified')}
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">{t('actions')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {pages?.map((page) => (
                    <tr key={page.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                        {page.title}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {page.slug}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <LandingPagePublishToggle page={page} locale={locale} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(page.updated_at)}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/${locale}/admin/landing-pages/${page.id}`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {t('edit')}
                          </Link>
                          <Link
                            href={`/${locale}/${page.slug}`}
                            target="_blank"
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            {t('view')}
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pages?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        {searchTerm ? t('noSearchResults') : t('noPages')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 