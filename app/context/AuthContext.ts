import { createContext, useContext } from 'react';
import { AuthContextType } from '../constants/types';

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuthContext(): AuthContextType {
	const context = useContext(AuthContext);
	
	if (!context) {
		throw new Error('useAuthContext must be used within an AuthProvider');
	}
	
	return context;
}
