'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Calendar, Sparkles, Search, Image, Globe, FileType } from 'lucide-react';
import BrandManager from '@/components/admin/BrandManager';
import ContentTypesManager from '@/components/admin/ContentTypesManager';
import AIPersonaManager from '@/components/admin/AIPersonaManager';

const cmsModules = [
  {
    title: 'Content Generator',
    description: 'AI-powered bulk content creation tools',
    href: '/admin/content-generator',
    icon: Sparkles,
    color: 'bg-yellow-500',
  },
  {
    title: 'Blog Admin',
    description: 'Manage blog posts, categories, and tags',
    href: '/admin/blog',
    icon: FileText,
    color: 'bg-blue-500',
  },
  {
    title: 'Content Calendar',
    description: 'Plan and schedule content publication',
    href: '/admin/content-calendar',
    icon: Calendar,
    color: 'bg-green-500',
  },
  {
    title: 'SEO Tools',
    description: 'Optimize content for search engines',
    href: '/admin/seo',
    icon: Search,
    color: 'bg-red-500',
  },
  {
    title: 'Media Library',
    description: 'Manage images, videos, and documents',
    href: '/admin/media',
    icon: Image,
    color: 'bg-indigo-500',
  },
];

export default function CMSPage() {
  const t = useTranslations('Admin');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('cms.title')}</h1>
        <p className="text-gray-600">
          {t('cms.description')}
        </p>
      </div>

      {/* Brand Management Section */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">{t('cms.brandManagement')}</h2>
        </div>
        <BrandManager />
      </div>

      {/* Content Types Section */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <FileType className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">{t('cms.contentTypes.title', 'Content Types')}</h2>
        </div>
        <ContentTypesManager />
      </div>

      {/* Customer Personas Section */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">{t('cms.aiPersonas.title', 'Customer Personas')}</h2>
        </div>
        <AIPersonaManager />
      </div>

      {/* CMS Modules Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">{t('cms.contentModules')}</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cmsModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.href} href={`/${locale}${module.href}`}>
                <Card className="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${module.color} text-white`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{module.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {t('cms.stats.totalPosts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {t('cms.stats.activePersonas')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {t('cms.stats.scheduledContent')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {t('cms.stats.mediaFiles')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}