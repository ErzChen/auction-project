import { StyleSheet } from 'react-native';
import { colors, fontSizes, vh, vw } from '../constants/theme';

export const aboutPageStyles = StyleSheet.create({
  page: {
    width: vw(100),
    minHeight: vh(90),
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 80,
  },
  body: {
    width: '100%',
    maxWidth: 760,
    gap: 8,
  },
  h1: {
    fontSize: 48,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: 32,
  },
  block: {
    marginBottom: 32,
  },
  h2: {
    fontSize: fontSizes.heading,
    color: colors.navy,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: fontSizes.subtitle,
    color: colors.navyTextBody,
    lineHeight: 24,
  },
  list: {
    gap: 12,
  },
  listItem: {
    fontSize: fontSizes.subtitle,
    color: colors.navyTextBody,
    lineHeight: 24,
  },
  listItemStrong: {
    color: colors.navy,
    fontWeight: '700',
  },
});
