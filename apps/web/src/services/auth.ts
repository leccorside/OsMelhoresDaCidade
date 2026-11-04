const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1';

export async function loginUser(email: string, pass: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Falha ao realizar login.');
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
  const res = await fetch(`${API_URL}/auth/register`, {
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

