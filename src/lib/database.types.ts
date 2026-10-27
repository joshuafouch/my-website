export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          date: string;
          categories: string[];
          image: string | null;
          body: string;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description: string;
          date?: string;
          categories?: string[];
          image?: string | null;
          body: string;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string;
          date?: string;
          categories?: string[];
          image?: string | null;
          body?: string;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          details: string;
          date: string;
          image: string;
          source_url: string | null;
          tags: string[];
          images: string[];
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string;
          details?: string;
          date: string;
          image?: string;
          source_url?: string | null;
          tags?: string[];
          images?: string[];
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string;
          details?: string;
          date?: string;
          image?: string;
          source_url?: string | null;
          tags?: string[];
          images?: string[];
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      about_professional: {
        Row: {
          id: number;
          intro: string;
          work_intro: string;
          tech_intro: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          intro?: string;
          work_intro?: string;
          tech_intro?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          intro?: string;
          work_intro?: string;
          tech_intro?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      portraits: {
        Row: {
          id: string;
          src: string;
          alt: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          src: string;
          alt?: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          src?: string;
          alt?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      work_experiences: {
        Row: {
          id: string;
          role: string;
          time_span: string;
          body: string;
          skills: string[];
          orgs: Json;
          sort_order: number;
        };
        Insert: {
          id?: string;
          role: string;
          time_span?: string;
          body?: string;
          skills?: string[];
          orgs?: Json;
          sort_order?: number;
        };
        Update: {
          id?: string;
          role?: string;
          time_span?: string;
          body?: string;
          skills?: string[];
          orgs?: Json;
          sort_order?: number;
        };
        Relationships: [];
      };
      tech_groups: {
        Row: {
          id: string;
          title: string;
          items: Json;
          sort_order: number;
        };
        Insert: {
          id?: string;
          title: string;
          items?: Json;
          sort_order?: number;
        };
        Update: {
          id?: string;
          title?: string;
          items?: Json;
          sort_order?: number;
        };
        Relationships: [];
      };
      about_personal: {
        Row: {
          id: number;
          intro: string;
          youtube_url: string | null;
          updated_at: string;
        };
        Insert: {
          id?: number;
          intro?: string;
          youtube_url?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          intro?: string;
          youtube_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      music_images: {
        Row: {
          id: string;
          path: string;
          alt: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          path: string;
          alt?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          path?: string;
          alt?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      music_artists: {
        Row: {
          id: string;
          name: string;
          note: string;
          url: string | null;
          image_id: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          note?: string;
          url?: string | null;
          image_id?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          name?: string;
          note?: string;
          url?: string | null;
          image_id?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      music_albums: {
        Row: {
          id: string;
          title: string;
          artist_name: string;
          note: string;
          url: string | null;
          image_id: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          title: string;
          artist_name?: string;
          note?: string;
          url?: string | null;
          image_id?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          title?: string;
          artist_name?: string;
          note?: string;
          url?: string | null;
          image_id?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      music_songs: {
        Row: {
          id: string;
          title: string;
          artist_name: string;
          album_name: string;
          note: string;
          url: string | null;
          image_id: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          title: string;
          artist_name?: string;
          album_name?: string;
          note?: string;
          url?: string | null;
          image_id?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          title?: string;
          artist_name?: string;
          album_name?: string;
          note?: string;
          url?: string | null;
          image_id?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      resume: {
        Row: {
          id: number;
          path: string | null;
          filename: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          path?: string | null;
          filename?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          path?: string | null;
          filename?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
