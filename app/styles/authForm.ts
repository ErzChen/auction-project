import { StyleSheet } from 'react-native';
import { colors, fontSizes } from '../constants/theme';

export const authFormStyles = StyleSheet.create({
  panel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: colors.bg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 32,
    borderBottomWidth: 2,
    borderBottomColor: colors.surface,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontWeight: '900',
    fontSize: fontSizes.subtitle,
    letterSpacing: 0.3,
    color: colors.navyTextMuted,
  },
  tabTextActive: {
    color: colors.navy,
  },
  tabTextHover: {
    color: colors.navyHover,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    width: '50%',
    height: 2,
    backgroundColor: colors.init,
  },
  form: {},
  formHeading: {
    marginBottom: 6,
    fontWeight: '800',
    fontSize: fontSizes.title,
    color: colors.navy,
  },
  formSubtext: {
    marginBottom: 28,
    fontWeight: '700',
    fontSize: fontSizes.label,
    color: colors.navyTextMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxText: {
    fontSize: fontSizes.label,
    color: colors.navyTextBody,
  },
  checkboxBox: {
	marginLeft: 2,
    width: 13,
    height: 13,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.navyTextMuted,
  },
  checkboxBoxHover: {
    borderColor: colors.initHover,
  },
  checkboxBoxActive: {
    borderColor: colors.initActive,
  },
  checkboxBoxChecked: {
    backgroundColor: colors.init,
    borderColor: colors.init,
  },
  checkboxBoxCheckedHover: {
    backgroundColor: colors.initHover,
    borderColor: colors.initHover,
  },
  checkboxBoxCheckedActive: {
    backgroundColor: colors.initActive,
    borderColor: colors.initActive,
  },
  switchLine: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: fontSizes.label,
    color: colors.navyTextMuted,
  },
});
