const API_BASE_URL = 'http://localhost:3000/api';

interface AuthResponse {
  user: any;
  token?: string;
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    // 1-urinish: localhost:3000 orqali
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
      });
    } catch {
      // 2-urinish: 127.0.0.1:3000 orqali (DNS / IPv6 muammolarini chetlab o'tish)
      response = await fetch(`http://127.0.0.1:3000/api${path}`, {
        ...options,
        headers,
      });
    }

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/login';
      }
      throw new Error(data.error || 'Sessiya muddati tugadi. Qayta tizimga kiring.');
    }

    if (!response.ok) {
      throw new Error(data.error || `Server xatosi (${response.status})`);
    }

    return data as T;
  } catch (err: any) {
    if (err.message === 'Failed to fetch' || (err.name === 'TypeError' && err.message.includes('fetch'))) {
      throw new Error("Serverga ulanib bo'lmadi. Backend (http://localhost:3000) yoqilganini tekshiring.");
    }
    throw err;
  }
}

export async function registerUser(payload: { email: string; password: string; first_name?: string; last_name?: string; role?: string }) {
  const data = await request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data;
}

export async function loginUser(payload: { email: string; password: string }) {
  const data = await request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data;
}

export async function getMe() {
  return request<{ user: any }>('/auth/me');
}

export async function getCategories() {
  return request<any[]>('/categories');
}

export async function createCategory(payload: { name: string; slug?: string; parent_id?: number | string | null; image?: string | null }) {
  return request<any>('/categories', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      slug: payload.slug || payload.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
      parent_id: payload.parent_id || null,
      image: payload.image || null,
    }),
  });
}

export async function getSizes() {
  return request<any[]>('/sizes');
}

export async function getColors() {
  return request<any[]>('/colors');
}

export async function getProducts(params?: Record<string, any>) {
  let path = '/products';
  if (params && Object.keys(params).length > 0) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const queryString = query.toString();
    if (queryString) {
      path += `?${queryString}`;
    }
  }
  return request<any[]>(path);
}

export async function getProductById(id: number | string) {
  return request<any>(`/products/${id}`);
}

export async function createProduct(payload: {
  name: string;
  category_id?: number | string | null;
  description: string;
  price: number;
  discount?: number;
  gender?: string;
  brand?: string;
  is_active?: boolean;
  slug?: string;
}) {
  return request<any>('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(
  id: number | string,
  payload: Partial<{
    name: string;
    category_id: number | string | null;
    description: string;
    price: number;
    discount: number;
    gender: string;
    brand: string;
    is_active: boolean;
    slug: string;
  }>
) {
  return request<any>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(id: number | string) {
  return request<{ message: string }>(`/products/${id}`, {
    method: 'DELETE',
  });
}

export async function getOrders() {
  return request<any[]>('/orders');
}

export async function getUsers() {
  return request<any[]>('/users');
}

export async function updateUserStatus(id: number, is_active: boolean) {
  return request<any>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ is_active }),
  });
}

export async function getProductImages() {
  return request<any[]>('/product-images');
}

export async function createProductImage(payload: { product_id: number | string; image_url: string; is_main?: boolean }) {
  return request<any>('/product-images', {
    method: 'POST',
    body: JSON.stringify({
      product_id: payload.product_id,
      image_url: payload.image_url,
      is_main: payload.is_main ?? true,
    }),
  });
}

export async function updateProductImage(id: number | string, payload: { image_url?: string; is_main?: boolean }) {
  return request<any>(`/product-images/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function createSize(payload: { name: string }) {
  return request<any>('/sizes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createColor(payload: { name: string; hex?: string }) {
  return request<any>('/colors', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getProductVariants() {
  return request<any[]>('/product-variants');
}

export async function createProductVariant(payload: {
  product_id: number | string;
  size_id?: number | string;
  color_id?: number | string;
  stock?: number;
  sku?: string;
}) {
  return request<any>('/product-variants', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteProductVariant(id: number | string) {
  return request<any>(`/product-variants/${id}`, {
    method: 'DELETE',
  });
}

export async function deleteProductImage(id: number | string) {
  return request<{ message: string }>(`/product-images/${id}`, {
    method: 'DELETE',
  });
}