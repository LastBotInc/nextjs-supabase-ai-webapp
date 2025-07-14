'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit2, Save, X, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { Tables } from '@/types/database';

type ContentType = Tables<'content_types'>;
type Brand = Tables<'brands'>;

export default function ContentTypesManager() {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [activeTagField, setActiveTagField] = useState<string | null>(null);
  const [currentRange, setCurrentRange] = useState({ min: 500, max: 2000 });
  const supabase = createClient();
  const t = useTranslations('Admin');

  useEffect(() => {
    fetchContentTypes();
    fetchBrands();
  }, []);

  const fetchContentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('content_types')
        .select('*')
        .order('is_system', { ascending: false })
        .order('name', { ascending: true });

      if (error) throw error;
      setContentTypes(data || []);
    } catch (error) {
      console.error('Error fetching content types:', error);
      toast.error(t('cms.contentTypes.messages.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const createNewContentType = () => {
    const newContentType: Partial<ContentType> = {
      name: '',
      slug: '',
      description: '',
      brand_id: brands[0]?.id || null,
      tone_formal: null,
      tone_friendly: null,
      tone_technical: null,
      tone_innovative: null,
      typical_length_min: 500,
      typical_length_max: 2000,
      structure_template: [],
      writing_guidelines: [],
      example_titles: [],
      keywords: [],
      meta_description_template: '',
      is_active: true,
      is_system: false,
    };
    setSelectedContentType(newContentType as ContentType);
    setCurrentRange({ min: 500, max: 2000 });
    setIsCreating(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const saveContentType = async () => {
    if (!selectedContentType?.name || !selectedContentType?.slug) {
      toast.error(t('cms.contentTypes.messages.requiredFields'));
      return;
    }

    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const contentTypeData = {
        ...selectedContentType,
        created_by: userData.user.id,
      };

      if (isCreating) {
        const { data, error } = await supabase
          .from('content_types')
          .insert([contentTypeData])
          .select()
          .single();

        if (error) throw error;
        setContentTypes([...contentTypes, data]);
        toast.success(t('cms.contentTypes.messages.createSuccess'));
      } else {
        const { data, error } = await supabase
          .from('content_types')
          .update(contentTypeData)
          .eq('id', selectedContentType.id)
          .select()
          .single();

        if (error) throw error;
        setContentTypes(contentTypes.map(ct => ct.id === data.id ? data : ct));
        toast.success(t('cms.contentTypes.messages.updateSuccess'));
      }

      setSelectedContentType(null);
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving content type:', error);
      toast.error(t('cms.contentTypes.messages.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const deleteContentType = async (contentTypeId: string) => {
    if (!confirm(t('cms.contentTypes.messages.confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from('content_types')
        .delete()
        .eq('id', contentTypeId);

      if (error) throw error;
      setContentTypes(contentTypes.filter(ct => ct.id !== contentTypeId));
      toast.success(t('cms.contentTypes.messages.deleteSuccess'));
    } catch (error) {
      console.error('Error deleting content type:', error);
      toast.error(t('cms.contentTypes.messages.deleteFailed'));
    }
  };

  const addTag = (field: string) => {
    if (!newTag.trim()) return;
    
    setSelectedContentType({
      ...selectedContentType!,
      [field]: [...(selectedContentType![field as keyof ContentType] as string[]), newTag.trim()],
    });
    setNewTag('');
  };

  const removeTag = (field: string, index: number) => {
    const fieldArray = selectedContentType![field as keyof ContentType] as string[];
    setSelectedContentType({
      ...selectedContentType!,
      [field]: fieldArray.filter((_, i) => i !== index),
    });
  };

  const getBrandById = (brandId: string | null) => {
    return brands.find(b => b.id === brandId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!selectedContentType ? (
        <>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {t('cms.contentTypesDescription')}
            </p>
            <Button onClick={createNewContentType}>
              <Plus className="h-4 w-4 mr-2" />
              {t('cms.contentTypes.addContentType')}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contentTypes.map((contentType) => (
              <Card
                key={contentType.id}
                className={`cursor-pointer hover:shadow-lg transition-shadow ${
                  contentType.is_system ? 'border-blue-200' : ''
                }`}
                onClick={() => setSelectedContentType(contentType)}
              >
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2">
                    <span className="truncate">{contentType.name}</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {contentType.is_system && (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          {t('cms.contentTypes.system')}
                        </Badge>
                      )}
                      <Badge variant={contentType.is_active ? 'default' : 'secondary'} className="text-xs">
                        {contentType.is_active ? t('cms.contentTypes.active') : t('cms.contentTypes.inactive')}
                      </Badge>
                    </div>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {contentType.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{t('cms.contentTypes.lengthRange')}: {contentType.typical_length_min}-{contentType.typical_length_max} words</p>
                    {contentType.brand_id && (
                      <p>{t('cms.contentTypes.brand')}: {getBrandById(contentType.brand_id)?.name || 'Unknown'}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {isCreating ? t('cms.contentTypes.createNew') : t('cms.contentTypes.editContentType')}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedContentType(null);
                  setIsCreating(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">{t('cms.contentTypes.basicInfo')}</TabsTrigger>
                <TabsTrigger value="tone">{t('cms.contentTypes.toneOverrides')}</TabsTrigger>
                <TabsTrigger value="structure">{t('cms.contentTypes.structure')}</TabsTrigger>
                <TabsTrigger value="guidelines">{t('cms.contentTypes.guidelines')}</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="name">{t('cms.contentTypes.name')} *</Label>
                    <Input
                      id="name"
                      value={selectedContentType.name}
                      onChange={(e) => {
                        setSelectedContentType({ 
                          ...selectedContentType, 
                          name: e.target.value,
                          slug: isCreating ? generateSlug(e.target.value) : selectedContentType.slug
                        });
                      }}
                      placeholder={t('cms.contentTypes.namePlaceholder')}
                      disabled={selectedContentType.is_system}
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">{t('cms.contentTypes.slug')} *</Label>
                    <Input
                      id="slug"
                      value={selectedContentType.slug}
                      onChange={(e) => setSelectedContentType({ ...selectedContentType, slug: e.target.value })}
                      placeholder="news-article"
                      disabled={selectedContentType.is_system || !isCreating}
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">{t('cms.contentTypes.description')}</Label>
                    <Textarea
                      id="description"
                      value={selectedContentType.description}
                      onChange={(e) => setSelectedContentType({ ...selectedContentType, description: e.target.value })}
                      placeholder={t('cms.contentTypes.descriptionPlaceholder')}
                      rows={3}
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="brand">{t('cms.contentTypes.associatedBrand')}</Label>
                    <select
                      id="brand"
                      className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100"
                      value={selectedContentType.brand_id || ''}
                      onChange={(e) => setSelectedContentType({ 
                        ...selectedContentType, 
                        brand_id: e.target.value || null 
                      })}
                    >
                      <option value="">{t('cms.contentTypes.noBrand')}</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>{t('cms.contentTypes.typicalLength')}</Label>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{currentRange.min} words</span>
                        <span>{currentRange.max} words</span>
                      </div>
                      <div className="px-2">
                        <Slider
                          value={[selectedContentType.typical_length_min, selectedContentType.typical_length_max]}
                          onValueChange={([min, max]) => {
                            setCurrentRange({ min, max });
                            setSelectedContentType({
                              ...selectedContentType,
                              typical_length_min: min,
                              typical_length_max: max
                            });
                          }}
                          min={100}
                          max={5000}
                          step={100}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tone" className="space-y-6">
                <p className="text-sm text-gray-600">
                  {t('cms.contentTypes.toneOverridesDescription')}
                </p>
                <div className="space-y-4">
                  {[
                    { key: 'tone_formal', label: t('cms.contentTypes.tone.formal') },
                    { key: 'tone_friendly', label: t('cms.contentTypes.tone.friendly') },
                    { key: 'tone_technical', label: t('cms.contentTypes.tone.technical') },
                    { key: 'tone_innovative', label: t('cms.contentTypes.tone.innovative') },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>{label}</Label>
                        <span className="text-sm font-medium">
                          {selectedContentType[key as keyof ContentType] ?? 'Brand default'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[selectedContentType[key as keyof ContentType] as number || 5]}
                          onValueChange={([value]) => setSelectedContentType({ 
                            ...selectedContentType, 
                            [key]: value 
                          })}
                          max={10}
                          step={1}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedContentType({ 
                            ...selectedContentType, 
                            [key]: null 
                          })}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="structure" className="space-y-4">
                <div>
                  <Label>{t('cms.contentTypes.structureTemplate')}</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    {t('cms.contentTypes.structureTemplateDescription')}
                  </p>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={activeTagField === 'structure_template' ? newTag : ''}
                      onChange={(e) => {
                        setNewTag(e.target.value);
                        setActiveTagField('structure_template');
                      }}
                      placeholder="e.g., introduction, main_points"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag('structure_template');
                        }
                      }}
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveTagField('structure_template');
                        addTag('structure_template');
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(selectedContentType.structure_template || []).map((item, index) => (
                      <Badge key={index} variant="secondary">
                        {item}
                        <button
                          onClick={() => removeTag('structure_template', index)}
                          className="ml-2 text-xs hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>{t('cms.contentTypes.keywords')}</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={activeTagField === 'keywords' ? newTag : ''}
                      onChange={(e) => {
                        setNewTag(e.target.value);
                        setActiveTagField('keywords');
                      }}
                      placeholder={t('cms.contentTypes.keywordsPlaceholder')}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag('keywords');
                        }
                      }}
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveTagField('keywords');
                        addTag('keywords');
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(selectedContentType.keywords || []).map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                        <button
                          onClick={() => removeTag('keywords', index)}
                          className="ml-2 text-xs hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="meta_template">{t('cms.contentTypes.metaDescriptionTemplate')}</Label>
                  <Textarea
                    id="meta_template"
                    value={selectedContentType.meta_description_template || ''}
                    onChange={(e) => setSelectedContentType({ 
                      ...selectedContentType, 
                      meta_description_template: e.target.value 
                    })}
                    placeholder="e.g., {title}: Learn about {topic} with practical examples and expert insights."
                    rows={2}
                    className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                </div>
              </TabsContent>

              <TabsContent value="guidelines" className="space-y-4">
                <div>
                  <Label>{t('cms.contentTypes.writingGuidelines')}</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={activeTagField === 'writing_guidelines' ? newTag : ''}
                      onChange={(e) => {
                        setNewTag(e.target.value);
                        setActiveTagField('writing_guidelines');
                      }}
                      placeholder={t('cms.contentTypes.guidelinesPlaceholder')}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag('writing_guidelines');
                        }
                      }}
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveTagField('writing_guidelines');
                        addTag('writing_guidelines');
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(selectedContentType.writing_guidelines || []).map((guideline, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-sm flex-1">{guideline}</span>
                        <button
                          onClick={() => removeTag('writing_guidelines', index)}
                          className="text-xs hover:text-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>{t('cms.contentTypes.exampleTitles')}</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={activeTagField === 'example_titles' ? newTag : ''}
                      onChange={(e) => {
                        setNewTag(e.target.value);
                        setActiveTagField('example_titles');
                      }}
                      placeholder={t('cms.contentTypes.exampleTitlesPlaceholder')}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag('example_titles');
                        }
                      }}
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveTagField('example_titles');
                        addTag('example_titles');
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(selectedContentType.example_titles || []).map((title, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-sm flex-1">{title}</span>
                        <button
                          onClick={() => removeTag('example_titles', index)}
                          className="text-xs hover:text-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between pt-6">
              {!isCreating && !selectedContentType.is_system && (
                <Button
                  variant="destructive"
                  onClick={() => deleteContentType(selectedContentType.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('cms.contentTypes.actions.delete')}
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedContentType(null);
                    setIsCreating(false);
                  }}
                >
                  {t('cms.contentTypes.actions.cancel')}
                </Button>
                <Button 
                  onClick={saveContentType} 
                  disabled={saving || selectedContentType.is_system}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isCreating ? t('cms.contentTypes.actions.create') : t('cms.contentTypes.actions.save')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}