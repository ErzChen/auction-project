import { createContext, useContext } from 'react';
import { AuthContextType } from '../constants/types';

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
	return useContext(AuthContext);
}
