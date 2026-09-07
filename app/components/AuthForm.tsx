import { useRef, useState, useEffect } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { AppTextInput } from './AppTextInput';
import { AppText } from './AppText';
import { FontAwesome6, FontAwesome } from '@expo/vector-icons';
import { authFormStyles as styles } from '../styles/authForm';
import { sharedStyles } from '../styles/shared';
import { LayoutChangeEvent } from 'react-native';

export function AuthForm({ onForgotPassword }: { onForgotPassword: () => void }) {
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
		setCheckboxHovered(false);
		setForgotHovered(false);
		setSubmitHovered(false);
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
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ username, password }),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.message || 'Something went wrong');
				return;
			}
			const user = await res.json();
			auth?.setUser(user);
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
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ username, email, password }),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.message || 'Something went wrong');
				return;
			}
			const user = await res.json();
			auth?.setUser(user);
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
	const [remember, setRemember] = useState(false);
	const [hoveredTab, setHoveredTab] = useState<'signin' | 'register' | null>(null);
	const [checkboxHovered, setCheckboxHovered] = useState(false);
	const [forgotHovered, setForgotHovered] = useState(false);
	const [submitHovered, setSubmitHovered] = useState(false);
	const tabWidthRef = useRef(0);
	const indicatorX = useRef(new Animated.Value(0)).current;

	const handleTabsLayout = (e: LayoutChangeEvent) =>
		(tabWidthRef.current = e.nativeEvent.layout.width / 2);
	const auth = useAuth();

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
						style={[
							styles.tabIndicator,
							{ transform: [{ translateX: indicatorX }] },
						]}
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
							<View style={sharedStyles.inputWrap}>
								<FontAwesome6 name="user-large" style={sharedStyles.inputIcon} />
								<AppTextInput
									style={sharedStyles.inputControl}
									value={username}
									onChangeText={setUsername}
									placeholder="Enter your username"
									autoCapitalize="none"
								/>
							</View>
						</View>

						<View style={sharedStyles.field}>
							<AppText bold style={sharedStyles.fieldLabel}>
								Password
							</AppText>
							<View style={sharedStyles.inputWrap}>
								<FontAwesome6 name="lock" style={sharedStyles.inputIcon} />
								<AppTextInput
									style={sharedStyles.inputControl}
									value={password}
									onChangeText={setPassword}
									placeholder="••••••••"
									secureTextEntry
								/>
							</View>
						</View>

						<View style={styles.row}>
							<Pressable
								style={styles.checkbox}
								onPress={() => setRemember((r) => !r)}
								onHoverIn={() => setCheckboxHovered(true)}
								onHoverOut={() => setCheckboxHovered(false)}
							>
								{({ pressed }) => (
									<>
										<View
											style={[
												styles.checkboxBox,
												checkboxHovered && !remember && styles.checkboxBoxHover,
												pressed && !remember && styles.checkboxBoxActive,
												remember && styles.checkboxBoxChecked,
												remember && checkboxHovered && styles.checkboxBoxCheckedHover,
												remember && pressed && styles.checkboxBoxCheckedActive,
											]}
										/>
										<AppText style={styles.checkboxText}>Remember me</AppText>
									</>
								)}
							</Pressable>
							<Pressable
								onPress={onForgotPassword}
								onHoverIn={() => setForgotHovered(true)}
								onHoverOut={() => setForgotHovered(false)}
							>
								{({ pressed }) => (
									<AppText
										bold
										style={[
											sharedStyles.link,
											forgotHovered && sharedStyles.linkHover,
											pressed && sharedStyles.linkActive,
										]}
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
							<View style={sharedStyles.inputWrap}>
								<FontAwesome6 name="user-large" style={sharedStyles.inputIcon} />
								<AppTextInput
									style={sharedStyles.inputControl}
									value={username}
									onChangeText={setUsername}
									placeholder="Choose a username"
									autoCapitalize="none"
								/>
							</View>
						</View>

						<View style={sharedStyles.field}>
							<AppText bold style={sharedStyles.fieldLabel}>
								Email
							</AppText>
							<View style={sharedStyles.inputWrap}>
								<FontAwesome name="envelope" style={sharedStyles.inputIcon} />
								<AppTextInput
									style={sharedStyles.inputControl}
									value={email}
									onChangeText={setEmail}
									placeholder="example@example.com"
									autoCapitalize="none"
									keyboardType="email-address"
								/>
							</View>
						</View>

						<View style={sharedStyles.field}>
							<AppText bold style={sharedStyles.fieldLabel}>
								Password
							</AppText>
							<View style={sharedStyles.inputWrap}>
								<FontAwesome6 name="lock" style={sharedStyles.inputIcon} />
								<AppTextInput
									style={sharedStyles.inputControl}
									value={password}
									onChangeText={setPassword}
									placeholder="••••••••"
									secureTextEntry
								/>
							</View>
						</View>

						<View style={sharedStyles.field}>
							<AppText bold style={sharedStyles.fieldLabel}>
								Confirm password
							</AppText>
							<View style={sharedStyles.inputWrap}>
								<FontAwesome6 name="lock" style={sharedStyles.inputIcon} />
								<AppTextInput
									style={sharedStyles.inputControl}
									value={confirmPassword}
									onChangeText={setConfirmPassword}
									placeholder="••••••••"
									secureTextEntry
								/>
							</View>
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
