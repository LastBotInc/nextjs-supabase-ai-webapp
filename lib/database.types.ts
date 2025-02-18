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
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          event_type: string
          id: string
          ip_address: string | null
          locale: string
          metadata: Json | null
          page_url: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          locale?: string
          metadata?: Json | null
          page_url: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          locale?: string
          metadata?: Json | null
          page_url?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
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
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          first_page: string
          id: string
          last_seen_at: string
          referrer: string | null
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          first_page: string
          id: string
          last_seen_at?: string
          referrer?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          first_page?: string
          id?: string
          last_seen_at?: string
          referrer?: string | null
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
          calendar_event_id: string | null
          created_at: string | null
          customer_company: string | null
          customer_email: string
          customer_name: string
          description: string | null
          id: string
          meeting_link: string | null
          slot_id: string | null
          status: string
        }
        Insert: {
          calendar_event_id?: string | null
          created_at?: string | null
          customer_company?: string | null
          customer_email: string
          customer_name: string
          description?: string | null
          id?: string
          meeting_link?: string | null
          slot_id?: string | null
          status: string
        }
        Update: {
          calendar_event_id?: string | null
          created_at?: string | null
          customer_company?: string | null
          customer_email?: string
          customer_name?: string
          description?: string | null
          id?: string
          meeting_link?: string | null
          slot_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "booking_slots"
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
      landing_pages: {
        Row: {
          analytics_data: Json | null
          content: string
          created_at: string
          created_by: string | null
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
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      delete_language_translations: {
        Args: {
          lang_code: string
        }
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
        Args: {
          requested_locale: string
        }
        Returns: Json
      }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
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
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

