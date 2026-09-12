import { useRef, useState, useEffect } from 'react';
import { Animated, Pressable, TextInput, View } from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import { AppTextInput } from './AppTextInput';
import { AppText } from './AppText';
import { FontAwesome6, FontAwesome } from '@expo/vector-icons';
import { authFormStyles as styles } from '../styles/authForm';
import { sharedStyles } from '../styles/shared';
import { LayoutChangeEvent } from 'react-native';
import { User } from '../constants/types';

export function AuthForm({
	onForgotPassword,
}: {
	onForgotPassword: () => void;
}) {
	function resetFields() {
		setUsername('');
		setEmail('');
		setPassword('');
		setConfirmPassword('');
		setError(null);
	}

	function switchTo(signIn: boolean) {
		setUsingSignIn(signIn);
		resetFields();
		setForgotHovered(false);
		setSubmitHovered(false);
	}

	function onAuthSuccess(user: User, token: string) {
		saveSession(user, token);
	}

	async function handleSignIn() {
		if (!username || !password) {
			setError('Please fill in all fields');
			return;
		}

		setSubmitting(true);
		setError(null);
		try {
			const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/api/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auction-Application-Key': process.env.EXPO_PUBLIC_SECRET_KEY,
				},
				body: JSON.stringify({ username, password }),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.message || 'Something went wrong');
				return;
			}
			const { token, user } = await res.json();
			onAuthSuccess(user, token);
		} catch {
			setError('Something went wrong');
		} finally {
			setSubmitting(false);
		}
	}

	async function handleRegister() {
		if (password !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		if (!username || !email || !password) {
			setError('Please fill in all fields');
			return;
		}

		setSubmitting(true);
		setError(null);
		try {
			const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/api/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auction-Application-Key': process.env.EXPO_PUBLIC_SECRET_KEY,
				},
				body: JSON.stringify({ username, email, password }),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.message || 'Something went wrong');
				return;
			}
			const { token, user } = await res.json();
			onAuthSuccess(user, token);
		} catch {
			setError('Something went wrong');
		} finally {
			setSubmitting(false);
		}
	}

	const [usingSignIn, setUsingSignIn] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [hoveredTab, setHoveredTab] = useState<'signin' | 'register' | null>(
		null,
	);
	const [forgotHovered, setForgotHovered] = useState(false);
	const [submitHovered, setSubmitHovered] = useState(false);
	const [focusedField, setFocusedField] = useState<string | null>(null);
	const usernameRef = useRef<TextInput>(null);
	const emailRef = useRef<TextInput>(null);
	const passwordRef = useRef<TextInput>(null);
	const confirmPasswordRef = useRef<TextInput>(null);
	const tabWidthRef = useRef(0);
	const indicatorX = useRef(new Animated.Value(0)).current;

	const handleTabsLayout = (e: LayoutChangeEvent) =>
		(tabWidthRef.current = e.nativeEvent.layout.width / 2);
	const { saveSession } = useAuthContext();

	useEffect(() => {
		Animated.timing(indicatorX, {
			toValue: usingSignIn ? 0 : tabWidthRef.current,
			duration: 220,
			useNativeDriver: true,
		}).start();
	}, [usingSignIn]);

	return (
		<View style={styles.panel}>
			<View style={styles.card}>
				<View style={styles.tabs} onLayout={handleTabsLayout}>
					<Pressable
						style={styles.tab}
						onPress={() => switchTo(true)}
						onHoverIn={() => setHoveredTab('signin')}
						onHoverOut={() => setHoveredTab(null)}
					>
						<AppText
							bold
							style={[
								styles.tabText,
								!usingSignIn && hoveredTab === 'signin' && styles.tabTextHover,
								usingSignIn && styles.tabTextActive,
							]}
						>
							Sign in
						</AppText>
					</Pressable>
					<Pressable
						style={styles.tab}
						onPress={() => switchTo(false)}
						onHoverIn={() => setHoveredTab('register')}
						onHoverOut={() => setHoveredTab(null)}
					>
						<AppText
							bold
							style={[
								styles.tabText,
								usingSignIn && hoveredTab === 'register' && styles.tabTextHover,
								!usingSignIn && styles.tabTextActive,
							]}
						>
							Register
						</AppText>
					</Pressable>
					<Animated.View
						style={[styles.tabIndicator, { transform: [{ translateX: indicatorX }] }]}
					/>
				</View>

				{usingSignIn ? (
					<View style={styles.form}>
						<AppText bold style={styles.formHeading}>
							Welcome back
						</AppText>
						<AppText style={styles.formSubtext}>Sign in to place your bids.</AppText>

						<View style={sharedStyles.field}>
							<AppText bold style={sharedStyles.fieldLabel}>
								Username
							</AppText>
							<Pressable
								style={[
									sharedStyles.inputWrap,
									focusedField === 'username' && sharedStyles.inputWrapFocused,
								]}
								onPress={() => usernameRef.current?.focus()}
							>
								<FontAwesome6 name="user-large" style={sharedStyles.inputIcon} />
								<AppTextInput
									ref={usernameRef}
									style={sharedStyles.inputControl}
									value={username}
									onChangeText={setUsername}
									placeholder="Choose a username"
									autoCapitalize="none"
									onFocus={() => setFocusedField('username')}
									onBlur={() => setFocusedField(null)}
								/>
							</Pressable>
						</View>

						<View style={sharedStyles.field}>
							<AppText bold style={sharedStyles.fieldLabel}>
								Password
							</AppText>
							<Pressable
								style={[
									sharedStyles.inputWrap,
									focusedField === 'password' && sharedStyles.inputWrapFocused,
								]}
								onPress={() => passwordRef.current?.focus()}
							>
								<FontAwesome6 name="lock" style={sharedStyles.inputIcon} />
								<AppTextInput
									ref={passwordRef}
									style={sharedStyles.inputControl}
									value={password}
									onChangeText={setPassword}
									placeholder="••••••••"
									secureTextEntry
									onFocus={() => setFocusedField('password')}
									onBlur={() => setFocusedField(null)}
								/>
							</Pressable>
						</View>

						<View style={styles.row}>
							<Pressable
								onPress={onForgotPassword}
								onHoverIn={() => setForgotHovered(true)}
								onHoverOut={() => setForgotHovered(false)}
							>
								{({ pressed }) => (
									<AppText
										bold
										style={[sharedStyles.link, forgotHovered && sharedStyles.linkHover]}
									>
										Forgot password?
									</AppText>
								)}
							</Pressable>
						</View>

						{error && <AppText style={sharedStyles.errorText}>{error}</AppText>}

						<Pressable
							style={({ pressed }) => [
								sharedStyles.submit,
								submitHovered && !pressed && sharedStyles.submitHover,
								pressed && sharedStyles.submitPressed,
								submitting && sharedStyles.submitDisabled,
							]}
							onPress={handleSignIn}
							onHoverIn={() => setSubmitHovered(true)}
							onHoverOut={() => setSubmitHovered(false)}
							disabled={submitting}
						>
							<AppText bold style={sharedStyles.submitText}>
								{submitting ? 'Signing in…' : 'Sign in'}
							</AppText>
						</Pressable>

						<AppText style={styles.switchLine}>
							New here?{' '}
							<AppText bold style={sharedStyles.link} onPress={() => switchTo(false)}>
								Register to bid
							</AppText>
						</AppText>
					</View>
				) : (
					<View style={styles.form}>
						<AppText bold style={styles.formHeading}>
							Register to bid
						</AppText>
						<AppText style={styles.formSubtext}>
							Create an account to enter the room.
						</AppText>

						<View style={sharedStyles.field}>
							<AppText bold style={sharedStyles.fieldLabel}>
								Username
							</AppText>
							<Pressable
								style={[
									sharedStyles.inputWrap,
									focusedField === 'username' && sharedStyles.inputWrapFocused,
								]}
								onPress={() => usernameRef.current?.focus()}
							>
								<FontAwesome6 name="user-large" style={sharedStyles.inputIcon} />
								<AppTextInput
									ref={usernameRef}
									style={sharedStyles.inputControl}
									value={username}
									onChangeText={setUsername}
									placeholder="Choose a username"
									autoCapitalize="none"
									onFocus={() => setFocusedField('username')}
									onBlur={() => setFocusedField(null)}
								/>
							</Pressable>
						</View>

						<View style={sharedStyles.field}>
							<AppText bold style={sharedStyles.fieldLabel}>
								Email
							</AppText>
							<Pressable
								style={[
									sharedStyles.inputWrap,
									focusedField === 'email' && sharedStyles.inputWrapFocused,
								]}
								onPress={() => emailRef.current?.focus()}
							>
								<FontAwesome name="envelope" style={sharedStyles.inputIcon} />
								<AppTextInput
									ref={emailRef}
									style={sharedStyles.inputControl}
									value={email}
									onChangeText={setEmail}
									placeholder="example@example.com"
									autoCapitalize="none"
									keyboardType="email-address"
									onFocus={() => setFocusedField('email')}
									onBlur={() => setFocusedField(null)}
								/>
							</Pressable>
						</View>

						<View style={sharedStyles.field}>
							<AppText bold style={sharedStyles.fieldLabel}>
								Password
							</AppText>
							<Pressable
								style={[
									sharedStyles.inputWrap,
									focusedField === 'password' && sharedStyles.inputWrapFocused,
								]}
								onPress={() => passwordRef.current?.focus()}
							>
								<FontAwesome6 name="lock" style={sharedStyles.inputIcon} />
								<AppTextInput
									ref={passwordRef}
									style={sharedStyles.inputControl}
									value={password}
									onChangeText={setPassword}
									placeholder="••••••••"
									secureTextEntry
									onFocus={() => setFocusedField('password')}
									onBlur={() => setFocusedField(null)}
								/>
							</Pressable>
						</View>

						<View style={sharedStyles.field}>
							<AppText bold style={sharedStyles.fieldLabel}>
								Confirm password
							</AppText>
							<Pressable
								style={[
									sharedStyles.inputWrap,
									focusedField === 'confirmPassword' && sharedStyles.inputWrapFocused,
								]}
								onPress={() => confirmPasswordRef.current?.focus()}
							>
								<FontAwesome6 name="lock" style={sharedStyles.inputIcon} />
								<AppTextInput
									ref={confirmPasswordRef}
									style={sharedStyles.inputControl}
									value={confirmPassword}
									onChangeText={setConfirmPassword}
									placeholder="••••••••"
									secureTextEntry
									onFocus={() => setFocusedField('confirmPassword')}
									onBlur={() => setFocusedField(null)}
								/>
							</Pressable>
						</View>

						{error && <AppText style={sharedStyles.errorText}>{error}</AppText>}

						<Pressable
							style={({ pressed }) => [
								sharedStyles.submit,
								submitHovered && !pressed && sharedStyles.submitHover,
								pressed && sharedStyles.submitPressed,
								submitting && sharedStyles.submitDisabled,
							]}
							onPress={handleRegister}
							onHoverIn={() => setSubmitHovered(true)}
							onHoverOut={() => setSubmitHovered(false)}
							disabled={submitting}
						>
							<AppText bold style={sharedStyles.submitText}>
								{submitting ? 'Creating account…' : 'Create account'}
							</AppText>
						</Pressable>

						<AppText style={styles.switchLine}>
							Already registered?{' '}
							<AppText bold style={sharedStyles.link} onPress={() => switchTo(true)}>
								Sign in
							</AppText>
						</AppText>
					</View>
				)}
			</View>
		</View>
	);
}
