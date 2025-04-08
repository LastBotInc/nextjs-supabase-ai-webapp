export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      comments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          content: string
          post_id: string
          author_id: string
          parent_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          content: string
          post_id: string
          author_id: string
          parent_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          content?: string
          post_id?: string
          author_id?: string
          parent_id?: string | null
        }
      }
      contacts: {
        Row: {
          id: string
          created_at: string
          name: string
          company: string | null
          email: string
          description: string
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          company?: string | null
          email: string
          description: string
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          company?: string | null
          email?: string
          description?: string
          status?: string
        }
      }
      posts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          published: boolean
          author_id: string
          locale: string
          featured_image: string | null
          meta_description: string | null
          tags: string[] | null
          embedding: number[] | null
          subject: 'news' | 'research' | 'generative-ai' | 'case-stories'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          slug: string
          content: string
          excerpt?: string | null
          published?: boolean
          author_id: string
          locale: string
          featured_image?: string | null
          meta_description?: string | null
          tags?: string[] | null
          embedding?: number[] | null
          subject?: 'news' | 'research' | 'generative-ai' | 'case-stories'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          published?: boolean
          author_id?: string
          locale?: string
          featured_image?: string | null
          meta_description?: string | null
          tags?: string[] | null
          embedding?: number[] | null
          subject?: 'news' | 'research' | 'generative-ai' | 'case-stories'
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          username: string
          full_name: string
          avatar_url: string | null
          website: string | null
          bio: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          username: string
          full_name: string
          avatar_url?: string | null
          website?: string | null
          bio?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          username?: string
          full_name?: string
          avatar_url?: string | null
          website?: string | null
          bio?: string | null
        }
      }
      landing_pages: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          meta_title: string | null
          meta_description: string | null
          og_image: string | null
          featured_image: string | null
          tags: string[] | null
          keywords: string[] | null
          canonical_url: string | null
          published: boolean
          locale: string
          created_at: string
          updated_at: string
          published_at: string | null
          created_by: string | null
          updated_by: string | null
          template: string | null
          custom_css: string | null
          custom_js: string | null
          custom_head: string | null
          cta_headline: string | null
          cta_description: string | null
          cta_button_text: string | null
          cta_button_link: string | null
          cta_secondary_text: string | null
          enable_analytics: boolean
          ga_measurement_id: string | null
          gtm_container_id: string | null
          fb_pixel_id: string | null
          linkedin_pixel_id: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          excerpt?: string | null
          meta_title?: string | null
          meta_description?: string | null
          og_image?: string | null
          featured_image?: string | null
          tags?: string[] | null
          keywords?: string[] | null
          canonical_url?: string | null
          published?: boolean
          locale: string
          created_at?: string
          updated_at?: string
          published_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          template?: string | null
          custom_css?: string | null
          custom_js?: string | null
          custom_head?: string | null
          cta_headline?: string | null
          cta_description?: string | null
          cta_button_text?: string | null
          cta_button_link?: string | null
          cta_secondary_text?: string | null
          enable_analytics?: boolean
          ga_measurement_id?: string | null
          gtm_container_id?: string | null
          fb_pixel_id?: string | null
          linkedin_pixel_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          meta_title?: string | null
          meta_description?: string | null
          og_image?: string | null
          featured_image?: string | null
          tags?: string[] | null
          keywords?: string[] | null
          canonical_url?: string | null
          published?: boolean
          locale?: string
          created_at?: string
          updated_at?: string
          published_at?: string | null
          created_by?: string | null
          updated_by?: string | null
          template?: string | null
          custom_css?: string | null
          custom_js?: string | null
          custom_head?: string | null
          cta_headline?: string | null
          cta_description?: string | null
          cta_button_text?: string | null
          cta_button_link?: string | null
          cta_secondary_text?: string | null
          enable_analytics?: boolean
          ga_measurement_id?: string | null
          gtm_container_id?: string | null
          fb_pixel_id?: string | null
          linkedin_pixel_id?: string | null
        }
      }
    }
    Views: {
      comment_details: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          content: string
          post_id: string
          author_id: string
          parent_id: string | null
          author_username: string
          author_avatar_url: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
