export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      marketplace_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      marketplace_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_primary: boolean
          listing_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_primary?: boolean
          listing_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_primary?: boolean
          listing_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          category_id: string | null
          condition: string
          created_at: string
          description: string
          dimensions: string | null
          featured: boolean
          id: string
          is_active: boolean
          latitude: number | null
          location_city: string | null
          location_country: string | null
          location_state: string | null
          longitude: number | null
          material: string | null
          postal_code: string | null
          price: number
          print_time_hours: number | null
          seller_id: string
          street_address: string | null
          tags: string[] | null
          title: string
          updated_at: string
          views_count: number
          weight_grams: number | null
        }
        Insert: {
          category_id?: string | null
          condition: string
          created_at?: string
          description: string
          dimensions?: string | null
          featured?: boolean
          id?: string
          is_active?: boolean
          latitude?: number | null
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
          longitude?: number | null
          material?: string | null
          postal_code?: string | null
          price: number
          print_time_hours?: number | null
          seller_id: string
          street_address?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          views_count?: number
          weight_grams?: number | null
        }
        Update: {
          category_id?: string | null
          condition?: string
          created_at?: string
          description?: string
          dimensions?: string | null
          featured?: boolean
          id?: string
          is_active?: boolean
          latitude?: number | null
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
          longitude?: number | null
          material?: string | null
          postal_code?: string | null
          price?: number
          print_time_hours?: number | null
          seller_id?: string
          street_address?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "marketplace_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          listing_id: string | null
          receiver_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          listing_id?: string | null
          receiver_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          listing_id?: string | null
          receiver_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          availability_status: string | null
          business_name: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          latitude: number | null
          location: string | null
          location_city: string | null
          location_country: string | null
          location_state: string | null
          longitude: number | null
          postal_code: string | null
          price_range: string | null
          printer_models: string | null
          specialties: string | null
          street_address: string | null
          unread_messages_count: number | null
          updated_at: string
          user_type: string
        }
        Insert: {
          availability_status?: string | null
          business_name?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          latitude?: number | null
          location?: string | null
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
          longitude?: number | null
          postal_code?: string | null
          price_range?: string | null
          printer_models?: string | null
          specialties?: string | null
          street_address?: string | null
          unread_messages_count?: number | null
          updated_at?: string
          user_type: string
        }
        Update: {
          availability_status?: string | null
          business_name?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          latitude?: number | null
          location?: string | null
          location_city?: string | null
          location_country?: string | null
          location_state?: string | null
          longitude?: number | null
          postal_code?: string | null
          price_range?: string | null
          printer_models?: string | null
          specialties?: string | null
          street_address?: string | null
          unread_messages_count?: number | null
          updated_at?: string
          user_type?: string
        }
        Relationships: []
      }
      uploaded_files: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          updated_at: string
          upload_status: string
          user_name: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          updated_at?: string
          upload_status?: string
          user_name: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          updated_at?: string
          upload_status?: string
          user_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reset_unread_messages: {
        Args: {
          user_id: string
          conversation_participant_id: string
          listing_id: string
        }
        Returns: undefined
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
  public: {
    Enums: {},
  },
} as const
