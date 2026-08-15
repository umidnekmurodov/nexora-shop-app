export interface ProductSize {
  id: number | string;
  name: string;
}

export interface ProductColor {
  id: number | string;
  name: string;
  hex: string;
}

export interface Category {
  id: number | string;
  name: string;
  slug: string;
  parent_id?: number | string;
  image?: string;
}

export interface productsType {
  id: number;
  name: string;
  slug?: string;
  description: string;
  price: number;
  discount: number;
  gender: string;
  brand: string;
  category_id?: number;
  category_name?: string;
  category_slug?: string;
  is_active?: boolean;
  main_image?: string;
  images?: string[];
  sizes?: ProductSize[];
  colors?: ProductColor[];
  created_at?: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'superadmin' | string;
  is_active: boolean;
}