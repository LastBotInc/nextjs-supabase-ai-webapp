import { redirect } from 'next/navigation'

export default async function ContentGeneratorPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  // Redirect to the new combined content calendar and planner
  redirect(`/${locale}/admin/content-calendar`)
}