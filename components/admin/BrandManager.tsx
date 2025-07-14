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
import { Plus, Trash2, Globe, Sparkles, Save, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { brandInfo } from '@/lib/brand-info';

interface Brand {
  id: string;
  name: string;
  website_url: string;
  description: string;
  tone_formal: number;
  tone_friendly: number;
  tone_technical: number;
  tone_innovative: number;
  personality_primary: string[];
  personality_secondary: string[];
  personality_avoid: string[];
  writing_style: string[];
  common_phrases: string[];
  avoid_phrases: string[];
  services: any[];
  solutions: any[];
  is_active: boolean;
}

export default function BrandManager() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [activeTagField, setActiveTagField] = useState<string | null>(null);
  const supabase = createClient();
  const t = useTranslations('Admin');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error(t('cms.brand.messages.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const createNewBrand = () => {
    const newBrand: Partial<Brand> = {
      name: brandInfo.name,
      website_url: brandInfo.websiteUrl,
      description: brandInfo.description,
      tone_formal: brandInfo.tone.formal,
      tone_friendly: brandInfo.tone.friendly,
      tone_technical: brandInfo.tone.technical,
      tone_innovative: brandInfo.tone.innovative,
      personality_primary: brandInfo.personality.primary,
      personality_secondary: brandInfo.personality.secondary,
      personality_avoid: brandInfo.personality.avoid,
      writing_style: brandInfo.writingStyle,
      common_phrases: brandInfo.commonPhrases,
      avoid_phrases: brandInfo.avoidPhrases,
      services: brandInfo.services,
      solutions: brandInfo.solutions,
      is_active: true,
    };
    setSelectedBrand(newBrand as Brand);
    setIsCreating(true);
  };

  const analyzeWebsite = async () => {
    if (!selectedBrand?.website_url) {
      toast.error(t('cms.brand.messages.enterUrl'));
      return;
    }

    setAnalyzing(true);
    try {
      // Get the current session to include auth headers
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/ai/analyze-brand', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ url: selectedBrand.website_url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to analyze website');
      }

      const data = await response.json();
      setSelectedBrand({
        ...selectedBrand,
        ...data,
      });
      toast.success(t('cms.brand.messages.analyzeSuccess'));
    } catch (error: any) {
      console.error('Error analyzing website:', error);
      toast.error(error.message || t('cms.brand.messages.analyzeFailed'));
    } finally {
      setAnalyzing(false);
    }
  };

  const saveBrand = async () => {
    if (!selectedBrand?.name || !selectedBrand?.website_url) {
      toast.error(t('cms.brand.messages.requiredFields'));
      return;
    }

    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const brandData = {
        ...selectedBrand,
        user_id: userData.user.id,
      };

      if (isCreating) {
        const { data, error } = await supabase
          .from('brands')
          .insert([brandData])
          .select()
          .single();

        if (error) throw error;
        setBrands([data, ...brands]);
        toast.success(t('cms.brand.messages.createSuccess'));
      } else {
        const { data, error } = await supabase
          .from('brands')
          .update(brandData)
          .eq('id', selectedBrand.id)
          .select()
          .single();

        if (error) throw error;
        setBrands(brands.map(b => b.id === data.id ? data : b));
        toast.success(t('cms.brand.messages.updateSuccess'));
      }

      setSelectedBrand(null);
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving brand:', error);
      toast.error(t('cms.brand.messages.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const deleteBrand = async (brandId: string) => {
    if (!confirm(t('cms.brand.messages.confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brandId);

      if (error) throw error;
      setBrands(brands.filter(b => b.id !== brandId));
      toast.success(t('cms.brand.messages.deleteSuccess'));
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error(t('cms.brand.messages.deleteFailed'));
    }
  };

  const addTag = (field: string) => {
    if (!newTag.trim()) return;
    
    setSelectedBrand({
      ...selectedBrand!,
      [field]: [...(selectedBrand![field as keyof Brand] as string[]), newTag.trim()],
    });
    setNewTag('');
  };

  const removeTag = (field: string, index: number) => {
    const fieldArray = selectedBrand![field as keyof Brand] as string[];
    setSelectedBrand({
      ...selectedBrand!,
      [field]: fieldArray.filter((_, i) => i !== index),
    });
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
      {!selectedBrand ? (
        <>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {t('cms.brandManagementDescription')}
            </p>
            <Button onClick={createNewBrand}>
              <Plus className="h-4 w-4 mr-2" />
              {t('cms.brand.addBrand')}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => (
              <Card
                key={brand.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedBrand(brand)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{brand.name}</span>
                    <Badge variant={brand.is_active ? 'default' : 'secondary'}>
                      {brand.is_active ? t('cms.brand.active') : t('cms.brand.inactive')}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Globe className="h-3 w-3" />
                    {brand.website_url}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {brand.description || t('cms.brand.noDescription')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {isCreating ? t('cms.brand.createNew') : t('cms.brand.editBrand')}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedBrand(null);
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
                <TabsTrigger value="basic">{t('cms.brand.basicInfo')}</TabsTrigger>
                <TabsTrigger value="tone">{t('cms.brand.brandTone')}</TabsTrigger>
                <TabsTrigger value="personality">{t('cms.brand.personality')}</TabsTrigger>
                <TabsTrigger value="style">{t('cms.brand.writingStyle')}</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="name">{t('cms.brand.brandName')} *</Label>
                    <Input
                      id="name"
                      value={selectedBrand.name}
                      onChange={(e) => setSelectedBrand({ ...selectedBrand, name: e.target.value })}
                      placeholder={t('cms.brand.brandName')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">{t('cms.brand.websiteUrl')} *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="website"
                        type="url"
                        value={selectedBrand.website_url}
                        onChange={(e) => setSelectedBrand({ ...selectedBrand, website_url: e.target.value })}
                        placeholder="https://example.com"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={analyzeWebsite}
                        disabled={analyzing}
                      >
                        {analyzing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        {t('cms.brand.analyze')}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">{t('cms.brand.description')}</Label>
                    <Textarea
                      id="description"
                      value={selectedBrand.description}
                      onChange={(e) => setSelectedBrand({ ...selectedBrand, description: e.target.value })}
                      placeholder={t('cms.brand.description')}
                      rows={4}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tone" className="space-y-6">
                <div className="space-y-4">
                  {[
                    { key: 'tone_formal', label: t('cms.brand.tone.formal'), description: t('cms.brand.tone.formalDesc') },
                    { key: 'tone_friendly', label: t('cms.brand.tone.friendly'), description: t('cms.brand.tone.friendlyDesc') },
                    { key: 'tone_technical', label: t('cms.brand.tone.technical'), description: t('cms.brand.tone.technicalDesc') },
                    { key: 'tone_innovative', label: t('cms.brand.tone.innovative'), description: t('cms.brand.tone.innovativeDesc') },
                  ].map(({ key, label, description }) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between">
                        <Label>{label}</Label>
                        <span className="text-sm font-medium">{selectedBrand[key as keyof Brand]}</span>
                      </div>
                      <Slider
                        value={[selectedBrand[key as keyof Brand] as number]}
                        onValueChange={([value]) => setSelectedBrand({ ...selectedBrand, [key]: value })}
                        max={10}
                        step={1}
                      />
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="personality" className="space-y-4">
                {[
                  { field: 'personality_primary', label: t('cms.brand.traits.primary') },
                  { field: 'personality_secondary', label: t('cms.brand.traits.secondary') },
                  { field: 'personality_avoid', label: t('cms.brand.traits.avoid') },
                ].map(({ field, label }) => (
                  <div key={field}>
                    <Label>{label}</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={activeTagField === field ? newTag : ''}
                        onChange={(e) => {
                          setNewTag(e.target.value);
                          setActiveTagField(field);
                        }}
                        placeholder={`Add ${label.toLowerCase()}`}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag(field);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveTagField(field);
                          addTag(field);
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(selectedBrand[field as keyof Brand] as string[]).map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                          <button
                            onClick={() => removeTag(field, index)}
                            className="ml-2 text-xs hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="style" className="space-y-4">
                {[
                  { field: 'writing_style', label: t('cms.brand.style.guidelines') },
                  { field: 'common_phrases', label: t('cms.brand.style.commonPhrases') },
                  { field: 'avoid_phrases', label: t('cms.brand.style.avoidPhrases') },
                ].map(({ field, label }) => (
                  <div key={field}>
                    <Label>{label}</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={activeTagField === field ? newTag : ''}
                        onChange={(e) => {
                          setNewTag(e.target.value);
                          setActiveTagField(field);
                        }}
                        placeholder={`Add ${label.toLowerCase()}`}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag(field);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveTagField(field);
                          addTag(field);
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(selectedBrand[field as keyof Brand] as string[]).map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                          <button
                            onClick={() => removeTag(field, index)}
                            className="ml-2 text-xs hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>

            <div className="flex justify-between pt-6">
              {!isCreating && (
                <Button
                  variant="destructive"
                  onClick={() => deleteBrand(selectedBrand.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('cms.brand.actions.delete')}
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedBrand(null);
                    setIsCreating(false);
                  }}
                >
                  {t('cms.brand.actions.cancel')}
                </Button>
                <Button onClick={saveBrand} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isCreating ? t('cms.brand.actions.create') : t('cms.brand.actions.save')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}