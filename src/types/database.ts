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
      call_assignments: {
        Row: { id: string; first_timer_id: string; assigned_to: string; assigned_by: string | null; assigned_at: string; };
        Insert: { id?: string; first_timer_id: string; assigned_to: string; assigned_by?: string | null; };
        Update: { assigned_to?: string; assigned_by?: string | null; };
        Relationships: [];
      };
      call_feedback: {
        Row: {
          id: string; first_timer_id: string; week_number: number; call_status: string;
          experience_rating: string | null; returning: string | null; notes: string | null;
          follow_up_date: string | null; caller_name: string; caller_id: string | null;
          flagged_for_pastoral: boolean; flag_reason: string | null; church_attendance: string | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; first_timer_id: string; week_number: number; call_status: string;
          experience_rating?: string | null; returning?: string | null; notes?: string | null;
          follow_up_date?: string | null; caller_name: string; caller_id?: string | null;
          flagged_for_pastoral?: boolean; flag_reason?: string | null; church_attendance?: string | null;
        };
        Update: {
          call_status?: string; experience_rating?: string | null; returning?: string | null;
          notes?: string | null; follow_up_date?: string | null; flagged_for_pastoral?: boolean;
          flag_reason?: string | null; church_attendance?: string | null;
        };
        Relationships: [];
      };
      pipeline_overviews: {
        Row: {
          id: string; first_timer_id: string; submitted_by: string; submitted_by_id: string | null;
          move_to_membership: boolean; natural_groups: string[] | null; connect_center: string | null;
          overview_notes: string | null; submitted_at: string; updated_at: string;
        };
        Insert: {
          id?: string; first_timer_id: string; submitted_by: string; submitted_by_id?: string | null;
          move_to_membership: boolean; natural_groups?: string[] | null; connect_center?: string | null;
          overview_notes?: string | null;
        };
        Update: {
          move_to_membership?: boolean; natural_groups?: string[] | null; connect_center?: string | null;
          overview_notes?: string | null;
        };
        Relationships: [];
      };
      vip_message_assignments: {
        Row: {
          id: string; first_timer_id: string; assigned_to: string | null; assigned_by: string | null;
          messaged: boolean; messaged_by: string | null; messaged_at: string | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; first_timer_id: string; assigned_to?: string | null; assigned_by?: string | null;
          messaged?: boolean; messaged_by?: string | null; messaged_at?: string | null;
        };
        Update: {
          assigned_to?: string | null; assigned_by?: string | null;
          messaged?: boolean; messaged_by?: string | null; messaged_at?: string | null;
        };
        Relationships: [];
      };
      soul_care_contacts: {
        Row: {
          id: string; full_name: string; phone: string; email: string | null; gender: string | null;
          dob: string | null; marital_status: string | null; life_stage: string | null;
          house_address: string | null; nearest_landmark: string | null;
          original_first_timer_id: string | null; is_active: boolean; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; full_name: string; phone: string; email?: string | null; gender?: string | null;
          dob?: string | null; marital_status?: string | null; life_stage?: string | null;
          house_address?: string | null; nearest_landmark?: string | null;
          original_first_timer_id?: string | null; is_active?: boolean;
        };
        Update: {
          full_name?: string; phone?: string; email?: string | null; gender?: string | null;
          dob?: string | null; marital_status?: string | null; life_stage?: string | null;
          house_address?: string | null; nearest_landmark?: string | null; is_active?: boolean;
        };
        Relationships: [];
      };
      soul_care_assignments: {
        Row: { id: string; contact_id: string; assigned_to: string; assigned_by: string | null; assigned_at: string; };
        Insert: { id?: string; contact_id: string; assigned_to: string; assigned_by?: string | null; };
        Update: { assigned_to?: string; };
        Relationships: [];
      };
      soul_care_visits: {
        Row: {
          id: string; contact_id: string; logged_by: string | null; logged_by_id: string | null;
          visit_type: string; reason_for_care: string | null; urgency: string | null; visit_status: string;
          visit_date: string | null; visit_time: string | null; meeting_notes: string | null;
          visit_photo_url: string | null; material_support: boolean; material_support_notes: string | null;
          prayer_requests: string | null; testimony: string | null; follow_up_required: boolean;
          next_follow_up_date: string | null; escalate_to_pastorate: boolean; escalation_reason: string | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; contact_id: string; logged_by?: string | null; logged_by_id?: string | null;
          visit_type: string; reason_for_care?: string | null; urgency?: string | null; visit_status: string;
          visit_date?: string | null; visit_time?: string | null; meeting_notes?: string | null;
          visit_photo_url?: string | null; material_support?: boolean; material_support_notes?: string | null;
          prayer_requests?: string | null; testimony?: string | null; follow_up_required?: boolean;
          next_follow_up_date?: string | null; escalate_to_pastorate?: boolean; escalation_reason?: string | null;
        };
        Update: {
          visit_type?: string; reason_for_care?: string | null; urgency?: string | null; visit_status?: string;
          visit_date?: string | null; visit_time?: string | null; meeting_notes?: string | null;
          visit_photo_url?: string | null; material_support?: boolean; material_support_notes?: string | null;
          prayer_requests?: string | null; testimony?: string | null; follow_up_required?: boolean;
          next_follow_up_date?: string | null; escalate_to_pastorate?: boolean; escalation_reason?: string | null;
        };
        Relationships: [];
      };
      potential_envoys: {
        Row: {
          id: string; full_name: string; phone: string; gender: string | null;
          original_first_timer_id: string | null; training_completed: boolean;
          training_completed_date: string | null; training_notes: string | null;
          promoted_to_membership: boolean; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; full_name: string; phone: string; gender?: string | null;
          original_first_timer_id?: string | null; training_completed?: boolean;
          training_completed_date?: string | null; training_notes?: string | null;
          promoted_to_membership?: boolean;
        };
        Update: {
          training_completed?: boolean; training_completed_date?: string | null;
          training_notes?: string | null; promoted_to_membership?: boolean;
        };
        Relationships: [];
      };
      potential_envoys_assignments: {
        Row: { id: string; potential_envoy_id: string; assigned_to: string; assigned_by: string | null; assigned_at: string; };
        Insert: { id?: string; potential_envoy_id: string; assigned_to: string; assigned_by?: string | null; };
        Update: { assigned_to?: string; };
        Relationships: [];
      };
      potential_envoys_feedback: {
        Row: {
          id: string; potential_envoy_id: string; week_number: number; call_status: string;
          notes: string | null; follow_up_date: string | null; caller_name: string | null; caller_id: string | null;
          flagged_for_pastoral: boolean; flag_reason: string | null; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; potential_envoy_id: string; week_number: number; call_status: string;
          notes?: string | null; follow_up_date?: string | null; caller_name?: string | null; caller_id?: string | null;
          flagged_for_pastoral?: boolean; flag_reason?: string | null;
        };
        Update: {
          call_status?: string; notes?: string | null; follow_up_date?: string | null;
          flagged_for_pastoral?: boolean; flag_reason?: string | null;
        };
        Relationships: [];
      };
      new_converts: {
        Row: {
          id: string; full_name: string; phone: string; gender: string | null;
          conversion_type: string; conversion_date: string; source: string; added_by: string | null;
          envoys_training_completed: boolean; envoys_training_completed_date: string | null;
          training_scheduled_date: string | null; trainer_name: string | null; envoys_training_notes: string | null;
          is_active: boolean; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; full_name: string; phone: string; gender?: string | null;
          conversion_type?: string; conversion_date?: string; source?: string; added_by?: string | null;
          envoys_training_completed?: boolean; envoys_training_completed_date?: string | null;
          training_scheduled_date?: string | null; trainer_name?: string | null; envoys_training_notes?: string | null;
          is_active?: boolean;
        };
        Update: {
          envoys_training_completed?: boolean; envoys_training_completed_date?: string | null;
          training_scheduled_date?: string | null; trainer_name?: string | null; envoys_training_notes?: string | null;
        };
        Relationships: [];
      };
      new_converts_assignments: {
        Row: { id: string; new_convert_id: string; assigned_to: string; assigned_by: string | null; assigned_at: string; };
        Insert: { id?: string; new_convert_id: string; assigned_to: string; assigned_by?: string | null; };
        Update: { assigned_to?: string; };
        Relationships: [];
      };
      new_converts_checkins: {
        Row: {
          id: string; new_convert_id: string; checkin_number: number; call_status: string;
          notes: string | null; follow_up_date: string | null; caller_name: string | null; caller_id: string | null;
          flagged_for_pastoral: boolean; flag_reason: string | null; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; new_convert_id: string; checkin_number: number; call_status: string;
          notes?: string | null; follow_up_date?: string | null; caller_name?: string | null; caller_id?: string | null;
          flagged_for_pastoral?: boolean; flag_reason?: string | null;
        };
        Update: {
          call_status?: string; notes?: string | null; follow_up_date?: string | null;
          flagged_for_pastoral?: boolean; flag_reason?: string | null;
        };
        Relationships: [];
      };
      megastar_guardians: {
        Row: { id: string; full_name: string; phone: string; added_by: string | null; created_at: string; };
        Insert: { id?: string; full_name: string; phone: string; added_by?: string | null; };
        Update: { full_name?: string; phone?: string; };
        Relationships: [];
      };
      megastars: {
        Row: {
          id: string; full_name: string; gender: string | null; dob: string | null; class: string | null;
          is_active: boolean; removed_reason: string | null; removed_at: string | null;
          added_by: string | null; created_at: string;
        };
        Insert: {
          id?: string; full_name: string; gender?: string | null; dob?: string | null; class?: string | null;
          is_active?: boolean; added_by?: string | null;
        };
        Update: {
          full_name?: string; gender?: string | null; dob?: string | null; class?: string | null;
          is_active?: boolean; removed_reason?: string | null; removed_at?: string | null;
        };
        Relationships: [];
      };
      megastar_guardian_links: {
        Row: { id: string; megastar_id: string; guardian_id: string; relationship: string | null; };
        Insert: { id?: string; megastar_id: string; guardian_id: string; relationship?: string | null; };
        Update: { relationship?: string | null; };
        Relationships: [];
      };
      megastar_services: {
        Row: {
          id: string; label: string; service_date: string; status: string;
          created_by: string | null; closed_at: string | null; created_at: string;
        };
        Insert: { id?: string; label: string; service_date?: string; status?: string; created_by?: string | null; };
        Update: { status?: string; closed_at?: string | null; };
        Relationships: [];
      };
      megastar_checkins: {
        Row: {
          id: string; service_id: string; megastar_id: string; guardian_id: string;
          class_at_checkin: string | null; checked_in_by: string | null; check_in_time: string;
          check_out_time: string | null; checked_out_by: string | null; checkout_guardian_id: string | null;
        };
        Insert: {
          id?: string; service_id: string; megastar_id: string; guardian_id: string;
          class_at_checkin?: string | null; checked_in_by?: string | null;
        };
        Update: {
          check_out_time?: string | null; checked_out_by?: string | null; checkout_guardian_id?: string | null;
        };
        Relationships: [];
      };
      access_requests: {
        Row: {
          id: string; full_name: string; email: string; phone: string | null;
          requested_role: AppRole; message: string | null; status: string;
          reviewed_by: string | null; reviewed_at: string | null; denial_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string; full_name: string; email: string; phone?: string | null;
          requested_role: AppRole; message?: string | null;
        };
        Update: {
          status?: string; reviewed_by?: string | null; reviewed_at?: string | null; denial_reason?: string | null;
        };
        Relationships: [];
      };
      feedback_submissions: {
        Row: {
          id: string; name: string | null; gender: string | null; phone: string | null;
          membership_status: string | null; focus_points: string[]; feedback: string; submitted_at: string;
        };
        Insert: {
          id?: string; name?: string | null; gender?: string | null; phone?: string | null;
          membership_status?: string | null; focus_points?: string[]; feedback: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      public_testimonies: {
        Row: { id: string; name: string | null; category: string; testimony: string; submitted_at: string; };
        Insert: { id?: string; name?: string | null; category?: string; testimony: string; };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: { app_role: AppRole; };
    CompositeTypes: Record<string, never>;
  };
}
