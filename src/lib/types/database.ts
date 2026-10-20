export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type CollectionStatus = "draft" | "published";
export type ProductStatus = "draft" | "published";
export type PriceType = "fixed" | "starting_from" | "on_request";
export type ProductAvailability = "available" | "sold" | "made_to_order";

export interface CollectionRow {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image_url: string | null;
  sort_order: number;
  status: CollectionStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CollectionInsert {
  id?: string;
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  image_url?: string | null;
  sort_order?: number;
  status?: CollectionStatus;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface CollectionUpdate {
  id?: string;
  slug?: string;
  name?: string;
  tagline?: string;
  description?: string;
  image_url?: string | null;
  sort_order?: number;
  status?: CollectionStatus;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ProductRow {
  id: string;
  collection_id: string;
  name: string;
  description: string;
  price_cents: number;
  price_type: PriceType;
  discount_percent?: number;
  rating: number;
  review_count: number;
  badge: string | null;
  is_featured: boolean;
  sort_order: number;
  status: ProductStatus;
  availability: ProductAvailability;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProductInsert {
  id?: string;
  collection_id: string;
  name: string;
  description?: string;
  price_cents: number;
  price_type?: PriceType;
  discount_percent?: number;
  rating?: number;
  review_count?: number;
  badge?: string | null;
  is_featured?: boolean;
  sort_order?: number;
  status?: ProductStatus;
  availability?: ProductAvailability;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ProductUpdate {
  id?: string;
  collection_id?: string;
  name?: string;
  description?: string;
  price_cents?: number;
  price_type?: PriceType;
  discount_percent?: number;
  rating?: number;
  review_count?: number;
  badge?: string | null;
  is_featured?: boolean;
  sort_order?: number;
  status?: ProductStatus;
  availability?: ProductAvailability;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ProductImageRow {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductImageInsert {
  id?: string;
  product_id: string;
  image_url: string;
  sort_order?: number;
  is_primary?: boolean;
  created_at?: string;
}

export interface ProductImageUpdate {
  id?: string;
  product_id?: string;
  image_url?: string;
  sort_order?: number;
  is_primary?: boolean;
  created_at?: string;
}

export interface SiteSettingsRow {
  key: string;
  value: Json;
  updated_at: string;
}

export interface SiteSettingsInsert {
  key: string;
  value: Json;
  updated_at?: string;
}

export interface SiteSettingsUpdate {
  key?: string;
  value?: Json;
  updated_at?: string;
}

export interface AuditLogRow {
  id: string;
  admin_id: string | null;
  admin_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_data: Json | null;
  new_data: Json | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditLogInsert {
  id?: string;
  admin_id?: string | null;
  admin_email?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  old_data?: Json | null;
  new_data?: Json | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at?: string;
}

export interface AuditLogUpdate {
  id?: string;
  admin_id?: string | null;
  admin_email?: string | null;
  action?: string;
  entity_type?: string;
  entity_id?: string | null;
  old_data?: Json | null;
  new_data?: Json | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at?: string;
}

export type Database = {
  public: {
    Tables: {
      collections: {
        Row: CollectionRow;
        Insert: CollectionInsert;
        Update: CollectionUpdate;
        Relationships: any[];
      };
      products: {
        Row: ProductRow;
        Insert: ProductInsert;
        Update: ProductUpdate;
        Relationships: [
          {
            foreignKeyName: "products_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: ProductImageRow;
        Insert: ProductImageInsert;
        Update: ProductImageUpdate;
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: SiteSettingsRow;
        Insert: SiteSettingsInsert;
        Update: SiteSettingsUpdate;
        Relationships: any[];
      };
      audit_log: {
        Row: AuditLogRow;
        Insert: AuditLogInsert;
        Update: AuditLogUpdate;
        Relationships: any[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      collection_status: CollectionStatus;
      product_status: ProductStatus;
      price_type: PriceType;
      product_availability: ProductAvailability;
    };
    CompositeTypes: Record<string, never>;
  };
};
