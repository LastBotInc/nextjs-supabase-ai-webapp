'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, ChevronDown } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { SEOProject } from '@/types/seo';

interface ProjectSelectorProps {
  currentProjectId?: string;
  onProjectChange?: (projectId: string, project: SEOProject) => void;
}

export default function ProjectSelector({ currentProjectId, onProjectChange }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<SEOProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(currentProjectId || '');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const t = useTranslations('Admin.SEO');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    // Update selected project when prop changes
    if (currentProjectId && currentProjectId !== selectedProjectId) {
      setSelectedProjectId(currentProjectId);
    }
  }, [currentProjectId]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('seo_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjects(data || []);
      
      // If no project is selected and we have projects, select the first one
      if (!selectedProjectId && data && data.length > 0) {
        const firstProject = data[0];
        setSelectedProjectId(firstProject.id);
        // Store in localStorage for persistence
        localStorage.setItem('selectedSeoProjectId', firstProject.id);
        
        // Call callback if provided
        if (onProjectChange) {
          onProjectChange(firstProject.id, firstProject);
        }
      }
    } catch (error) {
      console.error('Error fetching SEO projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load selected project from localStorage on mount
    const savedProjectId = localStorage.getItem('selectedSeoProjectId');
    if (savedProjectId && projects.find(p => p.id === savedProjectId)) {
      setSelectedProjectId(savedProjectId);
    }
  }, [projects]);

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    localStorage.setItem('selectedSeoProjectId', projectId);
    
    const selectedProject = projects.find(p => p.id === projectId);
    if (selectedProject && onProjectChange) {
      onProjectChange(projectId, selectedProject);
    }

    // If we're on a project-specific page, navigate to the new project
    if (pathname.includes('/admin/seo/projects/') && pathname.includes('/edit')) {
      const locale = pathname.split('/')[1];
      router.push(`/${locale}/admin/seo/projects/${projectId}/edit`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse">
        <Globe className="h-4 w-4 text-gray-400" />
        <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500">
        <Globe className="h-4 w-4" />
        <span>No SEO projects found</span>
      </div>
    );
  }

  const currentProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      <Select value={selectedProjectId} onValueChange={handleProjectChange}>
        <SelectTrigger className="w-[250px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
          <SelectValue>
            {currentProject ? (
              <div className="flex items-center gap-2">
                <span className="font-medium">{currentProject.name}</span>
                <span className="text-xs text-gray-500">({currentProject.domain})</span>
              </div>
            ) : (
              'Select a project'
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              <div className="flex flex-col">
                <span className="font-medium">{project.name}</span>
                <span className="text-xs text-gray-500">{project.domain}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}