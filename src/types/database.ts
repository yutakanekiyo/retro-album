export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_url?: string | null
          created_at?: string
        }
      }
      albums: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          bgm_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          bgm_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          bgm_url?: string | null
          created_at?: string
        }
      }
      album_items: {
        Row: {
          id: string
          album_id: string
          type: 'photo' | 'video'
          file_url: string
          thumbnail_url: string | null
          caption: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          album_id: string
          type: 'photo' | 'video'
          file_url: string
          thumbnail_url?: string | null
          caption?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          album_id?: string
          type?: 'photo' | 'video'
          file_url?: string
          thumbnail_url?: string | null
          caption?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          album_id: string
          author_name: string
          content: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          album_id: string
          author_name: string
          content: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          album_id?: string
          author_name?: string
          content?: string
          sort_order?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
