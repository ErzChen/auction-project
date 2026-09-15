import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'session_token';

export async function getToken() {
	if (Platform.OS === 'web') {
		return localStorage.getItem(TOKEN_KEY);
	}
	return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(sessionToken: string) {
	if (Platform.OS === 'web') {
		localStorage.setItem(TOKEN_KEY, sessionToken);
		return;
	}
	return SecureStore.setItemAsync(TOKEN_KEY, sessionToken);
}

export async function removeToken() {
	if (Platform.OS === 'web') {
		localStorage.removeItem(TOKEN_KEY);
		return;
	}
	return SecureStore.deleteItemAsync(TOKEN_KEY);
}
