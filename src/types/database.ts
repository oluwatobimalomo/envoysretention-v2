import type { AppRole } from "@/lib/config/roles";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string; role: AppRole; is_active: boolean; created_at: string; updated_at: string; };
        Insert: { id: string; full_name: string; role: AppRole; is_active?: boolean; };
        Update: { full_name?: string; role?: AppRole; is_active?: boolean; };
        Relationships: [];
      };
      first_timers: {
        Row: {
          id: string;
          full_name: string;
          phone: string;
          email: string | null;
          gender: string | null;
          dob: string | null;
          marital_status: string | null;
          house_address: string | null;
          nearest_landmark: string | null;
          membership_decision: string | null;
          life_stage: string | null;
          heard_from: string | null;
          areas_of_interest: string[];
          service_feedback: string | null;
          service_date: string;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          phone: string;
          email?: string | null;
          gender?: string | null;
          dob?: string | null;
          marital_status?: string | null;
          house_address?: string | null;
          nearest_landmark?: string | null;
          membership_decision?: string | null;
          life_stage?: string | null;
          heard_from?: string | null;
          areas_of_interest?: string[];
          service_feedback?: string | null;
          service_date?: string;
          is_active?: boolean;
          created_by?: string | null;
        };
        Update: {
          full_name?: string;
          phone?: string;
          email?: string | null;
          gender?: string | null;
          dob?: string | null;
          marital_status?: string | null;
          house_address?: string | null;
          nearest_landmark?: string | null;
          membership_decision?: string | null;
          life_stage?: string | null;
          heard_from?: string | null;
          areas_of_interest?: string[];
          service_feedback?: string | null;
          service_date?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: { app_role: AppRole; };
    CompositeTypes: Record<string, never>;
  };
}
