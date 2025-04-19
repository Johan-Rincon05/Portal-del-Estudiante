export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          document_type: string;
          document_number: string;
          birth_date: string;
          phone: string;
          city: string;
          address: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          document_type: string;
          document_number: string;
          birth_date: string;
          phone: string;
          city: string;
          address: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          document_type?: string;
          document_number?: string;
          birth_date?: string;
          phone?: string;
          city?: string;
          address?: string;
          created_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          path: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          path: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          path?: string;
          uploaded_at?: string;
        };
      };
      requests: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          message: string;
          status: string;
          response: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          message: string;
          status?: string;
          response?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          message?: string;
          status?: string;
          response?: string | null;
          created_at?: string;
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
};

export type ProfileWithCounts = {
  id: string;
  fullName: string;
  email: string;
  documentType: string;
  documentNumber: string;
  birthDate: string;
  phone: string;
  city: string;
  address: string;
  createdAt: string;
  documentCount?: number;
  pendingRequestCount?: number;
};

export type DocumentWithUser = {
  id: string;
  userId: string;
  type: string;
  path: string;
  uploadedAt: string;
  userName?: string;
  userEmail?: string;
};

export type RequestWithUser = {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: string;
  response: string | null;
  createdAt: string;
  userName?: string;
  userEmail?: string;
};
