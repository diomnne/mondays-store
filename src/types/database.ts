/**
 * Shape of the Supabase `public` schema, in the format supabase-js expects for
 * typed queries. Written by hand to match supabase/migrations; if the schema
 * changes, update this file (or regenerate it with `supabase gen types`).
 */

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "completed"
  | "cancelled";

export type PaymentMethod = "cash_on_delivery" | "e_wallet" | "bank_transfer";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          name?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          description: string;
          image_url: string;
          price_cents: number;
          stock: number;
          is_active: boolean;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          slug: string;
          description?: string; // defaults to ''
          image_url: string;
          price_cents: number;
          stock: number;
          is_active?: boolean;
          is_featured?: boolean;
        };
        Update: {
          category_id?: string;
          name?: string;
          slug?: string;
          description?: string;
          image_url?: string;
          price_cents?: number;
          stock?: number;
          is_active?: boolean;
          is_featured?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_name: string;
          customer_email: string;
          contact_number: string;
          delivery_address: string;
          payment_method: PaymentMethod;
          notes: string | null;
          status: OrderStatus;
          total_cents: number;
          stock_restored_at: string | null;
          created_at: string;
          updated_at: string;
        };
        // Orders are only created through the place_order RPC.
        Insert: never;
        Update: never;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name: string;
          unit_price_cents: number;
          quantity: number;
          line_total_cents: number;
        };
        // Order items are only created through the place_order RPC.
        Insert: never;
        Update: never;
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      dashboard_stats: {
        Row: {
          total_products: number;
          total_orders: number;
          pending_orders: number;
          completed_orders: number;
          total_customers: number;
          total_sales_cents: number;
        };
        Relationships: [];
      };
      customer_summary: {
        Row: {
          email: string;
          name: string;
          contact_number: string;
          order_count: number;
          completed_total_cents: number;
        };
        Relationships: [];
      };
    };
    // Both RPCs accept plain text for payment method and status and validate it
    // themselves. The unions here are deliberately narrower so app code can only
    // send values the database accepts.
    Functions: {
      place_order: {
        Args: {
          p_customer_name: string;
          p_customer_email: string;
          p_contact_number: string;
          p_delivery_address: string;
          p_payment_method: PaymentMethod;
          p_notes: string | null;
          p_items: Json;
        };
        Returns: Json;
      };
      update_order_status: {
        Args: {
          p_order_id: string;
          p_new_status: OrderStatus;
        };
        Returns: Json;
      };
    };
    Enums: {
      order_status: OrderStatus;
      payment_method: PaymentMethod;
    };
    CompositeTypes: Record<string, never>;
  };
};
