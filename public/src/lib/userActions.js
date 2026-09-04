const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export async function getUser(id) {
    const res = await fetch(`${API_BASE}/api/user/${id}`);
    if (!res.ok) throw new Error('Failed to fetch user');
    const data = await res.json();
    return data;
}