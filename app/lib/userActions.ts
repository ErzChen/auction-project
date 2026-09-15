export async function getUser(id: Number) {
	const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/api/user/${id}`);
	if (!res.ok) throw new Error('Failed to fetch user');
	const data = await res.json();
	return data;
}
