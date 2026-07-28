export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audits: {
        Row: {
          average_rating: number | null
          business_name: string
          city: string
          competitors: string | null
          created_at: string
          gbp_url: string | null
          id: string
          notes: string | null
          result: Json
          review_count: number | null
          visibility_score: number
          website_url: string
        }
        Insert: {
          average_rating?: number | null
          business_name: string
          city: string
          competitors?: string | null
          created_at?: string
          gbp_url?: string | null
          id?: string
          notes?: string | null
          result: Json
          review_count?: number | null
          visibility_score: number
          website_url: string
        }
        Update: {
          average_rating?: number | null
          business_name?: string
          city?: string
          competitors?: string | null
          created_at?: string
          gbp_url?: string | null
          id?: string
          notes?: string | null
          result?: Json
          review_count?: number | null
          visibility_score?: number
          website_url?: string
        }
        Relationships: []
      }
      brand_profiles: {
        Row: {
          accent_colour: string | null
          approved_at: string | null
          approved_by: string | null
          approved_claims: Json
          approved_ctas: Json
          brand_voice: string | null
          business_summary: string | null
          client_id: string
          content_pillars: Json
          created_at: string
          id: string
          logo_url: string | null
          mission_statement: string | null
          name: string
          primary_colour: string | null
          restricted_claims: Json
          secondary_colour: string | null
          status: string
          target_audience: Json
          unique_selling_points: Json
          updated_at: string
        }
        Insert: {
          accent_colour?: string | null
          approved_at?: string | null
          approved_by?: string | null
          approved_claims?: Json
          approved_ctas?: Json
          brand_voice?: string | null
          business_summary?: string | null
          client_id: string
          content_pillars?: Json
          created_at?: string
          id?: string
          logo_url?: string | null
          mission_statement?: string | null
          name: string
          primary_colour?: string | null
          restricted_claims?: Json
          secondary_colour?: string | null
          status?: string
          target_audience?: Json
          unique_selling_points?: Json
          updated_at?: string
        }
        Update: {
          accent_colour?: string | null
          approved_at?: string | null
          approved_by?: string | null
          approved_claims?: Json
          approved_ctas?: Json
          brand_voice?: string | null
          business_summary?: string | null
          client_id?: string
          content_pillars?: Json
          created_at?: string
          id?: string
          logo_url?: string | null
          mission_statement?: string | null
          name?: string
          primary_colour?: string | null
          restricted_claims?: Json
          secondary_colour?: string | null
          status?: string
          target_audience?: Json
          unique_selling_points?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_profiles_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_faqs: {
        Row: {
          answer: string
          approved_at: string | null
          approved_by: string | null
          category: string | null
          client_id: string
          created_at: string
          id: string
          is_ai_usable: boolean
          location_id: string | null
          question: string
          status: string
          updated_at: string
        }
        Insert: {
          answer: string
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          client_id: string
          created_at?: string
          id?: string
          is_ai_usable?: boolean
          location_id?: string | null
          question: string
          status?: string
          updated_at?: string
        }
        Update: {
          answer?: string
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          client_id?: string
          created_at?: string
          id?: string
          is_ai_usable?: boolean
          location_id?: string | null
          question?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_faqs_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_faqs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_faqs_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "client_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_locations: {
        Row: {
          accepting_registrations: boolean
          address_line_1: string
          address_line_2: string | null
          capacity_status: string | null
          city: string
          client_id: string
          country_code: string
          created_at: string
          email: string | null
          google_business_profile_url: string | null
          id: string
          internal_name: string | null
          latitude: number | null
          longitude: number | null
          name: string
          opening_date: string | null
          phone: string | null
          postal_code: string
          province_code: string
          slug: string
          status: string
          timezone: string
          tour_booking_enabled: boolean
          updated_at: string
          website_url: string | null
        }
        Insert: {
          accepting_registrations?: boolean
          address_line_1: string
          address_line_2?: string | null
          capacity_status?: string | null
          city: string
          client_id: string
          country_code?: string
          created_at?: string
          email?: string | null
          google_business_profile_url?: string | null
          id?: string
          internal_name?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_date?: string | null
          phone?: string | null
          postal_code: string
          province_code: string
          slug: string
          status?: string
          timezone?: string
          tour_booking_enabled?: boolean
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          accepting_registrations?: boolean
          address_line_1?: string
          address_line_2?: string | null
          capacity_status?: string | null
          city?: string
          client_id?: string
          country_code?: string
          created_at?: string
          email?: string | null
          google_business_profile_url?: string | null
          id?: string
          internal_name?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_date?: string | null
          phone?: string | null
          postal_code?: string
          province_code?: string
          slug?: string
          status?: string
          timezone?: string
          tour_booking_enabled?: boolean
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_locations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_memberships: {
        Row: {
          accepted_at: string | null
          client_id: string
          created_at: string
          id: string
          invited_at: string | null
          is_active: boolean
          profile_id: string
          role: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          client_id: string
          created_at?: string
          id?: string
          invited_at?: string | null
          is_active?: boolean
          profile_id: string
          role: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          client_id?: string
          created_at?: string
          id?: string
          invited_at?: string | null
          is_active?: boolean
          profile_id?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_memberships_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_memberships_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          assigned_account_manager_id: string | null
          country_code: string
          created_at: string
          id: string
          legal_name: string | null
          name: string
          onboarding_completed_at: string | null
          onboarding_status: string
          primary_email: string | null
          primary_phone: string | null
          slug: string
          status: string
          subscription_plan: string | null
          timezone: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          assigned_account_manager_id?: string | null
          country_code?: string
          created_at?: string
          id?: string
          legal_name?: string | null
          name: string
          onboarding_completed_at?: string | null
          onboarding_status?: string
          primary_email?: string | null
          primary_phone?: string | null
          slug: string
          status?: string
          subscription_plan?: string | null
          timezone?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          assigned_account_manager_id?: string | null
          country_code?: string
          created_at?: string
          id?: string
          legal_name?: string | null
          name?: string
          onboarding_completed_at?: string | null
          onboarding_status?: string
          primary_email?: string | null
          primary_phone?: string | null
          slug?: string
          status?: string
          subscription_plan?: string | null
          timezone?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_assigned_account_manager_id_fkey"
            columns: ["assigned_account_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      location_business_hours: {
        Row: {
          client_id: string
          close_time: string | null
          created_at: string
          day_of_week: number
          hours_type: string
          id: string
          is_closed: boolean
          location_id: string
          open_time: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          close_time?: string | null
          created_at?: string
          day_of_week: number
          hours_type?: string
          id?: string
          is_closed?: boolean
          location_id: string
          open_time?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          close_time?: string | null
          created_at?: string
          day_of_week?: number
          hours_type?: string
          id?: string
          is_closed?: boolean
          location_id?: string
          open_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_business_hours_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_business_hours_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "client_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      location_memberships: {
        Row: {
          client_id: string
          created_at: string
          id: string
          location_id: string
          profile_id: string
          role: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          location_id: string
          profile_id: string
          role: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          location_id?: string
          profile_id?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_memberships_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_memberships_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "client_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_memberships_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      location_programs: {
        Row: {
          accepting_registrations: boolean
          availability_notes: string | null
          client_id: string
          created_at: string
          id: string
          is_available: boolean
          location_id: string
          program_id: string
          updated_at: string
        }
        Insert: {
          accepting_registrations?: boolean
          availability_notes?: string | null
          client_id: string
          created_at?: string
          id?: string
          is_available?: boolean
          location_id: string
          program_id: string
          updated_at?: string
        }
        Update: {
          accepting_registrations?: boolean
          availability_notes?: string | null
          client_id?: string
          created_at?: string
          id?: string
          is_available?: boolean
          location_id?: string
          program_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_programs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_programs_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "client_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          last_login_at: string | null
          phone: string | null
          platform_role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          last_login_at?: string | null
          phone?: string | null
          platform_role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          phone?: string | null
          platform_role?: string
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          id: string
          maximum_age_months: number | null
          minimum_age_months: number | null
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          maximum_age_months?: number | null
          minimum_age_months?: number | null
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          maximum_age_months?: number | null
          minimum_age_months?: number | null
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_client_access: {
        Args: { target_client_id: string }
        Returns: boolean
      }
      has_location_access: {
        Args: { target_location_id: string }
        Returns: boolean
      }
      is_assigned_account_manager: {
        Args: { target_client_id: string }
        Returns: boolean
      }
      is_client_manager: {
        Args: { target_client_id: string }
        Returns: boolean
      }
      is_platform_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
