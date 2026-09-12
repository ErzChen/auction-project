import { NavigationContainer } from '@react-navigation/native'; // 1. Import this
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthPage from './pages/AuthPage';
import MainPage from './pages/MainPage';
import { useAuthContext } from './context/AuthContext';
import { AuthProvider } from './context/AuthProvider';

const Stack = createNativeStackNavigator();

function RootNavigation() {
	const { user } = useAuthContext(); 

	return (
		<Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
			{user ? (
				<Stack.Screen name="MainPage" component={MainPage} />
			) : (
				<Stack.Screen name="AuthPage" component={AuthPage} />
			)}
		</Stack.Navigator>
	);
}

export default function App() {
	return (
		<AuthProvider>
			<NavigationContainer>
				<RootNavigation />
			</NavigationContainer>
		</AuthProvider>
	);
}
