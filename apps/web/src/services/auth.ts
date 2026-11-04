import { getApiBaseUrl } from '@/lib/api';

export function setAuthCookies(accessToken: string, role: string) {
  if (typeof document !== 'undefined') {
    document.cookie = `auth_token=${encodeURIComponent(accessToken)}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `user_role=${encodeURIComponent(role)}; path=/; max-age=604800; SameSite=Lax`;
  }
}

export function clearAuthCookies() {
  if (typeof document !== 'undefined') {
    document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'user_role=; path=/; max-age=0; SameSite=Lax';
  }
}

export async function loginUser(email: string, pass: string) {
  const url = `${getApiBaseUrl()}/auth/login`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password: pass }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Falha ao realizar login.');
  }

  if (data.accessToken && data.user?.role) {
    setAuthCookies(data.accessToken, data.user.role);
  }

  return data;
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'USER' | 'MERCHANT';
  companyName?: string;
  cnpj?: string;
}) {
  const url = `${getApiBaseUrl()}/auth/register`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Falha ao criar conta.');
  }
  return data;
}
