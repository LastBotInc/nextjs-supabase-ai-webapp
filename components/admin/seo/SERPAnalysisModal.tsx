'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { SERPResult } from '@/types/seo';

interface SERPAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: SERPResult | null;
  keyword: string;
  loading: boolean;
}

export default function SERPAnalysisModal({ isOpen, onClose, results, keyword, loading }: SERPAnalysisModalProps) {
  const t = useTranslations('Admin.SEO.keywords');

  if (!isOpen) return null;

  const organicResults = results?.items?.filter(item => item.type === 'organic') || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            {t('serp.title')} for "{keyword}"
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : organicResults.length > 0 ? (
            <ul className="space-y-4">
              {organicResults.map((item, index) => (
                <li key={item.rank_group} className="p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-start space-x-4">
                    <span className="text-lg font-bold text-primary-500">{item.rank_absolute}.</span>
                    <div className="flex-1">
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 dark:text-blue-400 hover:underline text-lg"
                      >
                        {item.title}
                      </a>
                      <p className="text-sm text-green-700 dark:text-green-500 truncate">{item.url}</p>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">{item.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">{t('serp.noResults')}</p>
          )}
        </div>
      </div>
    </div>
  );
} 