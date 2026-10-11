export type TransactionType = 'income' | 'expense';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          balance: number;
          currency: string;
          first_name: string | null;
          last_name: string | null;
          created_at: string;
          updated_at: string;
        };

        Insert: {
          id: string;
          email?: string | null;
          balance?: number;
          currency?: string;
          first_name?: string | null;
          last_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };

        Update: {
          email?: string | null;
          balance?: number;
          currency?: string;
          first_name?: string | null;
          last_name?: string | null;
          updated_at?: string;
        };
      };

      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: TransactionType;
          date: string;
          description: string;
          category: string;
          amount: number;
          created_at: string;
        };

        Insert: {
          id?: string;
          user_id: string;
          type: TransactionType;
          date?: string;
          description: string;
          category: string;
          amount: number;
          created_at?: string;
        };

        Update: {
          type?: TransactionType;
          date?: string;
          description?: string;
          category?: string;
          amount?: number;
        };
      };

      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: TransactionType;
          icon: string | null;
          created_at: string;
        };

        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: TransactionType;
          icon?: string | null;
          created_at?: string;
        };

        Update: {
          name?: string;
          type?: TransactionType;
          icon?: string | null;
        };
      };
    };
  };
}

export type Transaction =
  Database['public']['Tables']['transactions']['Row'];

export type InsertTransaction =
  Database['public']['Tables']['transactions']['Insert'];

export type Profile =
  Database['public']['Tables']['profiles']['Row'];