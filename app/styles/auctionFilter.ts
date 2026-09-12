import { StyleSheet } from 'react-native';
import { colors, fontSizes, radius, vh } from '../constants/theme';

export const auctionFilterStyles = StyleSheet.create({
  section: {
    top: vh(10),
    alignItems: 'center',
    width: '30%',
    minHeight: vh(90),
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: colors.bg,
    borderRightWidth: 1,
    borderRightColor: 'rgba(12, 44, 74, 0.08)',
  },
  form: {
    width: '100%',
  },
  heading: {
    marginBottom: 22,
    fontWeight: '800',
    fontSize: fontSizes.subtitle,
    letterSpacing: 0.3,
    color: colors.navy,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  applyBtn: {
    height: 42,
    borderRadius: radius,
    backgroundColor: colors.init,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  applyBtnText: {
    color: colors.whiteTextPrimary,
    fontWeight: '800',
    fontSize: fontSizes.label,
    letterSpacing: 0.3,
  },
  applyBtnDisabled: {
    backgroundColor: colors.initDisabled,
  },
  resetBtn: {
    marginTop: 12,
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: fontSizes.label,
    fontWeight: '700',
    color: colors.navyTextMuted,
  },
  resetBtnTextPressed: {
    color: colors.urgent,
    textDecorationLine: 'underline',
  },
});
