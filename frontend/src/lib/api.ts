const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL;

function cleanApiUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  // Extract URL starting with http:// or https://, ignoring brackets, parentheses, or trailing symbols
  const match = url.match(/(https?:\/\/[^\s\)\]\>]+)/);
  return match ? match[1] : url;
}

const cleanedUrl = cleanApiUrl(configuredApiUrl);
const rawBaseUrl = (cleanedUrl || 'http://localhost:8000/api').replace(/\/$/, '');
export const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;
export const API_ORIGIN = API_BASE_URL.endsWith('/api')
  ? API_BASE_URL.slice(0, -4)
  : API_BASE_URL;

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

export function cleanName(name: string | undefined | null): string {
  if (!name) return '';
  return name.split(' (')[0].trim();
}

