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
          created_at: string
          data: string
          id: string
          influencer_id: string
          motivo: string | null
          slots_disponiveis: number
        }
        Insert: {
          bloqueado?: boolean
          created_at?: string
          data: string
          id?: string
          influencer_id: string
          motivo?: string | null
          slots_disponiveis?: number
        }
        Update: {
          bloqueado?: boolean
          created_at?: string
          data?: string
          id?: string
          influencer_id?: string
          motivo?: string | null
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
          client_id: string | null
          codigo_confirmacao: string
          criado_em: string
          data_agendada: string
          descricao_produto: string
          id: string
          influencer_id: string
          link_negocio: string | null
          material_url: string[] | null
          observacoes: string | null
          origem: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["booking_status"]
          valor: number | null
        }
        Insert: {
          atualizado_em?: string
          client_id?: string | null
          codigo_confirmacao: string
          criado_em?: string
          data_agendada: string
          descricao_produto: string
          id?: string
          influencer_id: string
          link_negocio?: string | null
          material_url?: string[] | null
          observacoes?: string | null
          origem?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          valor?: number | null
        }
        Update: {
          atualizado_em?: string
          client_id?: string | null
          codigo_confirmacao?: string
          criado_em?: string
          data_agendada?: string
          descricao_produto?: string
          id?: string
          influencer_id?: string
          link_negocio?: string | null
          material_url?: string[] | null
          observacoes?: string | null
          origem?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          valor?: number | null
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
      client_profiles: {
        Row: {
          cnpj: string | null
          cpf: string | null
          created_at: string
          email: string
          endereco_comercial: string | null
          id: string
          nome: string
          razao_social: string | null
          tipo_pessoa: Database["public"]["Enums"]["tipo_pessoa"]
          updated_at: string
          user_id: string
          whatsapp: string
        }
        Insert: {
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          email: string
          endereco_comercial?: string | null
          id?: string
          nome: string
          razao_social?: string | null
          tipo_pessoa: Database["public"]["Enums"]["tipo_pessoa"]
          updated_at?: string
          user_id: string
          whatsapp: string
        }
        Update: {
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          email?: string
          endereco_comercial?: string | null
          id?: string
          nome?: string
          razao_social?: string | null
          tipo_pessoa?: Database["public"]["Enums"]["tipo_pessoa"]
          updated_at?: string
          user_id?: string
          whatsapp?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          criado_via_sdr: boolean | null
          email: string | null
          empresa: string | null
          id: string
          influencer_id: string
          instagram: string | null
          nome: string
          notas: string | null
          origem: Database["public"]["Enums"]["client_origem"]
          status: Database["public"]["Enums"]["client_status"]
          updated_at: string
          user_id: string | null
          whatsapp: string
        }
        Insert: {
          created_at?: string
          criado_via_sdr?: boolean | null
          email?: string | null
          empresa?: string | null
          id?: string
          influencer_id: string
          instagram?: string | null
          nome: string
          notas?: string | null
          origem?: Database["public"]["Enums"]["client_origem"]
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          user_id?: string | null
          whatsapp: string
        }
        Update: {
          created_at?: string
          criado_via_sdr?: boolean | null
          email?: string | null
          empresa?: string | null
          id?: string
          influencer_id?: string
          instagram?: string | null
          nome?: string
          notas?: string | null
          origem?: Database["public"]["Enums"]["client_origem"]
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          user_id?: string | null
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
          created_at: string
          data_analise: string | null
          id: string
          influencer_id: string
          notas: string | null
          resultado: string | null
        }
        Insert: {
          aprovado_por?: string | null
          checklist?: Json | null
          created_at?: string
          data_analise?: string | null
          id?: string
          influencer_id: string
          notas?: string | null
          resultado?: string | null
        }
        Update: {
          aprovado_por?: string | null
          checklist?: Json | null
          created_at?: string
          data_analise?: string | null
          id?: string
          influencer_id?: string
          notas?: string | null
          resultado?: string | null
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
          aprovacao_auto_online: boolean | null
          aprovado_em: string | null
          avaliacao: number | null
          bio: string | null
          cover_url: string | null
          created_at: string
          foto_url: string | null
          id: string
          instagram: string | null
          marcas_parceiras: number | null
          nicho: string | null
          nome: string
          politica_cancelamento_horas: number | null
          seguidores: number | null
          status: Database["public"]["Enums"]["influencer_status"]
          total_campanhas: number | null
          updated_at: string
          user_id: string | null
          username: string
          whatsapp: string | null
        }
        Insert: {
          aprovacao_auto_online?: boolean | null
          aprovado_em?: string | null
          avaliacao?: number | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          instagram?: string | null
          marcas_parceiras?: number | null
          nicho?: string | null
          nome: string
          politica_cancelamento_horas?: number | null
          seguidores?: number | null
          status?: Database["public"]["Enums"]["influencer_status"]
          total_campanhas?: number | null
          updated_at?: string
          user_id?: string | null
          username: string
          whatsapp?: string | null
        }
        Update: {
          aprovacao_auto_online?: boolean | null
          aprovado_em?: string | null
          avaliacao?: number | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          instagram?: string | null
          marcas_parceiras?: number | null
          nicho?: string | null
          nome?: string
          politica_cancelamento_horas?: number | null
          seguidores?: number | null
          status?: Database["public"]["Enums"]["influencer_status"]
          total_campanhas?: number | null
          updated_at?: string
          user_id?: string | null
          username?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      sdr_sessions: {
        Row: {
          contexto: Json | null
          created_at: string
          data_escolhida: string | null
          empresa: string | null
          expirado: boolean | null
          id: string
          influencer_id: string | null
          nome: string | null
          service_id: string | null
          step: string | null
          tentativas_invalidas: number | null
          ultimo_contato: string | null
          whatsapp: string
        }
        Insert: {
          contexto?: Json | null
          created_at?: string
          data_escolhida?: string | null
          empresa?: string | null
          expirado?: boolean | null
          id?: string
          influencer_id?: string | null
          nome?: string | null
          service_id?: string | null
          step?: string | null
          tentativas_invalidas?: number | null
          ultimo_contato?: string | null
          whatsapp: string
        }
        Update: {
          contexto?: Json | null
          created_at?: string
          data_escolhida?: string | null
          empresa?: string | null
          expirado?: boolean | null
          id?: string
          influencer_id?: string | null
          nome?: string | null
          service_id?: string | null
          step?: string | null
          tentativas_invalidas?: number | null
          ultimo_contato?: string | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "sdr_sessions_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sdr_sessions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          formato: Database["public"]["Enums"]["service_formato"]
          id: string
          influencer_id: string
          max_por_dia: number | null
          preco: number
          tipo: Database["public"]["Enums"]["service_tipo"]
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          formato?: Database["public"]["Enums"]["service_formato"]
          id?: string
          influencer_id: string
          max_por_dia?: number | null
          preco: number
          tipo: Database["public"]["Enums"]["service_tipo"]
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          formato?: Database["public"]["Enums"]["service_formato"]
          id?: string
          influencer_id?: string
          max_por_dia?: number | null
          preco?: number
          tipo?: Database["public"]["Enums"]["service_tipo"]
          updated_at?: string
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
          created_at: string | null
          email: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          atualizado_em: string
          criado_em: string
          email: string | null
          empresa: string | null
          id: string
          influencer_id: string | null
          mensagem: string | null
          nome: string
          origem: string | null
          status: Database["public"]["Enums"]["waitlist_status"]
          whatsapp: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          email?: string | null
          empresa?: string | null
          id?: string
          influencer_id?: string | null
          mensagem?: string | null
          nome: string
          origem?: string | null
          status?: Database["public"]["Enums"]["waitlist_status"]
          whatsapp: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          email?: string | null
          empresa?: string | null
          id?: string
          influencer_id?: string | null
          mensagem?: string | null
          nome?: string
          origem?: string | null
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
      upsert_booking_client: {
        Args: {
          p_influencer_id: string
          p_user_id: string
          p_nome: string
          p_whatsapp: string
          p_email: string
          p_empresa?: string | null
          p_status?: string
          p_origem?: string
        }
        Returns: Json
      }
      create_booking_atomic: {
        Args: {
          p_influencer_id: string
          p_client_id: string
          p_service_id: string
          p_data_agendada: string
          p_codigo_confirmacao: string
          p_descricao_produto?: string | null
          p_link_negocio?: string | null
          p_material_url?: string[] | null
          p_observacoes?: string | null
          p_status?: string
        }
        Returns: Json
      }
    }
    Enums: {
      booking_status: "pendente" | "confirmado" | "concluido" | "cancelado"
      client_origem: "cadastro_manual" | "site" | "whatsapp" | "sdr_robo"
      client_status: "ativo" | "espera" | "bloqueado"
      influencer_status: "em_analise" | "ativa" | "suspensa" | "rejeitada"
      service_formato: "online" | "presencial"
      service_tipo: "stories" | "reels" | "reels_stories" | "feed" | "presencial"
      tipo_pessoa: "pj" | "pf"
      user_role: "admin" | "influencer" | "client"
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
      booking_status: ["pendente", "confirmado", "concluido", "cancelado"],
      client_origem: ["cadastro_manual", "site", "whatsapp", "sdr_robo"],
      client_status: ["ativo", "espera", "bloqueado"],
      influencer_status: ["em_analise", "ativa", "suspensa", "rejeitada"],
      service_formato: ["online", "presencial"],
      service_tipo: ["stories", "reels", "reels_stories", "feed", "presencial"],
      tipo_pessoa: ["pj", "pf"],
      user_role: ["admin", "influencer", "client"],
      waitlist_status: ["aguardando", "contatado", "aprovado", "rejeitado"],
    },
  },
} as const
