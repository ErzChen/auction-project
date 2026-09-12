import { useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { formatDate, formatPrice, formatTimeRemaining } from '../lib/library';
import { Image, Pressable, TouchableOpacity, View } from 'react-native';
import { auctionListingsStyles as styles } from '../styles/auctionListings';
import { sharedStyles } from '../styles/shared';
import { AppText } from './AppText';
import { FontAwesome6 } from '@expo/vector-icons';
import { useAuctionContext } from '../context/AuctionContext';
import Animated from 'react-native-reanimated';

function getFirstImage(imagePathsJson) {
	try {
		const paths = JSON.parse(imagePathsJson || '[]');
		return paths.length > 0 ? paths[0] : null;
	} catch {
		return null;
	}
}

function AuctionCard({ auction }) {
	const [imgError, setImgError] = useState(false);
	const [now, setNow] = useState(Date.now());
	const {
		starting_price: startingPrice,
		current_price: currentPrice,
		currency,
		title,
		location,
		description,
		status,
		image_paths: imagePaths,
		start_time: startDate,
		end_time: endDate,
		view_count: viewCount,
		bid_count: bidCount,
		category,
		condition,
		is_shipping_available: isShippingAvailable,
	} = auction;
	const { username } = useAuthContext().user;
	const imageUrl = getFirstImage(imagePaths);
	const isSold = status === 'sold';
	const isUpcoming = status === 'upcoming';
	const isExpired = status === 'expired';
	const isActive = status === 'active';

	useEffect(() => {
		if (!isActive) return;
		const interval = setInterval(() => setNow(Date.now()), 60000);
		return () => clearInterval(interval);
	}, [isActive]);

	const countdown = useMemo(
		() => (isActive ? formatTimeRemaining(endDate, Date.now()) : null),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[isActive, endDate, now],
	);

	return (
		<View style={styles.card}>
			<View style={styles.cardMedia}>
				{!imgError ? (
					<Image
						source={{ uri: imageUrl }}
						accessibilityLabel={title}
						onError={() => setImgError(true)}
						style={styles.cardMediaImage}
					/>
				) : (
					<FontAwesome6 name="gavel" style={styles.cardPlaceholderIcon} />
				)}
			</View>

			<View style={styles.cardBody}>
				<AppText style={styles.headerTitle} numberOfLines={1}>
					{title}
				</AppText>

				<View style={styles.infoRow}>
					{category ? (
						<View style={styles.infoItem}>
							<FontAwesome6 name="tag" style={styles.infoItemIcon} />
							<AppText style={styles.infoItemText}>{category}</AppText>
						</View>
					) : null}
					{condition ? (
						<View style={styles.infoItem}>
							<FontAwesome6 name="tag" style={styles.infoItemIcon} />
							<AppText style={styles.infoItemText}>{condition}</AppText>
						</View>
					) : null}
					{isShippingAvailable ? (
						<View style={styles.infoItem}>
							<FontAwesome6 name="truck" style={styles.infoItemIcon} />
							<AppText style={styles.infoItemText}>Shipping</AppText>
						</View>
					) : null}
				</View>

				<View style={styles.infoRow}>
					<View style={styles.infoItem}>
						<FontAwesome6 name="user" style={styles.infoItemIcon} />
						<AppText style={styles.infoItemText}>
							{username || 'Username unknown'}
						</AppText>
					</View>

					<View style={styles.infoItem}>
						<FontAwesome6 name="location-dot" style={styles.infoItemIcon} />
						<AppText style={styles.infoItemText}>
							{location || 'Location unknown'}
						</AppText>
					</View>

					<View style={styles.infoItem}>
						<FontAwesome6 name="calendar-days" style={styles.infoItemIcon} />
						<AppText style={styles.infoItemText}>
							{isActive && countdown
								? countdown
								: `${formatDate(startDate)} – ${formatDate(endDate)}`}
						</AppText>
					</View>
				</View>

				<AppText style={styles.description} numberOfLines={2}>
					{description}
				</AppText>

				<View style={styles.statsRow}>
					{typeof viewCount === 'number' ? (
						<View style={styles.statItem}>
							<FontAwesome6 name="eye" style={styles.statIcon} />
							<AppText style={styles.statText}>{viewCount}</AppText>
						</View>
					) : null}
					{typeof bidCount === 'number' ? (
						<View style={styles.statItem}>
							<FontAwesome6 name="gavel" style={styles.statIcon} />
							<AppText style={styles.statText}>
								{bidCount} {bidCount === 1 ? 'bid' : 'bids'}
							</AppText>
						</View>
					) : null}
				</View>

				<View style={styles.priceBlock}>
					<AppText style={styles.priceLabel}>
						{isSold
							? 'Sold for'
							: isUpcoming
								? 'Starting at'
								: isExpired
									? 'Ended, no bids won'
									: 'Current bid'}
					</AppText>
					<AppText style={styles.priceValue}>
						{(isUpcoming
							? formatPrice(startingPrice, currency)
							: formatPrice(currentPrice, currency)) || '-'}
					</AppText>
				</View>

				<TouchableOpacity style={styles.viewBtn}>
					<AppText style={styles.viewBtnText}>View listing</AppText>
					<FontAwesome6 name="arrow-right" style={styles.viewBtnIcon} />
				</TouchableOpacity>
			</View>
		</View>
	);
}

function AuctionCardSkeleton() {
	return (
		<Animated.View style={styles.card}>
			<Animated.View
				style={[styles.cardMedia, sharedStyles.skeletonBlock]}
			></Animated.View>
			<Animated.View style={styles.cardBody}>
				<Animated.View
					style={[sharedStyles.skeletonLine, sharedStyles.skeletonLineTitle]}
				></Animated.View>
				<Animated.View
					style={[sharedStyles.skeletonLine, sharedStyles.skeletonLineWord]}
				></Animated.View>
				<Animated.View
					style={[sharedStyles.skeletonLine, sharedStyles.skeletonLineWord]}
				></Animated.View>
				<Animated.View
					style={[sharedStyles.skeletonLine, sharedStyles.skeletonLineWord]}
				></Animated.View>
				<Animated.View
					style={[sharedStyles.skeletonLine, sharedStyles.skeletonLineWord]}
				></Animated.View>
				<Animated.View
					style={[sharedStyles.skeletonLine, sharedStyles.skeletonLineWord]}
				></Animated.View>
				<Animated.View
					style={[sharedStyles.skeletonLine, sharedStyles.skeletonLineTitle]}
				></Animated.View>
				<Animated.View
					style={[sharedStyles.skeletonLine, sharedStyles.skeletonLineButtonSmall]}
				></Animated.View>
			</Animated.View>
		</Animated.View>
	);
}

export function AuctionListings() {
	const {
		auctions,
		loading,
		error,
		page,
		hasMore,
		pageSize,
		prevPage,
		nextPage,
	} = useAuctionContext();

	return (
		<View style={styles.section}>
			<View style={styles.header}>
				<AppText style={styles.headerTitle}>Listings</AppText>
				<AppText style={styles.count}>
					{auctions.length} listing{auctions.length === 1 ? '' : 's'} shown
				</AppText>
			</View>

			{error && <AppText style={sharedStyles.errorText}>{error}</AppText>}

			{loading ? (
				<View style={styles.grid}>
					{Array.from({ length: pageSize }).map((_, i) => (
						<AuctionCardSkeleton key={i} />
					))}
				</View>
			) : auctions.length === 0 && !error ? (
				<View style={styles.empty}>
					<FontAwesome6 name="gavel" style={styles.emptyIcon} />
					<AppText style={styles.emptyTitle}>
						No listings match those filters
					</AppText>
					<AppText style={styles.emptyText}>
						Try widening your price range or clearing a filter.
					</AppText>
				</View>
			) : (
				<>
					<View style={styles.grid}>
						{auctions.map((auction) => (
							<AuctionCard key={auction.auction_id} auction={auction} />
						))}
					</View>

					{(page > 0 || hasMore) && (
						<View style={styles.pageNav}>
							<Pressable
								style={styles.pageNavArrowBtn}
								onPress={prevPage}
								disabled={page === 0 || loading}
							>
								<FontAwesome6 name="chevron-left" style={styles.pageNavArrowIcon} />
							</Pressable>
							<AppText style={styles.pageNavLabel}>Page {page + 1}</AppText>
							<Pressable
								style={styles.pageNavArrowBtn}
								onPress={nextPage}
								disabled={!hasMore || loading}
							>
								<FontAwesome6 name="chevron-right" style={styles.pageNavArrowIcon} />
							</Pressable>
						</View>
					)}
				</>
			)}
		</View>
	);
}
