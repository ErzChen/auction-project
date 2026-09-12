import { StyleSheet } from 'react-native';
import { colors, fontSizes, radius, vh, vw } from '../constants/theme';

export const topBarStyles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    width: vw(100),
    height: vh(10),
    backgroundColor: colors.navy,
    zIndex: 1,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
    height: '100%',
    width: '20%',
    fontSize: fontSizes.heading,
    color: colors.whiteTextPrimary,
    fontWeight: '800',
  },
  logo: {
    height: '100%',
    resizeMode: 'contain',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '40%',
    height: '100%',
    marginLeft: 'auto',
  },
  navButton: {
    flex: 1,
    minWidth: 0,
    height: '100%',
  },
  navButtonSpan: {
    flex: 1,
    height: '100%',
    paddingVertical: 18,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDivider: {
    position: 'absolute',
    left: 0,
    top: '20%',
    height: '60%',
    width: 1,
    backgroundColor: 'rgba(250, 248, 244, 0.15)',
  },
  navButtonText: {
    color: colors.whiteTextMuted,
    fontSize: fontSizes.subtitle,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  navButtonTextHover: {
    color: colors.whiteTextPrimary,
  },

  profileTrigger: {
    position: 'relative',
  },
  userProfileIcon: {
    fontSize: 30,
    color: colors.whiteTextMuted,
  },
  profileMenu: {
    position: 'absolute',
    top: '110%',
    right: 12,
    minWidth: 170,
    padding: 6,
    backgroundColor: colors.whiteTextPrimary,
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: radius,
    zIndex: 2,
    shadowColor: '#0c2c4a',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius,
  },
  profileMenuItemText: {
    fontSize: fontSizes.label,
    fontWeight: '700',
    color: colors.navyTextBody,
  },
  profileMenuItemHover: {
    backgroundColor: colors.surface,
  },
  profileMenuItemDangerText: {
    color: colors.urgent,
  },
});