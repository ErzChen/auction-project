import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext.js';

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
        async function checkSession() {
            try {
                const res = await fetch(`${CONFIG.API_BASE}/api/me`, { credentials: 'include' });
                setUser(res.ok ? await res.json() : null);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        checkSession(); 
    }, []);

	async function logout() {
		await fetch(`${CONFIG.API_BASE}/api/logout`, { method: 'POST', credentials: 'include' });
		setUser(null);
	}

	return (
		<AuthContext.Provider value={{ user, setUser, loading, logout }}>
			{children}
		</AuthContext.Provider>
	);
}