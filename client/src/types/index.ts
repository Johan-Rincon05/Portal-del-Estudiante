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
          neighborhood: string;
          locality: string;
          social_stratum: string;
          blood_type: string;
          conflict_victim: boolean;
          marital_status: string;
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
          neighborhood: string;
          locality: string;
          social_stratum: string;
          blood_type: string;
          conflict_victim: boolean;
          marital_status: string;
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
          neighborhood?: string;
          locality?: string;
          social_stratum?: string;
          blood_type?: string;
          conflict_victim?: boolean;
          marital_status?: string;
          created_at?: string;
        };
      };
      university_data: {
        Row: {
          id: string;
          user_id: string;
          university_name: string;
          academic_program: string;
          academic_period: string;
          study_duration: string;
          methodology: string;
          degree_title: string;
          subscription_type: string;
          application_method: string;
          severance_payment_used: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          university_name: string;
          academic_program: string;
          academic_period?: string;
          study_duration?: string;
          methodology?: string;
          degree_title?: string;
          subscription_type?: string;
          application_method?: string;
          severance_payment_used?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          university_name?: string;
          academic_program?: string;
          academic_period?: string;
          study_duration?: string;
          methodology?: string;
          degree_title?: string;
          subscription_type?: string;
          application_method?: string;
          severance_payment_used?: boolean;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          payment_date: string;
          payment_method: string;
          amount: number;
          gift_received: boolean;
          documents_status: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          payment_date?: string;
          payment_method?: string;
          amount?: number;
          gift_received?: boolean;
          documents_status?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          payment_date?: string;
          payment_method?: string;
          amount?: number;
          gift_received?: boolean;
          documents_status?: string;
        };
      };
      installments: {
        Row: {
          id: string;
          user_id: string;
          installment_number: number;
          amount: number;
          support: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          installment_number: number;
          amount?: number;
          support?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          installment_number?: number;
          amount?: number;
          support?: string;
          created_at?: string;
        };
      };
      installment_observations: {
        Row: {
          id: string;
          user_id: string;
          observation: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          observation: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          observation?: string;
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
          response: string;
          created_at: string;
          updated_at: string;
          responded_at: string;
          responded_by: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          message: string;
          status?: string;
          response?: string;
          created_at?: string;
          updated_at?: string;
          responded_at?: string;
          responded_by?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          message?: string;
          status?: string;
          response?: string;
          created_at?: string;
          updated_at?: string;
          responded_at?: string;
          responded_by?: string;
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

export interface Document {
  id: string;
  userId: number;
  type: string;
  name: string;
  path: string;
  uploadedAt: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  rejectionReason?: string | null;
  reviewedBy?: number | null;
  reviewedAt?: string | null;
}

export interface UpdateDocumentStatus {
  status: 'pendiente' | 'aprobado' | 'rechazado';
  rejectionReason?: string | null;
  reviewedBy?: number;
  reviewedAt?: Date;
}
