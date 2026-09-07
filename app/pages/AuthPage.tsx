import { ActivityIndicator, Animated, Easing, Image, LayoutChangeEvent, Platform, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuctions } from '../lib/auctionActions';
import { Auction } from '../constants/types';
import { useFonts } from 'expo-font';
import { AppText } from '../components/AppText';
import { AuthForm } from '../components/AuthForm';
import { authPageStyles as styles } from '../styles/authPage';

const gavelLogo = require('../assets/images/gavel-logo.png');

const FALLBACK_LISTINGS = [
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
	'LISTING # — Title — SOLD',
];

export default function AuthPage() {
	const [fontsLoaded] = useFonts({
		'Ubuntu Mono': require('../assets/fonts/UbuntuMono.ttf'),
		'Ubuntu Mono Bold': require('../assets/fonts/UbuntuMono-Bold.ttf'),
	});

	const [listings, setListings] = useState(FALLBACK_LISTINGS);
	const [view, setView] = useState('auth');
	const [rowHeight, setRowHeight] = useState(0);
	const translateY = useRef(new Animated.Value(0)).current;
	const hasMeasured = useRef(false);

	const handleLayout = (e: LayoutChangeEvent) => {
		const h = e.nativeEvent.layout.height / 2;
		if (hasMeasured.current) return;
		if (h > 0) {
			hasMeasured.current = true;
			setRowHeight(h);
		}
	};

	useEffect(() => {
		if (!rowHeight) return;

		let cancelled = false;

		const animate = () => {
			translateY.setValue(0);
			Animated.timing(translateY, {
				toValue: -rowHeight,
				duration: 30000,
				easing: Easing.linear,
				useNativeDriver: Platform.OS !== 'web',
			}).start(({ finished }) => {
				if (!cancelled) animate();
			});
		};

		animate();

		return () => {
			cancelled = true;
			translateY.stopAnimation();
		};
	}, [rowHeight, translateY]);

	useEffect(() => {
		let cancelled = false;

		getAuctions({ statuses: ['sold'], limit: 30 })
			.then((auctions) => {
				if (cancelled) return;
				if (!auctions || auctions.length < 20) {
					setListings(FALLBACK_LISTINGS);
					return;
				}
				setListings(
					auctions.map(
						(auction: Auction) =>
							`LISTING ${auction.auction_id} - ${auction.title} - SOLD`,
					),
				);
			})
			.catch((err) => {
				console.error('Failed to load sold auctions:', err);
				if (!cancelled) setListings(FALLBACK_LISTINGS);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	if (!fontsLoaded) {
		return <ActivityIndicator />;
	}

	return (
		<View style={styles.page}>
			<View style={styles.brandPanel}>
				<View style={styles.branding}>
					<Image
						source={gavelLogo}
						accessibilityLabel="Gavel logo"
						style={styles.brandLogo}
					/>
					<AppText bold style={styles.brandingText}>Erz's Auction</AppText>
				</View>
				<View style={styles.listingDisplay}>
					{Platform.OS === 'web' ? (
						<View
							style={{
								flex: 1,
								// @ts-ignore
								maskImage: 'linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)',
								WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)',
							}}
						>
							<Animated.View style={{ transform: [{ translateY }] }} onLayout={handleLayout}>
								{[...listings, ...listings].map((listing, i) => (
									<AppText key={i} style={styles.listingRowItem}>{listing}</AppText>
								))}
							</Animated.View>
						</View>
					) : (
						<MaskedView
							androidRenderingMode="software"
							style={{ flex: 1 }}
							maskElement={
								<LinearGradient
									colors={['black', 'transparent', 'transparent', 'black']}
									locations={[0, 0.12, 0.88, 1]}
									style={{ flex: 1 }}
								/>
							}
						>
							<Animated.View
								style={{ transform: [{ translateY }] }}
								onLayout={handleLayout}
							>
								{[...listings, ...listings].map((listing, i) => (
									<AppText key={i} style={styles.listingRowItem}>
										{listing}
									</AppText>
								))}
							</Animated.View>
						</MaskedView>
					)}
				</View>
			</View>
			{view === 'auth' ? (
				<AuthForm onForgotPassword={() => setView('forgot')} />
			) : null}
		</View>
	);
}
