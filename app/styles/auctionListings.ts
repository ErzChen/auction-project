import { StyleSheet } from 'react-native';
import { colors, fontSizes, radius, shadow, vh } from '../constants/theme';

export const auctionListingsStyles = StyleSheet.create({
  section: {
    flex: 1,
    minHeight: vh(90),
    paddingHorizontal: 36,
    paddingTop: 28,
    paddingBottom: 48,
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
  errorText: {
    color: colors.urgent,
    fontSize: fontSizes.label,
    marginBottom: 20,
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

  // CSS grid has no direct RN equivalent — use flexWrap with a fixed-ish
  // basis per card (or FlatList numColumns, which is usually the cleaner
  // native option for a real grid of cards).
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  card: {
    flexGrow: 1,
    flexBasis: 240,
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
  // text-overflow: ellipsis + white-space: nowrap -> numberOfLines on <Text>
  description: {
    marginBottom: 14,
    fontSize: fontSizes.label,
    lineHeight: 20,
    color: colors.navyTextBody,
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
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: radius,
    backgroundColor: colors.navy,
  },
  viewButtonText: {
    color: colors.whiteTextPrimary,
    fontSize: fontSizes.label,
    fontWeight: '700',
  },
  viewButtonIcon: {
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
    // apply pageNavArrowIcon color override to navyTextDisabled when disabled
  },
  pageNavLabel: {
    fontSize: fontSizes.label,
    fontWeight: '700',
    color: colors.navyTextBody,
    minWidth: 70,
    textAlign: 'center',
  },
});
