import { StyleSheet } from 'react-native';
import { colors, fontSizes, radius, shadow, vh, vw } from '../constants/theme';

export const listingPageStyles = StyleSheet.create({
  page: {
    width: vw(100),
    minHeight: vh(90),
    paddingHorizontal: '8%',
    paddingTop: 36,
    paddingBottom: 64,
    backgroundColor: colors.bg,
    flexDirection: 'row',
    gap: 32,
  },

  gallery: {
    flexDirection: 'column',
    gap: 14,
    width: '65%',
  },
  galleryMain: {
    aspectRatio: 4 / 3,
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryMainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  galleryPlaceholderIcon: {
    fontSize: 48,
  },
  // `overflow-x: scroll` -> a horizontal ScrollView wrapping this row
  galleryThumbRow: {
    flexDirection: 'row',
    gap: 10,
  },
  galleryThumb: {
    width: 72,
    height: 72,
    borderRadius: radius,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    opacity: 0.7,
  },
  galleryThumbActive: {
    borderColor: colors.init,
    opacity: 1,
  },
  galleryThumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  description: {
    marginTop: 10,
    paddingTop: 22,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  sectionLabel: {
    marginBottom: 10,
    fontSize: fontSizes.body,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.navy,
  },
  descriptionText: {
    fontSize: fontSizes.label,
    lineHeight: 22,
    color: colors.navyTextBody,
  },

  // `position: sticky` -> plain positioning; RN has no scroll-linked sticky
  // offset for an arbitrary View outside of a ScrollView's own
  // `stickyHeaderIndices`.
  panel: {
    flexGrow: 1,
    padding: 26,
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: radius,
  },
  title: {
    marginVertical: 14,
    fontSize: fontSizes.title,
    fontWeight: '800',
    lineHeight: 30,
    color: colors.navy,
  },
  info: {
    gap: 8,
    marginBottom: 18,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceBlock: {
    gap: 4,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.surface,
  },
  priceValue: {
    fontSize: fontSizes.heading,
    fontWeight: '800',
    color: colors.navy,
  },
  timing: {
    gap: 8,
    marginVertical: 16,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timingLabel: {
    fontWeight: '700',
    color: colors.navyTextMuted,
    fontSize: fontSizes.label,
  },
  timingValue: {
    color: colors.navyTextBody,
    fontSize: fontSizes.label,
  },

  seller: {
    gap: 8,
    paddingTop: 20,
  },
  sellerLabel: {
    fontSize: fontSizes.subtitle,
    fontWeight: '700',
    color: colors.navy,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Modal — RN's built-in <Modal> component covers what `.bids-overlay` /
  // `.bids-modal` (fixed + centered transform) were doing by hand.
  bidsOverlay: {
    flex: 1,
    backgroundColor: colors.overlayTranslucent,
  },
  bidsModal: {
    width: '50%',
    alignSelf: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius,
    padding: 26,
  },
  bidsCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidsCloseBtnIcon: {
    color: colors.navyTextMuted,
  },

  bidsTable: {
    marginTop: 14,
  },
  bidsTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  bidsTableHeaderCell: {
    flex: 1,
    padding: 10,
    fontSize: fontSizes.body,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.navy,
  },
  bidsTableCell: {
    flex: 1,
    padding: 10,
    fontSize: fontSizes.label,
    color: colors.navyTextBody,
  },
  bidsTableFirstCell: {
    fontWeight: '700',
    color: colors.navy,
  },

  bidInfo: {
    flexDirection: 'row',
    marginVertical: 20,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.surface,
  },
  bidInfoColumn: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
    borderLeftWidth: 1,
    borderLeftColor: colors.surface,
  },
  bidInfoColumnFirst: {
    borderLeftWidth: 0,
  },
  columnTitle: {
    marginBottom: 8,
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.navyTextMuted,
  },
  bidInfoValue: {
    fontSize: fontSizes.subtitle,
    fontWeight: '800',
    color: colors.navy,
    lineHeight: 20,
  },
  bidInfoLeading: {
    marginTop: 2,
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.success,
  },

  placeBidForm: {
    width: '100%',
  },
});
