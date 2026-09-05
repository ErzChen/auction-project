export async function getUser(id) {
    const res = await fetch(`${CONFIG.API_BASE}/api/user/${id}`);
    if (!res.ok) throw new Error('Failed to fetch user');
    const data = await res.json();
    return data;
}