export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          owner: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          owner: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          owner?: string;
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
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
