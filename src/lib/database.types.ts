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
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
};
