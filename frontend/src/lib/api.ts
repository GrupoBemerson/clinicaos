export const baseURL = String(import.meta.env.VITE_API_URL)
export const apiFetch = (input: string, init?: RequestInit) => {
  const normalizedBase = baseURL.replace(/\/+$/, '')
  return fetch(`${normalizedBase}${input}`, init)
}
