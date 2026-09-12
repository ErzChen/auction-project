import { useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { formatDate, formatPrice, formatTimeRemaining } from '../lib/library';
import {
	Dimensions,
	FlatList,
	Image,
	Pressable,
	ScrollView,
	TouchableOpacity,
	View,
} from 'react-native';
import { auctionListingsStyles as styles } from '../styles/auctionListings';
import { sharedStyles } from '../styles/shared';
import { AppText } from './AppText';
import { FontAwesome6 } from '@expo/vector-icons';
import { useAuctionContext } from '../context/AuctionContext';
import Animated from 'react-native-reanimated';
import { Skeleton } from './Skeleton';
import { getBids } from '../lib/auctionActions';

function getFirstImage(imagePathsJson) {
	try {
		const paths = JSON.parse(imagePathsJson || '[]');
		return paths.length > 0 ? paths[0] : null;
	} catch {
		return null;
	}
}

function AuctionCard({ auction, style }) {
	const [imgError, setImgError] = useState(false);
	const [now, setNow] = useState(Date.now());
	const [bidCount, setBidCount] = useState(0);
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
		category,
		is_shipping_available: isShippingAvailable,
	} = auction;
	const imageUrl = getFirstImage(imagePaths);
	const isSold = status === 'sold';
	const isUpcoming = status === 'upcoming';
	const isExpired = status === 'expired';
	const isActive = status === 'active';

	useEffect(() => {
		getBids(auction.auction_id)
			.then((result) => {
				setBidCount(result.length);
			})
			.catch((err) => {
				console.log('Failed to fetch bids:', err);
			});
	}, []);

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
		<View style={[styles.card, style]}>
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
				<AppText bold style={styles.cardTitle} numberOfLines={1}>
					{title}
				</AppText>

				<View style={styles.infoRow}>
					{category ? (
						<View style={styles.infoItem}>
							<FontAwesome6 name="tag" style={styles.infoItemIcon} />
							<AppText style={styles.infoItemText}>{category}</AppText>
						</View>
					) : null}
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
					{isShippingAvailable ? (
						<View style={styles.infoItem}>
							<FontAwesome6 name="truck" style={styles.infoItemIcon} />
							<AppText style={styles.infoItemText}>Shipping</AppText>
						</View>
					) : null}
				</View>

				<AppText style={styles.description} numberOfLines={1}>
					{description}
				</AppText>

				<View style={{ flex: 1 }} />

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

function AuctionCardSkeleton({ style }) {
	return (
		<View style={[styles.card, style]}>
			<Skeleton style={[styles.cardMedia, sharedStyles.skeletonBlock]}></Skeleton>
			<View style={styles.cardBody}>
				<Skeleton
					style={[sharedStyles.skeletonLine, sharedStyles.skeletonLineTitle]}
				></Skeleton>
				<Skeleton
					style={[sharedStyles.skeletonLine, sharedStyles.skeletonLineWord]}
				></Skeleton>
				<Skeleton
					style={[sharedStyles.skeletonLine, sharedStyles.skeletonLineWord]}
				></Skeleton>
				<Skeleton
					style={[sharedStyles.skeletonLine, sharedStyles.skeletonLineWord]}
				></Skeleton>
				<Skeleton
					style={[sharedStyles.skeletonLine, sharedStyles.skeletonLineBody]}
				></Skeleton>
				<Skeleton
					style={[sharedStyles.skeletonLine, sharedStyles.skeletonLineWord]}
				></Skeleton>
				<Skeleton
					style={[sharedStyles.skeletonLine, sharedStyles.skeletonLineTitle]}
				></Skeleton>
				<Skeleton
					style={[sharedStyles.skeletonLine, sharedStyles.skeletonLineButtonSmall]}
				></Skeleton>
			</View>
		</View>
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

	const padding = 36;
	const gap = 20;
	const minWidth = 260;
	const availableWidth = Dimensions.get('window').width - padding * 2;
	const numCols = Math.floor((availableWidth + gap) / (minWidth + gap)) || 1;
	const cardWidth = (availableWidth - gap * (numCols - 1)) / numCols;

	return (
		<ScrollView style={styles.section}>
			<View style={styles.header}>
				<AppText bold style={styles.headerTitle}>
					Your Listings
				</AppText>
				{!loading && !error && (
					<AppText style={styles.count}>
						{auctions.length} listing{auctions.length === 1 ? '' : 's'} shown
					</AppText>
				)}
			</View>

			{error && <AppText style={sharedStyles.errorText}>{error}</AppText>}

			{loading ? (
				<FlatList
					data={Array.from({ length: pageSize })}
					numColumns={numCols}
					key={numCols}
					columnWrapperStyle={{ gap: gap }}
					contentContainerStyle={{ gap: gap }}
					renderItem={() => <AuctionCardSkeleton style={{ width: cardWidth }} />}
				/>
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
					<FlatList
						data={auctions}
						numColumns={numCols}
						key={numCols}
						columnWrapperStyle={{ gap: gap }}
						contentContainerStyle={{ gap: gap }}
						renderItem={({ item }) => (
							<AuctionCard
								key={item.auction_id}
								auction={item}
								style={{ width: cardWidth }}
							/>
						)}
					/>

					{(page > 0 || hasMore) && (
						<View style={styles.pageNav}>
							<Pressable
								style={styles.pageNavArrowBtn}
								onPress={prevPage}
								disabled={page === 0 || loading}
							>
								<FontAwesome6 
									name="chevron-left" 
									style={[
										styles.pageNavArrowIcon,
										(page === 0 || loading) && styles.pageNavArrowDisabled,
									]}
								/>
							</Pressable>
							<AppText style={styles.pageNavLabel}>Page {page + 1}</AppText>
							<Pressable
								style={styles.pageNavArrowBtn}
								onPress={nextPage}
								disabled={!hasMore || loading}
							>
								<FontAwesome6
									name="chevron-right"
									style={[
										styles.pageNavArrowIcon,
										(!hasMore || loading) && styles.pageNavArrowDisabled,
									]}
								/>
							</Pressable>
						</View>
					)}
				</>
			)}
		</ScrollView>
	);
}
