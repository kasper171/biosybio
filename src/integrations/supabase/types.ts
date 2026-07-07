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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          accent_color: string
          avatar_url: string | null
          background_color: string
          background_url: string | null
          background_blur: number
          background_brightness: number
          banner_url: string | null
          bio: string
          card_blur: number
          card_border_color: string
          card_border_radius: number
          card_border_style: string
          card_border_width: number
          card_color: string
          card_height: number
          card_opacity: number
          card_width: number
          created_at: string
          display_name: string
          discord_card_mode: string
          discord_user_id: string | null
          discord_show_badges: boolean
          discord_inside_scale: number
          effect_glow: boolean
          effect_hover: boolean
          effect_tilt: boolean
          id: string
          public_uid: number | null
          inner_banner_url: string | null
          social_original_colors: boolean
          social_icon_style: string
          show_social_titles: boolean
          socials: Json
          show_view_count: boolean
          show_username: boolean
          show_public_uid: boolean
          tap_to_reveal_enabled: boolean
          tap_reveal_blur: number
          tap_reveal_brightness: number
          tap_reveal_mode: string
          tap_reveal_text: string
          card_reveal_effect: string
          text_typing_effect: boolean
          text_typing_name_effect: boolean
          text_typing_bio_effect: boolean
          comments_enabled: boolean
          music_url: string | null
          music_title: string | null
          music_start_sec: number
          music_end_sec: number | null
          music_card_enabled: boolean
          music_card_art_url: string | null
          music_card_title: string | null
          music_card_subtitle: string | null
          music_card_width_pct: number
          share_embed_title: string | null
          share_embed_description: string | null
          share_embed_image_url: string | null
          updated_at: string
          username: string
          view_count: number
        }
        Insert: {
          accent_color?: string
          avatar_url?: string | null
          background_color?: string
          background_url?: string | null
          background_blur?: number
          background_brightness?: number
          banner_url?: string | null
          bio?: string
          card_blur?: number
          card_border_color?: string
          card_border_radius?: number
          card_border_style?: string
          card_border_width?: number
          card_color?: string
          card_height?: number
          card_opacity?: number
          card_width?: number
          created_at?: string
          display_name?: string
          discord_card_mode?: string
          discord_user_id?: string | null
          discord_show_badges?: boolean
          discord_inside_scale?: number
          effect_glow?: boolean
          effect_hover?: boolean
          effect_tilt?: boolean
          id: string
          public_uid?: number | null
          inner_banner_url?: string | null
          social_original_colors?: boolean
          social_icon_style?: string
          show_social_titles?: boolean
          socials?: Json
          show_view_count?: boolean
          show_username?: boolean
          show_public_uid?: boolean
          tap_to_reveal_enabled?: boolean
          tap_reveal_blur?: number
          tap_reveal_brightness?: number
          tap_reveal_mode?: string
          tap_reveal_text?: string
          card_reveal_effect?: string
          text_typing_effect?: boolean
          text_typing_name_effect?: boolean
          text_typing_bio_effect?: boolean
          comments_enabled?: boolean
          music_url?: string | null
          music_title?: string | null
          music_start_sec?: number
          music_end_sec?: number | null
          music_card_enabled?: boolean
          music_card_art_url?: string | null
          music_card_title?: string | null
          music_card_subtitle?: string | null
          music_card_width_pct?: number
          share_embed_title?: string | null
          share_embed_description?: string | null
          share_embed_image_url?: string | null
          updated_at?: string
          username: string
          view_count?: number
        }
        Update: {
          accent_color?: string
          avatar_url?: string | null
          background_color?: string
          background_url?: string | null
          background_blur?: number
          background_brightness?: number
          banner_url?: string | null
          bio?: string
          card_blur?: number
          card_border_color?: string
          card_border_radius?: number
          card_border_style?: string
          card_border_width?: number
          card_color?: string
          card_height?: number
          card_opacity?: number
          card_width?: number
          created_at?: string
          display_name?: string
          discord_card_mode?: string
          discord_user_id?: string | null
          discord_show_badges?: boolean
          discord_inside_scale?: number
          effect_glow?: boolean
          effect_hover?: boolean
          effect_tilt?: boolean
          id?: string
          public_uid?: number | null
          inner_banner_url?: string | null
          social_original_colors?: boolean
          social_icon_style?: string
          show_social_titles?: boolean
          socials?: Json
          show_view_count?: boolean
          show_username?: boolean
          show_public_uid?: boolean
          tap_to_reveal_enabled?: boolean
          tap_reveal_blur?: number
          tap_reveal_brightness?: number
          tap_reveal_mode?: string
          tap_reveal_text?: string
          card_reveal_effect?: string
          text_typing_effect?: boolean
          text_typing_name_effect?: boolean
          text_typing_bio_effect?: boolean
          comments_enabled?: boolean
          music_url?: string | null
          music_title?: string | null
          music_start_sec?: number
          music_end_sec?: number | null
          music_card_enabled?: boolean
          music_card_art_url?: string | null
          music_card_title?: string | null
          music_card_subtitle?: string | null
          music_card_width_pct?: number
          share_embed_title?: string | null
          share_embed_description?: string | null
          share_embed_image_url?: string | null
          updated_at?: string
          username?: string
          view_count?: number
        }
        Relationships: []
      }
      profile_view_events: {
        Row: {
          id: number
          profile_id: string
          viewed_at: string
        }
        Insert: {
          id?: never
          profile_id: string
          viewed_at?: string
        }
        Update: {
          id?: never
          profile_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_view_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_comments: {
        Row: {
          id: number
          profile_id: string
          author_id: string
          author_name: string
          author_avatar_url: string | null
          content: string
          is_visible: boolean
          created_at: string
        }
        Insert: {
          id?: never
          profile_id: string
          author_id: string
          author_name: string
          author_avatar_url?: string | null
          content: string
          is_visible?: boolean
          created_at?: string
        }
        Update: {
          id?: never
          profile_id?: string
          author_id?: string
          author_name?: string
          author_avatar_url?: string | null
          content?: string
          is_visible?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_comments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_profile_view: {
        Args: { target_profile_id: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
