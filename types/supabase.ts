export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          caller_name: string | null;
          created_at: string | null;
          ice: any | null;
          id: number;
          receiver_name: string | null;
          sdp: any | null;
          session_id: string;
        };
        Insert: {
          caller_name?: string | null;
          created_at?: string | null;
          ice?: any | null;
          id?: number;
          receiver_name?: string | null;
          sdp?: any | null;
          session_id?: string;
        };
        Update: {
          caller_name?: string | null;
          created_at?: string | null;
          ice?: any | null;
          id?: number;
          receiver_name?: string | null;
          sdp?: any | null;
          session_id?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
