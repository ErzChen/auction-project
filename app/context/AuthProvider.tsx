import { useState, useEffect, ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { User } from '../constants/types';
import { getToken, setToken as presistToken, removeToken } from '../lib/tokenStorage';

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function checkSession() {
			try {
				const storedToken = await getToken();
				if (!storedToken) {
					setUser(null);
					return;
				}
				const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/api/me`, {
					headers: { Authorization: `Bearer ${storedToken}`, 'X-Auction-Application-Key': process.env.EXPO_PUBLIC_SECRET_KEY },
				});
				if (res.ok) {
					setUser(await res.json());
					setToken(storedToken);
				} else {
					await removeToken();
					setUser(null);
				}
			} catch {
				setUser(null);
			} finally {
				setLoading(false);
			}
		}
		checkSession();
	}, []);

	async function saveSession(user: User, sessionToken: string) {
		await presistToken(sessionToken);
		setToken(sessionToken);
		setUser(user);
	}

	async function logout() {
		try {
			await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/api/logout`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}`, 'X-Auction-Application-Key': process.env.EXPO_PUBLIC_SECRET_KEY },
			});
		} finally {
			await removeToken();
			setToken(null);
			setUser(null);
		}
	}

	return (
		<AuthContext.Provider value={{ user, setUser, token, saveSession, loading, logout }}>
			{children}
		</AuthContext.Provider>
	);
}
