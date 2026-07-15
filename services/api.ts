// services/api.ts

export const API_URL = 'https://khaki-mule-800143.hostingersite.com';

export const api = {
  // ============ AUTH ============
  auth: {
    login: (data: { email: string; password: string }) =>
      fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),

    register: (data: any) =>
      fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  },

  // ============ PRODUCTS ============
  products: {
    getAll: () => fetch(`${API_URL}/api/products`),

    getOne: (id: string | number) => {
      console.log('📦 Fetching product with ID:', id);
      return fetch(`${API_URL}/api/products/${id}`);
    },

    create: (data: any, token: string) =>
      fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),

    update: (id: string | number, data: any, token: string) => {
      console.log('📤 Updating product:', id, data);
      return fetch(`${API_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
    },

    delete: (id: string | number, token: string) =>
      fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }),
  },

  // ============ CATEGORIES ============
  categories: {
    getAll: (token?: string) => {
      const headers: HeadersInit = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      return fetch(`${API_URL}/api/categories`, { headers });
    },
    getOne: (id: string, token: string) =>
      fetch(`${API_URL}/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    create: (data: any, token: string) =>
      fetch(`${API_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any, token: string) =>
      fetch(`${API_URL}/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
    delete: (id: string, token: string) =>
      fetch(`${API_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }),
  },

  // ============ ORDERS ============
  orders: {
    getAll: (token: string) =>
      fetch(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    getOne: (id: string, token: string) =>
      fetch(`${API_URL}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    create: (data: any, token: string) =>
      fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: string, token: string) =>
      fetch(`${API_URL}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }),
    track: (code: string, email?: string) =>
      fetch(`${API_URL}/api/orders/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderCode: code, email }),
      }),
  },

  // ============ BANNERS ============
  banners: {
    getAll: () => fetch(`${API_URL}/api/banners`),
    getAllAdmin: (token: string) =>
      fetch(`${API_URL}/api/banners/all`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    getOne: (id: string, token: string) =>
      fetch(`${API_URL}/api/banners/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    create: (data: any, token: string) =>
      fetch(`${API_URL}/api/banners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any, token: string) =>
      fetch(`${API_URL}/api/banners/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
    delete: (id: string, token: string) =>
      fetch(`${API_URL}/api/banners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }),
  },

  // ============ USERS ============
  users: {
    getAll: (token: string) =>
      fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    update: (id: string, data: any, token: string) =>
      fetch(`${API_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
    delete: (id: string, token: string) =>
      fetch(`${API_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }),
  },

  // ============ SETTINGS ============
  settings: {
    get: () => fetch(`${API_URL}/api/settings`),
    update: (data: any, token: string) =>
      fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
  },

  // ============ LOCATIONS ============
  locations: {
    getProvinces: () => fetch(`${API_URL}/api/locations/provinces`),
    getDistricts: (provinceId: string) =>
      fetch(`${API_URL}/api/locations/districts/${provinceId}`),
  },

  // ============ INVENTORY ============
  inventory: {
    getAll: (token: string) =>
      fetch(`${API_URL}/api/products/inventory/all`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    update: (productId: string, data: any, token: string) =>
      fetch(`${API_URL}/api/products/inventory/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
  },
};