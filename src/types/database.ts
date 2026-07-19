/**
 * Supabase database types.
 *
 * This file is normally GENERATED with `npm run db:types` (which runs
 * `supabase gen types typescript --local`). It is hand-authored here for the Phase 1
 * schema so the project type-checks before a local Supabase instance is available.
 * Regenerate it after every migration and do not edit by hand once generation is wired up.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PlatformRoleEnum =
  | "super_admin"
  | "market_studio_admin"
  | "account_manager"
  | "client_user";

export type ClientRoleEnum =
  | "client_admin"
  | "location_manager"
  | "staff"
  | "viewer"
  | "market_studio_account_manager";

export type ClientStatus =
  | "prospect"
  | "onboarding"
  | "active"
  | "paused"
  | "cancelled"
  | "archived";

export type LocationStatus =
  | "planned"
  | "coming_soon"
  | "active"
  | "temporarily_closed"
  | "closed"
  | "archived";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          platform_role: PlatformRoleEnum;
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          platform_role?: PlatformRoleEnum;
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          name: string;
          legal_name: string | null;
          slug: string;
          website_url: string | null;
          primary_email: string | null;
          primary_phone: string | null;
          country_code: string;
          timezone: string;
          status: ClientStatus;
          assigned_account_manager_id: string | null;
          subscription_plan: string | null;
          onboarding_status: string;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          legal_name?: string | null;
          slug: string;
          website_url?: string | null;
          primary_email?: string | null;
          primary_phone?: string | null;
          country_code?: string;
          timezone?: string;
          status?: ClientStatus;
          assigned_account_manager_id?: string | null;
          subscription_plan?: string | null;
          onboarding_status?: string;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
        Relationships: [];
      };
      client_memberships: {
        Row: {
          id: string;
          client_id: string;
          profile_id: string;
          role: ClientRoleEnum;
          is_active: boolean;
          invited_at: string | null;
          accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          profile_id: string;
          role: ClientRoleEnum;
          is_active?: boolean;
          invited_at?: string | null;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["client_memberships"]["Insert"]>;
        Relationships: [];
      };
      client_locations: {
        Row: {
          id: string;
          client_id: string;
          name: string;
          slug: string;
          internal_name: string | null;
          address_line_1: string;
          address_line_2: string | null;
          city: string;
          province_code: string;
          postal_code: string;
          country_code: string;
          latitude: number | null;
          longitude: number | null;
          phone: string | null;
          email: string | null;
          website_url: string | null;
          google_business_profile_url: string | null;
          timezone: string;
          opening_date: string | null;
          status: LocationStatus;
          capacity_status: string | null;
          accepting_registrations: boolean;
          tour_booking_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          name: string;
          slug: string;
          internal_name?: string | null;
          address_line_1: string;
          address_line_2?: string | null;
          city: string;
          province_code: string;
          postal_code: string;
          country_code?: string;
          latitude?: number | null;
          longitude?: number | null;
          phone?: string | null;
          email?: string | null;
          website_url?: string | null;
          google_business_profile_url?: string | null;
          timezone?: string;
          opening_date?: string | null;
          status?: LocationStatus;
          capacity_status?: string | null;
          accepting_registrations?: boolean;
          tour_booking_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["client_locations"]["Insert"]>;
        Relationships: [];
      };
      location_memberships: {
        Row: {
          id: string;
          client_id: string;
          location_id: string;
          profile_id: string;
          role: ClientRoleEnum;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          location_id: string;
          profile_id: string;
          role: ClientRoleEnum;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["location_memberships"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_platform_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      has_client_access: {
        Args: { target_client_id: string };
        Returns: boolean;
      };
      has_location_access: {
        Args: { target_location_id: string };
        Returns: boolean;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
