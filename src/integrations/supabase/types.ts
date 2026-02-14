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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          record_id: string | null
          table_name: string
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          record_id?: string | null
          table_name: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          record_id?: string | null
          table_name?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      diversifikasi_rm: {
        Row: {
          alokasi: string | null
          created_at: string
          created_by: string | null
          id: string
          jenis_scale_up: string | null
          jenis_stabtest: string | null
          kesimpulan: string | null
          kimia: string | null
          kode_item: string | null
          kondisi_penyimpanan_stabtest: string | null
          link_hasil_analisa: string | null
          link_report: string | null
          manufacture: string | null
          mikrobiologi: string | null
          nama_material: string | null
          no_batch_material: string | null
          no_batch_scale_up: string | null
          sensori_material: string | null
          sensori_produk: string | null
          status_scale_up: string | null
          tes_fisik: string | null
          tes_kimia: string | null
          tes_mikrobiologi: string | null
          tes_sensori: string | null
          tgl_analisa_andev: string | null
          tgl_dilakukan_scale_up: string | null
          tgl_jatuh_tempo: string | null
          tgl_kirim_cpro: string | null
          tgl_kirim_sampel_ke_qc: string | null
          tgl_masuk_stabtest: string | null
          tgl_report: string | null
          tgl_selesai_stabtest: string | null
          tgl_terima_di_ts: string | null
          tgl_terima_sampel_scale_up: string | null
          updated_at: string
          usia_penyimpanan: string | null
        }
        Insert: {
          alokasi?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          jenis_scale_up?: string | null
          jenis_stabtest?: string | null
          kesimpulan?: string | null
          kimia?: string | null
          kode_item?: string | null
          kondisi_penyimpanan_stabtest?: string | null
          link_hasil_analisa?: string | null
          link_report?: string | null
          manufacture?: string | null
          mikrobiologi?: string | null
          nama_material?: string | null
          no_batch_material?: string | null
          no_batch_scale_up?: string | null
          sensori_material?: string | null
          sensori_produk?: string | null
          status_scale_up?: string | null
          tes_fisik?: string | null
          tes_kimia?: string | null
          tes_mikrobiologi?: string | null
          tes_sensori?: string | null
          tgl_analisa_andev?: string | null
          tgl_dilakukan_scale_up?: string | null
          tgl_jatuh_tempo?: string | null
          tgl_kirim_cpro?: string | null
          tgl_kirim_sampel_ke_qc?: string | null
          tgl_masuk_stabtest?: string | null
          tgl_report?: string | null
          tgl_selesai_stabtest?: string | null
          tgl_terima_di_ts?: string | null
          tgl_terima_sampel_scale_up?: string | null
          updated_at?: string
          usia_penyimpanan?: string | null
        }
        Update: {
          alokasi?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          jenis_scale_up?: string | null
          jenis_stabtest?: string | null
          kesimpulan?: string | null
          kimia?: string | null
          kode_item?: string | null
          kondisi_penyimpanan_stabtest?: string | null
          link_hasil_analisa?: string | null
          link_report?: string | null
          manufacture?: string | null
          mikrobiologi?: string | null
          nama_material?: string | null
          no_batch_material?: string | null
          no_batch_scale_up?: string | null
          sensori_material?: string | null
          sensori_produk?: string | null
          status_scale_up?: string | null
          tes_fisik?: string | null
          tes_kimia?: string | null
          tes_mikrobiologi?: string | null
          tes_sensori?: string | null
          tgl_analisa_andev?: string | null
          tgl_dilakukan_scale_up?: string | null
          tgl_jatuh_tempo?: string | null
          tgl_kirim_cpro?: string | null
          tgl_kirim_sampel_ke_qc?: string | null
          tgl_masuk_stabtest?: string | null
          tgl_report?: string | null
          tgl_selesai_stabtest?: string | null
          tgl_terima_di_ts?: string | null
          tgl_terima_sampel_scale_up?: string | null
          updated_at?: string
          usia_penyimpanan?: string | null
        }
        Relationships: []
      }
      metrics: {
        Row: {
          created_at: string
          id: string
          metric_type: string
          metric_value: number
          product_id: string | null
          recorded_at: string
          region_id: string | null
          supplier_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metric_type: string
          metric_value: number
          product_id?: string | null
          recorded_at?: string
          region_id?: string | null
          supplier_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metric_type?: string
          metric_value?: number
          product_id?: string | null
          recorded_at?: string
          region_id?: string | null
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metrics_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metrics_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          source_id: string | null
          source_table: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          source_id?: string | null
          source_table?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          source_id?: string | null
          source_table?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          region_id: string | null
          sku: string | null
          status: string | null
          stock_quantity: number | null
          supplier_id: string | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          region_id?: string | null
          sku?: string | null
          status?: string | null
          stock_quantity?: number | null
          supplier_id?: string | null
          unit_price?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          region_id?: string | null
          sku?: string | null
          status?: string | null
          stock_quantity?: number | null
          supplier_id?: string | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          division: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          division?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          division?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          code: string
          country: string | null
          created_at: string
          id: string
          name: string
          population: number | null
        }
        Insert: {
          code: string
          country?: string | null
          created_at?: string
          id?: string
          name: string
          population?: number | null
        }
        Update: {
          code?: string
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          population?: number | null
        }
        Relationships: []
      }
      sample_qc: {
        Row: {
          batch: string | null
          created_at: string
          created_by: string | null
          hasil_analisa: string | null
          id: string
          identitas_ma: string | null
          jenis_pengujian: string | null
          kode_produk: string | null
          kondisi_penyimpanan: string | null
          leadtime_analisa: string | null
          ma_oracle: string | null
          nama_produk: string | null
          no_ppoj: string | null
          oos: string | null
          pic: string | null
          revisi: string | null
          status: string | null
          tgl_jatuh_tempo: string | null
          tgl_kirim: string | null
          tgl_selesai_analisa: string | null
          updated_at: string
          usia_sampel_angka: number | null
          usia_sampel_dmy: string | null
        }
        Insert: {
          batch?: string | null
          created_at?: string
          created_by?: string | null
          hasil_analisa?: string | null
          id?: string
          identitas_ma?: string | null
          jenis_pengujian?: string | null
          kode_produk?: string | null
          kondisi_penyimpanan?: string | null
          leadtime_analisa?: string | null
          ma_oracle?: string | null
          nama_produk?: string | null
          no_ppoj?: string | null
          oos?: string | null
          pic?: string | null
          revisi?: string | null
          status?: string | null
          tgl_jatuh_tempo?: string | null
          tgl_kirim?: string | null
          tgl_selesai_analisa?: string | null
          updated_at?: string
          usia_sampel_angka?: number | null
          usia_sampel_dmy?: string | null
        }
        Update: {
          batch?: string | null
          created_at?: string
          created_by?: string | null
          hasil_analisa?: string | null
          id?: string
          identitas_ma?: string | null
          jenis_pengujian?: string | null
          kode_produk?: string | null
          kondisi_penyimpanan?: string | null
          leadtime_analisa?: string | null
          ma_oracle?: string | null
          nama_produk?: string | null
          no_ppoj?: string | null
          oos?: string | null
          pic?: string | null
          revisi?: string | null
          status?: string | null
          tgl_jatuh_tempo?: string | null
          tgl_kirim?: string | null
          tgl_selesai_analisa?: string | null
          updated_at?: string
          usia_sampel_angka?: number | null
          usia_sampel_dmy?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          category: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          id: string
          name: string
          status: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          category?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
      app_role: "admin" | "user" | "cpro" | "qc" | "ts"
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
      app_role: ["admin", "user", "cpro", "qc", "ts"],
    },
  },
} as const
