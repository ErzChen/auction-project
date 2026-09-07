import { StyleSheet } from 'react-native';
import { colors, fontSizes, radius, shadow, vh, vw } from '../constants/theme';

export const helpPageStyles = StyleSheet.create({
  page: {
    width: vw(100),
    minHeight: vh(90),
    paddingHorizontal: '8%',
    paddingBottom: 64,
    gap: 40,
    marginTop: 32,
  },
  searchSection: {
    alignItems: 'center',
    backgroundColor: colors.navy,
    paddingVertical: 56,
    paddingHorizontal: 24,
  },
  searchHeading: {
    fontSize: fontSizes.heading,
    color: colors.whiteTextPrimary,
    marginBottom: 40,
  },
  searchSubtitle: {
    fontSize: fontSizes.subtitle,
    color: colors.whiteTextBody,
    marginBottom: 28,
    maxWidth: 360,
    textAlign: 'center',
  },
  searchField: {
    width: '100%',
    maxWidth: 520,
  },
  searchInputWrap: {
    height: 52,
    backgroundColor: colors.bg,
    ...shadow(0.18, 24, 6),
  },
  searchInputIcon: {
    fontSize: fontSizes.subtitle,
  },
  searchInputText: {
    fontSize: fontSizes.subtitle,
  },

  sectionHeading: {
    fontSize: fontSizes.title,
    color: colors.navy,
    marginBottom: 16,
  },

  // CSS grid(3 cols) -> flexWrap with a 1/3-ish basis
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  categoryCard: {
    flexGrow: 1,
    flexBasis: '30%',
    gap: 8,
    padding: 20,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.surface,
    borderRadius: radius,
  },
  categoryCardHover: {
    borderColor: colors.init,
  },
  categoryIcon: {
    fontSize: fontSizes.title,
    color: colors.init,
  },
  categoryTitle: {
    marginTop: 4,
    fontSize: fontSizes.subtitle,
    color: colors.navy,
  },
  categoryDescription: {
    fontSize: fontSizes.body,
    color: colors.navyTextBody,
    lineHeight: 18,
  },
  categoryCount: {
    marginTop: 4,
    fontSize: fontSizes.body,
    color: colors.navyTextMuted,
  },

  columns: {
    flexDirection: 'row',
    gap: 40,
  },
  column: {
    flex: 1,
  },
  articleList: {
    gap: 4,
  },
  listItem: {
    backgroundColor: colors.bg,
    borderRadius: radius,
    paddingHorizontal: 12,
  },
  articleLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  articleLinkText: {
    fontSize: fontSizes.label,
    color: colors.navyTextBody,
  },
  articleLinkTextHover: {
    color: colors.navy,
  },
  articleLinkIcon: {
    fontSize: fontSizes.body,
    color: colors.navyTextMuted,
  },

  faqList: {
    gap: 8,
  },
  // <details>/<summary> has no RN equivalent — implement expand/collapse
  // with component state (e.g. a Pressable header + conditional body).
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.bg,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  faqQuestion: {
    fontSize: fontSizes.label,
    fontWeight: '700',
    color: colors.navy,
  },
  faqAnswer: {
    fontSize: fontSizes.body,
    color: colors.navyTextBody,
    lineHeight: 19,
    marginTop: 10,
  },

  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    padding: 28,
    backgroundColor: colors.navy,
    borderRadius: radius,
  },
  contactHeading: {
    color: colors.whiteTextPrimary,
    marginBottom: 8,
  },
  contactDescription: {
    fontSize: fontSizes.label,
    color: colors.whiteTextBody,
    maxWidth: 360,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    flexShrink: 0,
  },
  contactSubmit: {
    paddingHorizontal: 24,
  },
  contactLink: {
    color: colors.whiteTextPrimary,
  },
});
