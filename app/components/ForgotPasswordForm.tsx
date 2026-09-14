import { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { AppTextInput } from './AppTextInput';
import { AppText } from './AppText';
import { FontAwesome } from '@expo/vector-icons';
import { authFormStyles as styles } from '../styles/authForm';
import { sharedStyles } from '../styles/shared';

export function ForgotPasswordForm({ onBackToSignIn }) {
	async function handleSubmit() {
		if (!email) {
			setError('Please enter your email');
			return;
		}

		setSubmitting(true);
		setError(null);
		try {
			const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/api/forgot-password`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auction-Application-Key': process.env.EXPO_PUBLIC_SECRET_KEY,
				},
				body: JSON.stringify({ email }),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.message || 'Something went wrong');
				return;
			}
			setSent(true);
		} catch {
			setError('Something went wrong');
		} finally {
			setSubmitting(false);
		}
	}

	const [email, setEmail] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [sent, setSent] = useState(false);
	const [submitHovered, setSubmitHovered] = useState(false);
	const [backHovered, setBackHovered] = useState(false);
	const [focusedField, setFocusedField] = useState<string | null>(null);
	const emailRef = useRef<TextInput>(null);

	return (
		<View style={styles.panel}>
			<View style={styles.card}>
				{sent ? (
					<View style={styles.form}>
						<AppText bold style={styles.formHeading}>
							Check your email
						</AppText>
						<AppText style={styles.formSubtext}>
							If an account exists for that address, we've sent a link to reset your
							password.
						</AppText>
						<Pressable
							style={({ pressed }) => [
								sharedStyles.submit,
								submitHovered && !pressed && sharedStyles.submitHover,
								pressed && sharedStyles.submitPressed,
							]}
							onPress={onBackToSignIn}
							onHoverIn={() => setSubmitHovered(true)}
							onHoverOut={() => setSubmitHovered(false)}
						>
							<AppText bold style={sharedStyles.submitText}>
								Back to sign in
							</AppText>
						</Pressable>
					</View>
				) : (
					<View style={styles.form}>
						<AppText bold style={styles.formHeading}>
							Reset your password
						</AppText>
						<AppText style={styles.formSubtext}>
							Enter your email and we'll send you a reset link.
						</AppText>

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

						{error && <AppText style={sharedStyles.errorText}>{error}</AppText>}

						<Pressable
							style={({ pressed }) => [
								sharedStyles.submit,
								submitHovered && !pressed && sharedStyles.submitHover,
								pressed && sharedStyles.submitPressed,
								submitting && sharedStyles.submitDisabled,
							]}
							onPress={handleSubmit}
							onHoverIn={() => setSubmitHovered(true)}
							onHoverOut={() => setSubmitHovered(false)}
							disabled={submitting}
						>
							<AppText bold style={sharedStyles.submitText}>
								{submitting ? 'Sending…' : 'Send reset link'}
							</AppText>
						</Pressable>

						<AppText style={styles.switchLine}>
							Remembered your password?{' '}
							<AppText
								bold
								style={[sharedStyles.link, backHovered && sharedStyles.linkHover]}
								onPress={onBackToSignIn}
							>
								Back to sign in
							</AppText>
						</AppText>
					</View>
				)}
			</View>
		</View>
	);
}