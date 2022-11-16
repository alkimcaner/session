export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: number;
          created_at: string | null;
          offer: any | null;
          answer: any | null;
          caller_name: string | null;
          session_id: string;
          offer_ice: string | null;
          answer_ice: string | null;
          receiver_name: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string | null;
          offer?: any | null;
          answer?: any | null;
          caller_name?: string | null;
          session_id?: string;
          offer_ice?: string | null;
          answer_ice?: string | null;
          receiver_name?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string | null;
          offer?: any | null;
          answer?: any | null;
          caller_name?: string | null;
          session_id?: string;
          offer_ice?: string | null;
          answer_ice?: string | null;
          receiver_name?: string | null;
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
