import { StyleSheet } from 'react-native';
import { colors, fontSizes, radius, vh } from '../constants/theme';

export const auctionListingsStyles = StyleSheet.create({
	section: {
		flex: 1,
		minHeight: vh(90),
		paddingHorizontal: 36,
		paddingTop: 28,
		paddingBottom: 48,
		marginTop: vh(10),
		marginBottom: vh(5),
	},
	header: {
		flexDirection: 'row',
		alignItems: 'baseline',
		justifyContent: 'space-between',
		marginBottom: 22,
	},
	headerTitle: {
		fontWeight: '800',
		fontSize: fontSizes.title,
		color: colors.navy,
	},
	count: {
		fontSize: fontSizes.label,
		color: colors.navyTextMuted,
	},
	empty: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 80,
		paddingHorizontal: 20,
	},
	emptyIcon: {
		fontSize: 32,
		color: colors.navyTextSub,
		marginBottom: 14,
	},
	emptyTitle: {
		marginBottom: 6,
		color: colors.navy,
		fontSize: fontSizes.subtitle,
	},
	emptyText: {
		fontSize: fontSizes.label,
		color: colors.navyTextMuted,
	},
	grid: {
		flexGrow: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 20,
	},
	card: {
		flexGrow: 0,
		flexShrink: 1,
		backgroundColor: colors.whiteTextPrimary,
		borderWidth: 2,
		borderColor: colors.surface,
		borderRadius: radius,
		overflow: 'hidden',
	},
	cardMedia: {
		height: 140,
		backgroundColor: colors.surface,
		alignItems: 'center',
		justifyContent: 'center',
	},
	cardMediaImage: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
	},
	cardPlaceholderIcon: {
		fontSize: 28,
		color: colors.navyTextSub,
	},
	cardBody: {
		flex: 1,
		padding: 16,
		gap: 4,
		borderTopWidth: 1,
		borderTopColor: colors.surface,
		borderStyle: 'dashed',
	},
	cardTitle: {
		marginBottom: 6,
		fontSize: fontSizes.subtitle,
		fontWeight: '700',
		color: colors.navy,
		lineHeight: 20,
	},
	infoRow: {
		flexDirection: 'column',
		gap: 6,
		marginBottom: 6,
	},
	infoItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	infoItemIcon: {
		fontSize: 10,
		color: colors.navyTextSub,
		width: 12,
		textAlign: 'center',
	},
	infoItemText: {
		fontSize: fontSizes.body,
		color: colors.navyTextMuted,
	},
	description: {
		marginBottom: 14,
		fontSize: fontSizes.label,
		lineHeight: 20,
		color: colors.navyTextBody,
	},
	statsRow: {
		flexDirection: 'row',
		gap: 14,
		marginBottom: 10,
	},
	statItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	statIcon: {
		fontSize: 10,
		color: colors.navyTextSub,
	},
	statText: {
		fontSize: fontSizes.body,
		color: colors.navyTextMuted,
	},
	priceBlock: {
		marginTop: 'auto',
		marginBottom: 14,
	},
	priceLabel: {
		fontSize: fontSizes.body,
		textTransform: 'uppercase',
		letterSpacing: 0.4,
		color: colors.navyTextMuted,
	},
	priceValue: {
		fontSize: 20,
		fontWeight: '800',
		color: colors.navy,
	},
	viewBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '100%',
		paddingVertical: 9,
		paddingHorizontal: 12,
		borderRadius: radius,
		backgroundColor: colors.navy,
	},
	viewBtnText: {
		color: colors.whiteTextPrimary,
		fontSize: fontSizes.label,
		fontWeight: '700',
	},
	viewBtnIcon: {
		fontSize: 11,
		color: colors.whiteTextPrimary,
	},

	pageNav: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 18,
		marginTop: 32,
	},
	pageNavArrowBtn: {
		width: 38,
		height: 38,
		borderRadius: radius,
		backgroundColor: colors.whiteTextPrimary,
		borderWidth: 2,
		borderColor: colors.surface,
		alignItems: 'center',
		justifyContent: 'center',
	},
	pageNavArrowIcon: {
		fontSize: 13,
		color: colors.navy,
	},
	pageNavArrowDisabled: {
		color: colors.navyTextDisabled,
	},
	pageNavLabel: {
		fontSize: fontSizes.label,
		fontWeight: '700',
		color: colors.navyTextBody,
		minWidth: 70,
		textAlign: 'center',
	},
});
