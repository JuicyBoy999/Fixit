const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const adminUrl = (path) => `${API_ROOT}${path}`;

export async function adminFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const response = await fetch(adminUrl(path), {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if ([401, 403, 440].includes(response.status)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.assign('/admin-login');
    throw new Error('Your admin session has ended. Please sign in again.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || 'Request failed');
  return data;
}

export async function downloadAdminCsv(path, fallbackName) {
  const token = localStorage.getItem('token');
  const response = await fetch(adminUrl(path), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    if ([401, 403, 440].includes(response.status)) window.location.assign('/admin-login');
    throw new Error('CSV export failed');
  }

  const blob = await response.blob();
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const disposition = response.headers.get('content-disposition') || '';
  const match = disposition.match(/filename="?([^";]+)"?/i);
  link.href = href;
  link.download = match?.[1] || fallbackName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}
