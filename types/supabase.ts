export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: number;
          created_at: string | null;
          sdp: any | null;
          caller_name: string | null;
          session_id: string;
          receiver_name: string | null;
          ice: any[] | null;
        };
        Insert: {
          id?: number;
          created_at?: string | null;
          sdp?: any | null;
          caller_name?: string | null;
          session_id?: string;
          receiver_name?: string | null;
          ice?: any[] | null;
        };
        Update: {
          id?: number;
          created_at?: string | null;
          sdp?: any | null;
          caller_name?: string | null;
          session_id?: string;
          receiver_name?: string | null;
          ice?: any[] | null;
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
