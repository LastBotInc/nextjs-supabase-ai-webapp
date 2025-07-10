export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          browser: string | null
          city: string | null
          connection_type: string | null
          country: string | null
          created_at: string
          currency: string | null
          custom_dimensions: Json | null
          custom_metrics: Json | null
          device_type: string | null
          event_action: string | null
          event_category: string | null
          event_label: string | null
          event_type: string
          id: string
          ip_address: string | null
          is_bounce: boolean | null
          items: Json | null
          locale: string
          metadata: Json | null
          os: string | null
          page_load_time: number | null
          page_title: string | null
          page_url: string
          referrer: string | null
          region: string | null
          revenue: number | null
          screen_resolution: string | null
          scroll_depth: number | null
          session_id: string | null
          time_on_page: number | null
          timezone: string | null
          transaction_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          connection_type?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          custom_dimensions?: Json | null
          custom_metrics?: Json | null
          device_type?: string | null
          event_action?: string | null
          event_category?: string | null
          event_label?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          is_bounce?: boolean | null
          items?: Json | null
          locale?: string
          metadata?: Json | null
          os?: string | null
          page_load_time?: number | null
          page_title?: string | null
          page_url: string
          referrer?: string | null
          region?: string | null
          revenue?: number | null
          screen_resolution?: string | null
          scroll_depth?: number | null
          session_id?: string | null
          time_on_page?: number | null
          timezone?: string | null
          transaction_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          connection_type?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          custom_dimensions?: Json | null
          custom_metrics?: Json | null
          device_type?: string | null
          event_action?: string | null
          event_category?: string | null
          event_label?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          is_bounce?: boolean | null
          items?: Json | null
          locale?: string
          metadata?: Json | null
          os?: string | null
          page_load_time?: number | null
          page_title?: string | null
          page_url?: string
          referrer?: string | null
          region?: string | null
          revenue?: number | null
          screen_resolution?: string | null
          scroll_depth?: number | null
          session_id?: string | null
          time_on_page?: number | null
          timezone?: string | null
          transaction_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "analytics_active_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "analytics_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_sessions: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          engagement_score: number | null
          first_page: string
          id: string
          is_engaged: boolean | null
          last_seen_at: string
          os: string | null
          page_views: number | null
          referrer: string | null
          region: string | null
          screen_resolution: string | null
          session_duration: number | null
          timezone: string | null
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          engagement_score?: number | null
          first_page: string
          id: string
          is_engaged?: boolean | null
          last_seen_at?: string
          os?: string | null
          page_views?: number | null
          referrer?: string | null
          region?: string | null
          screen_resolution?: string | null
          session_duration?: number | null
          timezone?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          engagement_score?: number | null
          first_page?: string
          id?: string
          is_engaged?: boolean | null
          last_seen_at?: string
          os?: string | null
          page_views?: number | null
          referrer?: string | null
          region?: string | null
          screen_resolution?: string | null
          session_duration?: number | null
          timezone?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      appointment_types: {
        Row: {
          created_at: string | null
          description: string | null
          duration: number
          id: string
          is_active: boolean
          is_free: boolean
          name: string
          price: number | null
          slug: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration: number
          id?: string
          is_active?: boolean
          is_free?: boolean
          name: string
          price?: number | null
          slug: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          is_active?: boolean
          is_free?: boolean
          name?: string
          price?: number | null
          slug?: string
          user_id?: string | null
        }
        Relationships: []
      }
      backlink_analysis: {
        Row: {
          anchor_text: string | null
          created_at: string | null
          dofollow: boolean | null
          domain_rank: number | null
          first_seen: string | null
          id: string
          last_seen: string | null
          link_type: string | null
          page_rank: number | null
          project_id: string | null
          referring_domain: string | null
          referring_url: string | null
          target_url: string
        }
        Insert: {
          anchor_text?: string | null
          created_at?: string | null
          dofollow?: boolean | null
          domain_rank?: number | null
          first_seen?: string | null
          id?: string
          last_seen?: string | null
          link_type?: string | null
          page_rank?: number | null
          project_id?: string | null
          referring_domain?: string | null
          referring_url?: string | null
          target_url: string
        }
        Update: {
          anchor_text?: string | null
          created_at?: string | null
          dofollow?: boolean | null
          domain_rank?: number | null
          first_seen?: string | null
          id?: string
          last_seen?: string | null
          link_type?: string | null
          page_rank?: number | null
          project_id?: string | null
          referring_domain?: string | null
          referring_url?: string | null
          target_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "backlink_analysis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_settings: {
        Row: {
          available_hours: Json
          buffer_after: number
          buffer_before: number
          created_at: string | null
          default_duration: number
          id: string
          timezone: string
          unavailable_dates: string[] | null
          user_id: string | null
        }
        Insert: {
          available_hours?: Json
          buffer_after?: number
          buffer_before?: number
          created_at?: string | null
          default_duration: number
          id?: string
          timezone: string
          unavailable_dates?: string[] | null
          user_id?: string | null
        }
        Update: {
          available_hours?: Json
          buffer_after?: number
          buffer_before?: number
          created_at?: string | null
          default_duration?: number
          id?: string
          timezone?: string
          unavailable_dates?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      booking_slot_groups: {
        Row: {
          booking_id: string | null
          created_at: string | null
          duration: number
          end_time: string
          id: string
          slot_ids: string[]
          start_time: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          duration: number
          end_time: string
          id?: string
          slot_ids: string[]
          start_time: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          duration?: number
          end_time?: string
          id?: string
          slot_ids?: string[]
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_slot_groups_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_slots: {
        Row: {
          appointment_type_id: string | null
          booking_id: string | null
          created_at: string | null
          duration: number
          end_time: string
          id: string
          start_time: string
          status: string
          user_id: string | null
        }
        Insert: {
          appointment_type_id?: string | null
          booking_id?: string | null
          created_at?: string | null
          duration: number
          end_time: string
          id?: string
          start_time: string
          status: string
          user_id?: string | null
        }
        Update: {
          appointment_type_id?: string | null
          booking_id?: string | null
          created_at?: string | null
          duration?: number
          end_time?: string
          id?: string
          start_time?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_slots_appointment_type_id_fkey"
            columns: ["appointment_type_id"]
            isOneToOne: false
            referencedRelation: "appointment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_slots_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          appointment_type_id: string | null
          calendar_event_id: string | null
          created_at: string | null
          customer_company: string | null
          customer_email: string
          customer_name: string
          description: string | null
          end_time: string
          id: string
          meeting_link: string | null
          start_time: string
          status: string
          user_id: string | null
        }
        Insert: {
          appointment_type_id?: string | null
          calendar_event_id?: string | null
          created_at?: string | null
          customer_company?: string | null
          customer_email: string
          customer_name: string
          description?: string | null
          end_time: string
          id?: string
          meeting_link?: string | null
          start_time: string
          status: string
          user_id?: string | null
        }
        Update: {
          appointment_type_id?: string | null
          calendar_event_id?: string | null
          created_at?: string | null
          customer_company?: string | null
          customer_email?: string
          customer_name?: string
          description?: string | null
          end_time?: string
          id?: string
          meeting_link?: string | null
          start_time?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_appointment_type_id_fkey"
            columns: ["appointment_type_id"]
            isOneToOne: false
            referencedRelation: "appointment_types"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comment_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          company: string | null
          created_at: string
          description: string
          email: string
          id: string
          name: string
          status: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          description: string
          email: string
          id?: string
          name: string
          status?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          description?: string
          email?: string
          id?: string
          name?: string
          status?: string
        }
        Relationships: []
      }
      content_analysis: {
        Row: {
          analyzed_at: string | null
          content_type: string | null
          created_at: string | null
          id: string
          mentions_count: number | null
          project_id: string | null
          query: string | null
          sentiment_label: string | null
          sentiment_score: number | null
          top_mentions: Json | null
          trends_data: Json | null
        }
        Insert: {
          analyzed_at?: string | null
          content_type?: string | null
          created_at?: string | null
          id?: string
          mentions_count?: number | null
          project_id?: string | null
          query?: string | null
          sentiment_label?: string | null
          sentiment_score?: number | null
          top_mentions?: Json | null
          trends_data?: Json | null
        }
        Update: {
          analyzed_at?: string | null
          content_type?: string | null
          created_at?: string | null
          id?: string
          mentions_count?: number | null
          project_id?: string | null
          query?: string | null
          sentiment_label?: string | null
          sentiment_score?: number | null
          top_mentions?: Json | null
          trends_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "content_analysis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      dataforseo_tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          project_id: string | null
          request_data: Json | null
          response_data: Json | null
          status: string | null
          task_id: string
          task_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          project_id?: string | null
          request_data?: Json | null
          response_data?: Json | null
          status?: string | null
          task_id: string
          task_type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          project_id?: string | null
          request_data?: Json | null
          response_data?: Json | null
          status?: string | null
          task_id?: string
          task_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "dataforseo_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_research: {
        Row: {
          competition: number | null
          cpc: number | null
          created_at: string | null
          difficulty: number | null
          id: string
          keyword: string
          project_id: string | null
          related_keywords: Json | null
          search_intent: string | null
          search_volume: number | null
          trends_data: Json | null
        }
        Insert: {
          competition?: number | null
          cpc?: number | null
          created_at?: string | null
          difficulty?: number | null
          id?: string
          keyword: string
          project_id?: string | null
          related_keywords?: Json | null
          search_intent?: string | null
          search_volume?: number | null
          trends_data?: Json | null
        }
        Update: {
          competition?: number | null
          cpc?: number | null
          created_at?: string | null
          difficulty?: number | null
          id?: string
          keyword?: string
          project_id?: string | null
          related_keywords?: Json | null
          search_intent?: string | null
          search_volume?: number | null
          trends_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "keyword_research_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_pages: {
        Row: {
          analytics_data: Json | null
          content: string
          created_at: string
          created_by: string | null
          cta_button_link: string | null
          cta_button_text: string | null
          cta_description: string | null
          cta_headline: string | null
          cta_secondary_text: string | null
          custom_css: string | null
          custom_head: string | null
          custom_js: string | null
          custom_scripts: string[] | null
          excerpt: string | null
          featured_image: string | null
          id: string
          locale: string
          meta_description: string | null
          published: boolean | null
          published_at: string | null
          seo_data: Json | null
          slug: string
          tags: string[] | null
          template: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          analytics_data?: Json | null
          content: string
          created_at?: string
          created_by?: string | null
          cta_button_link?: string | null
          cta_button_text?: string | null
          cta_description?: string | null
          cta_headline?: string | null
          cta_secondary_text?: string | null
          custom_css?: string | null
          custom_head?: string | null
          custom_js?: string | null
          custom_scripts?: string[] | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          locale?: string
          meta_description?: string | null
          published?: boolean | null
          published_at?: string | null
          seo_data?: Json | null
          slug: string
          tags?: string[] | null
          template?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          analytics_data?: Json | null
          content?: string
          created_at?: string
          created_by?: string | null
          cta_button_link?: string | null
          cta_button_text?: string | null
          cta_description?: string | null
          cta_headline?: string | null
          cta_secondary_text?: string | null
          custom_css?: string | null
          custom_head?: string | null
          custom_js?: string | null
          custom_scripts?: string[] | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          locale?: string
          meta_description?: string | null
          published?: boolean | null
          published_at?: string | null
          seo_data?: Json | null
          slug?: string
          tags?: string[] | null
          template?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      languages: {
        Row: {
          code: string
          created_at: string
          enabled: boolean
          id: string
          last_edited_by: string | null
          name: string
          native_name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          enabled?: boolean
          id?: string
          last_edited_by?: string | null
          name: string
          native_name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          enabled?: boolean
          id?: string
          last_edited_by?: string | null
          name?: string
          native_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: string | null
          created_at: string | null
          description: string | null
          file_size: number
          filename: string
          generation_prompt: string | null
          generation_style: string | null
          height: number | null
          id: string
          is_generated: boolean | null
          metadata: Json | null
          mime_type: string
          optimized_url: string | null
          original_url: string
          prompt: string | null
          source: string | null
          storage_path: string | null
          style: string | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          description?: string | null
          file_size: number
          filename: string
          generation_prompt?: string | null
          generation_style?: string | null
          height?: number | null
          id?: string
          is_generated?: boolean | null
          metadata?: Json | null
          mime_type: string
          optimized_url?: string | null
          original_url: string
          prompt?: string | null
          source?: string | null
          storage_path?: string | null
          style?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          description?: string | null
          file_size?: number
          filename?: string
          generation_prompt?: string | null
          generation_style?: string | null
          height?: number | null
          id?: string
          is_generated?: boolean | null
          metadata?: Json | null
          mime_type?: string
          optimized_url?: string | null
          original_url?: string
          prompt?: string | null
          source?: string | null
          storage_path?: string | null
          style?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          width?: number | null
        }
        Relationships: []
      }
      media_usage: {
        Row: {
          context: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          media_id: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          media_id?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          media_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_usage_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      media_variants: {
        Row: {
          created_at: string | null
          height: number | null
          id: string
          metadata: Json | null
          parent_id: string | null
          url: string
          variant_type: string
          width: number | null
        }
        Insert: {
          created_at?: string | null
          height?: number | null
          id?: string
          metadata?: Json | null
          parent_id?: string | null
          url: string
          variant_type: string
          width?: number | null
        }
        Update: {
          created_at?: string | null
          height?: number | null
          id?: string
          metadata?: Json | null
          parent_id?: string | null
          url?: string
          variant_type?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_variants_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          embedding: string | null
          excerpt: string | null
          featured: boolean | null
          featured_image: string | null
          id: string
          last_edited_by: string | null
          locale: string
          meta_description: string | null
          published: boolean
          slug: string
          subject: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          embedding?: string | null
          excerpt?: string | null
          featured?: boolean | null
          featured_image?: string | null
          id?: string
          last_edited_by?: string | null
          locale: string
          meta_description?: string | null
          published?: boolean
          slug: string
          subject?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          embedding?: string | null
          excerpt?: string | null
          featured?: boolean | null
          featured_image?: string | null
          id?: string
          last_edited_by?: string | null
          locale?: string
          meta_description?: string | null
          published?: boolean
          slug?: string
          subject?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_admin: boolean | null
          marketing_consent: boolean | null
          newsletter_subscription: boolean | null
          updated_at: string
          username: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_admin?: boolean | null
          marketing_consent?: boolean | null
          newsletter_subscription?: boolean | null
          updated_at?: string
          username: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_admin?: boolean | null
          marketing_consent?: boolean | null
          newsletter_subscription?: boolean | null
          updated_at?: string
          username?: string
          website?: string | null
        }
        Relationships: []
      }
      seo_projects: {
        Row: {
          created_at: string | null
          description: string | null
          domain: string
          id: string
          name: string
          settings: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          domain: string
          id?: string
          name: string
          settings?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          domain?: string
          id?: string
          name?: string
          settings?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      seo_reports: {
        Row: {
          created_at: string | null
          generated_at: string | null
          id: string
          project_id: string | null
          report_data: Json | null
          report_name: string
          report_type: string
        }
        Insert: {
          created_at?: string | null
          generated_at?: string | null
          id?: string
          project_id?: string | null
          report_data?: Json | null
          report_name: string
          report_type: string
        }
        Update: {
          created_at?: string | null
          generated_at?: string | null
          id?: string
          project_id?: string | null
          report_data?: Json | null
          report_name?: string
          report_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      serp_tracking: {
        Row: {
          created_at: string | null
          current_position: number | null
          description: string | null
          id: string
          keyword: string
          language_code: string | null
          location_code: number | null
          previous_position: number | null
          project_id: string | null
          search_engine: string | null
          serp_features: Json | null
          title: string | null
          tracked_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          current_position?: number | null
          description?: string | null
          id?: string
          keyword: string
          language_code?: string | null
          location_code?: number | null
          previous_position?: number | null
          project_id?: string | null
          search_engine?: string | null
          serp_features?: Json | null
          title?: string | null
          tracked_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          current_position?: number | null
          description?: string | null
          id?: string
          keyword?: string
          language_code?: string | null
          location_code?: number | null
          previous_position?: number | null
          project_id?: string | null
          search_engine?: string | null
          serp_features?: Json | null
          title?: string | null
          tracked_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "serp_tracking_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      technical_audits: {
        Row: {
          accessibility_score: number | null
          audit_date: string | null
          created_at: string | null
          h1_tags: Json | null
          id: string
          issues: Json | null
          meta_description: string | null
          page_title: string | null
          performance_score: number | null
          project_id: string | null
          seo_score: number | null
          status_code: number | null
          url: string
        }
        Insert: {
          accessibility_score?: number | null
          audit_date?: string | null
          created_at?: string | null
          h1_tags?: Json | null
          id?: string
          issues?: Json | null
          meta_description?: string | null
          page_title?: string | null
          performance_score?: number | null
          project_id?: string | null
          seo_score?: number | null
          status_code?: number | null
          url: string
        }
        Update: {
          accessibility_score?: number | null
          audit_date?: string | null
          created_at?: string | null
          h1_tags?: Json | null
          id?: string
          issues?: Json | null
          meta_description?: string | null
          page_title?: string | null
          performance_score?: number | null
          project_id?: string | null
          seo_score?: number | null
          status_code?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "technical_audits_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "seo_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          created_at: string
          id: string
          is_html: boolean
          key: string
          last_edited_by: string | null
          locale: string
          namespace: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_html?: boolean
          key: string
          last_edited_by?: string | null
          locale: string
          namespace: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          is_html?: boolean
          key?: string
          last_edited_by?: string | null
          locale?: string
          namespace?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      analytics_active_sessions: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          current_events: number | null
          device_type: string | null
          engagement_score: number | null
          first_page: string | null
          id: string | null
          is_engaged: boolean | null
          last_seen_at: string | null
          os: string | null
          page_views: number | null
          session_duration: number | null
          user_id: string | null
        }
        Relationships: []
      }
      analytics_hourly_stats: {
        Row: {
          avg_scroll_depth: number | null
          avg_time_on_page: number | null
          browser: string | null
          conversion_count: number | null
          country: string | null
          device_type: string | null
          event_count: number | null
          event_type: string | null
          hour: string | null
          page_url: string | null
          total_revenue: number | null
          unique_sessions: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      analytics_realtime: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string | null
          currency: string | null
          custom_dimensions: Json | null
          device_type: string | null
          event_type: string | null
          os: string | null
          page_title: string | null
          page_url: string | null
          referrer: string | null
          revenue: number | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          custom_dimensions?: Json | null
          device_type?: string | null
          event_type?: string | null
          os?: string | null
          page_title?: string | null
          page_url?: string | null
          referrer?: string | null
          revenue?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          custom_dimensions?: Json | null
          device_type?: string | null
          event_type?: string | null
          os?: string | null
          page_title?: string | null
          page_url?: string | null
          referrer?: string | null
          revenue?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "analytics_active_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "analytics_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_details: {
        Row: {
          author_avatar_url: string | null
          author_id: string | null
          author_username: string | null
          content: string | null
          created_at: string | null
          id: string | null
          post_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      calculate_engagement_score: {
        Args: {
          p_session_duration: number
          p_page_views: number
          p_scroll_depth: number
          p_time_on_page: number
          p_has_conversion?: boolean
        }
        Returns: number
      }
      delete_language_translations: {
        Args: { lang_code: string }
        Returns: undefined
      }
      get_enabled_languages: {
        Args: Record<PropertyKey, never>
        Returns: {
          code: string
          name: string
          native_name: string
          enabled: boolean
        }[]
      }
      get_sitemap_urls: {
        Args: Record<PropertyKey, never>
        Returns: {
          url: string
          last_modified: string
          change_freq: string
          priority: number
        }[]
      }
      get_translations: {
        Args: { requested_locale: string }
        Returns: Json
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_posts: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
          min_content_length?: number
        }
        Returns: {
          id: string
          title: string
          slug: string
          content: string
          similarity: number
        }[]
      }
      refresh_analytics_hourly_stats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

