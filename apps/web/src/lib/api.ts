const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4102/api/v1';

export function getApiBaseUrl(): string {
  // Se estiver rodando no navegador, use a URL pública da API
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4102/api/v1';
  }
  return process.env.INTERNAL_API_URL || DEFAULT_API_URL;
}

export async function createOrUpdateListing(payload: any) {
  const url = `${getApiBaseUrl()}/listings`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Erro ao salvar anúncio: HTTP ${res.status}`);
  }

  return res.json();
}

export async function fetchAdminListings(filters?: {
  search?: string;
  categorySlug?: string;
  status?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.categorySlug && filters.categorySlug !== 'todos') {
    params.append('categorySlug', filters.categorySlug);
  }
  if (filters?.status && filters.status !== 'todos') {
    params.append('status', filters.status);
  }

  const url = `${getApiBaseUrl()}/listings/admin/all?${params.toString()}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Falha ao buscar listagem: HTTP ${res.status}`);
  }

  return res.json();
}

export async function deleteListingApi(id: string) {
  const url = `${getApiBaseUrl()}/listings/${id}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Erro ao excluir anúncio: HTTP ${res.status}`);
  }

  return res.json();
}
