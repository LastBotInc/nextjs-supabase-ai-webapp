'use client';

import { useState } from 'react';
import { Link } from '@/app/i18n/navigation';
import { 
  ChartBarIcon, 
  MagnifyingGlassIcon, 
  LinkIcon, 
  CogIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { SEODashboardData, SEOProject } from '@/types/seo';
import WebsiteAnalysis from './WebsiteAnalysis';

interface SEODashboardProps {
  initialData: SEODashboardData;
}

export default function SEODashboard({ initialData }: SEODashboardProps) {
  const [data, setData] = useState(initialData);

  const metricCards = [
    {
      title: 'Total Projects',
      value: data.keyMetrics.totalProjects,
      icon: ChartBarIcon,
      color: 'blue',
      change: null,
    },
    {
      title: 'Tracked Keywords',
      value: data.keyMetrics.totalKeywords,
      icon: MagnifyingGlassIcon,
      color: 'green',
      change: null,
    },
    {
      title: 'Average Position',
      value: data.keyMetrics.averagePosition > 0 ? data.keyMetrics.averagePosition.toFixed(1) : 'N/A',
      icon: ArrowTrendingUpIcon,
      color: data.keyMetrics.averagePosition <= 10 ? 'green' : data.keyMetrics.averagePosition <= 30 ? 'yellow' : 'red',
      change: null,
    },
    {
      title: 'Total Backlinks',
      value: data.keyMetrics.totalBacklinks,
      icon: LinkIcon,
      color: 'purple',
      change: null,
    },
    {
      title: 'Technical Issues',
      value: data.keyMetrics.technicalIssues,
      icon: ExclamationTriangleIcon,
      color: data.keyMetrics.technicalIssues > 0 ? 'red' : 'green',
      change: null,
    },
    {
      title: 'Content Mentions',
      value: data.keyMetrics.contentMentions,
      icon: DocumentTextIcon,
      color: 'indigo',
      change: null,
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
      yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
      red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
      purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
      indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'high': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {metricCards.map((metric, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {metric.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${getColorClasses(metric.color)}`}>
                <metric.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/seo/projects/new"
            className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <PlusIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">New Project</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">Create SEO project</p>
            </div>
          </Link>
          
          {data.projects.length > 0 ? (
            <Link
              href="/admin/seo/keywords"
              className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <MagnifyingGlassIcon className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
              <div>
                <h3 className="font-medium text-green-900 dark:text-green-100">Keyword Research</h3>
                <p className="text-sm text-green-600 dark:text-green-400">Find new keywords</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg opacity-60 cursor-not-allowed">
              <MagnifyingGlassIcon className="h-8 w-8 text-gray-400 mr-3" />
              <div>
                <h3 className="font-medium text-gray-500 dark:text-gray-400">Keyword Research</h3>
                <p className="text-sm text-gray-400">Requires a project</p>
              </div>
            </div>
          )}
          
          {data.projects.length > 0 ? (
            <Link
              href="/admin/seo/backlinks"
              className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <LinkIcon className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
              <div>
                <h3 className="font-medium text-purple-900 dark:text-purple-100">Backlink Analysis</h3>
                <p className="text-sm text-purple-600 dark:text-purple-400">Analyze backlinks</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg opacity-60 cursor-not-allowed">
              <LinkIcon className="h-8 w-8 text-gray-400 mr-3" />
              <div>
                <h3 className="font-medium text-gray-500 dark:text-gray-400">Backlink Analysis</h3>
                <p className="text-sm text-gray-400">Requires a project</p>
              </div>
            </div>
          )}
          
          {data.projects.length > 0 ? (
            <Link
              href="/admin/seo/technical"
              className="flex items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <CogIcon className="h-8 w-8 text-orange-600 dark:text-orange-400 mr-3" />
              <div>
                <h3 className="font-medium text-orange-900 dark:text-orange-100">Technical Audit</h3>
                <p className="text-sm text-orange-600 dark:text-orange-400">Check site health</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg opacity-60 cursor-not-allowed">
              <CogIcon className="h-8 w-8 text-gray-400 mr-3" />
              <div>
                <h3 className="font-medium text-gray-500 dark:text-gray-400">Technical Audit</h3>
                <p className="text-sm text-gray-400">Requires a project</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Projects Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Projects
            </h2>
            {data.projects.length > 0 && (
              <Link
                href="/admin/seo/projects"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                View all
              </Link>
            )}
          </div>
          
          {data.projects.length === 0 ? (
            <div className="text-center py-8">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No projects yet</p>
              <Link
                href="/admin/seo/projects/new"
                className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create your first project
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.projects.slice(0, 5).map((project: SEOProject) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {project.domain}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(project.created_at)}
                    </p>
                    <Link
                      href={`/admin/seo/projects/${project.id}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          
          {data.recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <ArrowTrendingUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.recentActivity.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className={`p-1 rounded-full ${getSeverityColor(activity.severity || 'low')}`}>
                    {activity.type === 'rank_change' && <ArrowTrendingUpIcon className="h-4 w-4" />}
                    {activity.type === 'new_backlink' && <LinkIcon className="h-4 w-4" />}
                    {activity.type === 'technical_issue' && <ExclamationTriangleIcon className="h-4 w-4" />}
                    {activity.type === 'content_mention' && <DocumentTextIcon className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {activity.project_name} • {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alerts Section */}
      {data.alerts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Alerts & Notifications
          </h2>
          <div className="space-y-3">
            {data.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.severity === 'critical' 
                    ? 'bg-red-50 border-red-400 dark:bg-red-900/20 dark:border-red-400'
                    : alert.severity === 'high'
                    ? 'bg-orange-50 border-orange-400 dark:bg-orange-900/20 dark:border-orange-400'
                    : alert.severity === 'medium'
                    ? 'bg-yellow-50 border-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-400'
                    : 'bg-blue-50 border-blue-400 dark:bg-blue-900/20 dark:border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {alert.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {alert.message}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Website Analysis Section */}
      <WebsiteAnalysis 
        onAnalysisComplete={(analysisData) => {
          console.log('Website analysis completed:', analysisData);
          // You can add logic here to save the analysis data or update the dashboard
        }}
      />
    </div>
  );
} 