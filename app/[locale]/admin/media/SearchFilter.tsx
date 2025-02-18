'use client';

import { useTranslations } from 'next-intl';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { MediaFilter } from '@/types/media';

interface SearchFilterProps {
  filter: MediaFilter;
  onChange: (filter: MediaFilter) => void;
}

type SortOption = {
  value: `${MediaFilter['sortBy']}-${MediaFilter['sortOrder']}`;
  label: string;
};

export function SearchFilter({ filter, onChange }: SearchFilterProps) {
  const t = useTranslations('Media');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filter, search: e.target.value });
  };

  const handleTypeChange = (type: string) => {
    const types = filter.type || [];
    const newTypes = types.includes(type)
      ? types.filter(t => t !== type)
      : [...types, type];
    onChange({ ...filter, type: newTypes });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split('-') as [MediaFilter['sortBy'], MediaFilter['sortOrder']];
    onChange({ ...filter, sortBy, sortOrder });
  };

  const sortOptions: SortOption[] = [
    { value: 'createdAt-desc', label: t('sortNewest') },
    { value: 'createdAt-asc', label: t('sortOldest') },
    { value: 'title-asc', label: t('sortNameAZ') },
    { value: 'title-desc', label: t('sortNameZA') },
    { value: 'fileSize-desc', label: t('sortSizeLarge') },
    { value: 'fileSize-asc', label: t('sortSizeSmall') }
  ];

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={filter.search || ''}
          onChange={handleSearchChange}
          placeholder={t('searchPlaceholder')}
          className="pl-10 pr-4 py-2 w-full sm:w-64 bg-background border rounded-md"
        />
      </div>

      <div className="flex space-x-2">
        {['image/jpeg', 'image/png', 'image/gif', 'image/webp'].map(type => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className={`
              px-3 py-1 text-sm rounded-full
              ${filter.type?.includes(type)
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }
            `}
          >
            {type.split('/')[1].toUpperCase()}
          </button>
        ))}
      </div>

      <select
        value={`${filter.sortBy}-${filter.sortOrder}`}
        onChange={handleSortChange}
        className="px-3 py-2 bg-background border rounded-md"
      >
        {sortOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
} 