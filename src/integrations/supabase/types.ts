export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      availability: {
        Row: {
          bloqueado: boolean
          data: string
          id: string
          influencer_id: string
          slots_disponiveis: number
        }
        Insert: {
          bloqueado?: boolean
          data: string
          id?: string
          influencer_id: string
          slots_disponiveis?: number
        }
        Update: {
          bloqueado?: boolean
          data?: string
          id?: string
          influencer_id?: string
          slots_disponiveis?: number
        }
        Relationships: [
          {
            foreignKeyName: "availability_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          atualizado_em: string
          client_id: string
          codigo_confirmacao: string
          criado_em: string
          data_agendada: string
          descricao_produto: string | null
          id: string
          influencer_id: string
          link_negocio: string | null
          material_url: string | null
          observacoes: string | null
          service_id: string
          status: Database["public"]["Enums"]["booking_status"]
        }
        Insert: {
          atualizado_em?: string
          client_id: string
          codigo_confirmacao: string
          criado_em?: string
          data_agendada: string
          descricao_produto?: string | null
          id?: string
          influencer_id: string
          link_negocio?: string | null
          material_url?: string | null
          observacoes?: string | null
          service_id: string
          status?: Database["public"]["Enums"]["booking_status"]
        }
        Update: {
          atualizado_em?: string
          client_id?: string
          codigo_confirmacao?: string
          criado_em?: string
          data_agendada?: string
          descricao_produto?: string | null
          id?: string
          influencer_id?: string
          link_negocio?: string | null
          material_url?: string | null
          observacoes?: string | null
          service_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
        }
        Relationships: [
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          criado_em: string
          email: string | null
          empresa: string | null
          id: string
          influencer_id: string
          instagram: string | null
          nome: string
          notas: string | null
          origem: Database["public"]["Enums"]["client_origin"]
          status: Database["public"]["Enums"]["client_status"]
          whatsapp: string
        }
        Insert: {
          criado_em?: string
          email?: string | null
          empresa?: string | null
          id?: string
          influencer_id: string
          instagram?: string | null
          nome: string
          notas?: string | null
          origem?: Database["public"]["Enums"]["client_origin"]
          status?: Database["public"]["Enums"]["client_status"]
          whatsapp: string
        }
        Update: {
          criado_em?: string
          email?: string | null
          empresa?: string | null
          id?: string
          influencer_id?: string
          instagram?: string | null
          nome?: string
          notas?: string | null
          origem?: Database["public"]["Enums"]["client_origin"]
          status?: Database["public"]["Enums"]["client_status"]
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_analysis: {
        Row: {
          aprovado_por: string | null
          checklist: Json | null
          data_analise: string | null
          id: string
          influencer_id: string
          notas: string | null
          resultado: Database["public"]["Enums"]["analysis_result"]
        }
        Insert: {
          aprovado_por?: string | null
          checklist?: Json | null
          data_analise?: string | null
          id?: string
          influencer_id: string
          notas?: string | null
          resultado?: Database["public"]["Enums"]["analysis_result"]
        }
        Update: {
          aprovado_por?: string | null
          checklist?: Json | null
          data_analise?: string | null
          id?: string
          influencer_id?: string
          notas?: string | null
          resultado?: Database["public"]["Enums"]["analysis_result"]
        }
        Relationships: [
          {
            foreignKeyName: "influencer_analysis_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      influencers: {
        Row: {
          aprovado_em: string | null
          bio: string | null
          criado_em: string
          foto_url: string | null
          id: string
          instagram_url: string | null
          nicho: string | null
          nome: string
          observacoes_admin: string | null
          seguidores: string | null
          status: Database["public"]["Enums"]["influencer_status"]
          user_id: string
          username: string
          whatsapp: string | null
        }
        Insert: {
          aprovado_em?: string | null
          bio?: string | null
          criado_em?: string
          foto_url?: string | null
          id?: string
          instagram_url?: string | null
          nicho?: string | null
          nome: string
          observacoes_admin?: string | null
          seguidores?: string | null
          status?: Database["public"]["Enums"]["influencer_status"]
          user_id: string
          username: string
          whatsapp?: string | null
        }
        Update: {
          aprovado_em?: string | null
          bio?: string | null
          criado_em?: string
          foto_url?: string | null
          id?: string
          instagram_url?: string | null
          nicho?: string | null
          nome?: string
          observacoes_admin?: string | null
          seguidores?: string | null
          status?: Database["public"]["Enums"]["influencer_status"]
          user_id?: string
          username?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          ativo: boolean
          descricao: string | null
          formato: Database["public"]["Enums"]["service_format"]
          id: string
          influencer_id: string
          max_por_dia: number | null
          preco: number
          tipo: Database["public"]["Enums"]["service_type"]
        }
        Insert: {
          ativo?: boolean
          descricao?: string | null
          formato?: Database["public"]["Enums"]["service_format"]
          id?: string
          influencer_id: string
          max_por_dia?: number | null
          preco: number
          tipo: Database["public"]["Enums"]["service_type"]
        }
        Update: {
          ativo?: boolean
          descricao?: string | null
          formato?: Database["public"]["Enums"]["service_format"]
          id?: string
          influencer_id?: string
          max_por_dia?: number | null
          preco?: number
          tipo?: Database["public"]["Enums"]["service_type"]
        }
        Relationships: [
          {
            foreignKeyName: "services_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          criado_em: string
          email: string | null
          empresa: string | null
          id: string
          influencer_id: string | null
          mensagem: string | null
          nome: string
          status: Database["public"]["Enums"]["waitlist_status"]
          whatsapp: string
        }
        Insert: {
          criado_em?: string
          email?: string | null
          empresa?: string | null
          id?: string
          influencer_id?: string | null
          mensagem?: string | null
          nome: string
          status?: Database["public"]["Enums"]["waitlist_status"]
          whatsapp: string
        }
        Update: {
          criado_em?: string
          email?: string | null
          empresa?: string | null
          id?: string
          influencer_id?: string | null
          mensagem?: string | null
          nome?: string
          status?: Database["public"]["Enums"]["waitlist_status"]
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      analysis_result: "aprovado" | "rejeitado" | "pendente"
      app_role: "admin" | "influencer" | "client"
      booking_status: "pendente" | "confirmado" | "concluido" | "cancelado"
      client_origin: "cadastro_manual" | "site" | "whatsapp"
      client_status: "ativo" | "espera" | "bloqueado"
      influencer_status: "em_analise" | "ativa" | "suspensa" | "rejeitada"
      service_format: "online" | "presencial"
      service_type:
        | "stories"
        | "reels"
        | "reels_stories"
        | "feed"
        | "presencial"
      waitlist_status: "aguardando" | "contatado" | "aprovado" | "rejeitado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      analysis_result: ["aprovado", "rejeitado", "pendente"],
      app_role: ["admin", "influencer", "client"],
      booking_status: ["pendente", "confirmado", "concluido", "cancelado"],
      client_origin: ["cadastro_manual", "site", "whatsapp"],
      client_status: ["ativo", "espera", "bloqueado"],
      influencer_status: ["em_analise", "ativa", "suspensa", "rejeitada"],
      service_format: ["online", "presencial"],
      service_type: ["stories", "reels", "reels_stories", "feed", "presencial"],
      waitlist_status: ["aguardando", "contatado", "aprovado", "rejeitado"],
    },
  },
} as const
