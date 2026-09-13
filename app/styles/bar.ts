import { StyleSheet } from 'react-native';
import { colors, fontSizes, radius, vh, vw } from '../constants/theme';

export const barStyles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: vw(100),
    height: vh(5),
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
  },
  brandingText: {
    fontSize: fontSizes.heading,
    color: colors.whiteTextPrimary,
    fontWeight: '800',
  },
  logo: {
    height: '100%',
    width: vh(10),
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '20%',
    height: '100%',
  },
  navButton: {
    width: '20%',
    height: '100%',
  },
  navButtonHover: {
    backgroundColor: 'rgba(250, 248, 244, 0.06)',
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
    height: "60%",
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  userProfileIcon: {
    fontSize: 20,
    color: colors.whiteTextMuted,
  },
  profileMenu: {
    position: 'absolute',
    bottom: '110%',
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
  profileMenuItemIcon: {
    width: 14,
    textAlign: 'center',
    fontSize: fontSizes.label,
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