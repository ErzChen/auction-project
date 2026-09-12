import { StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, radius } from '../constants/theme';

export const sharedStyles = StyleSheet.create({
	field: {
		marginBottom: 18,
	},
	fieldLabel: {
		fontSize: fontSizes.body,
		fontWeight: '700',
		letterSpacing: 0.4,
		textTransform: 'uppercase',
		color: colors.navyTextBody,
		marginBottom: 6,
	},
	inputWrap: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		paddingHorizontal: 14,
		height: 46,
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: 'transparent',
		borderRadius: radius,
		overflow: 'hidden',
	},
	inputWrapFocused: {
		borderColor: colors.init,
		boxShadow: [
			{
				offsetX: 0,
				offsetY: 0,
				blurRadius: 0,
				spreadDistance: '3px',
				color: colors.initFocus,
			},
		],
	},
	inputIcon: {
		fontSize: fontSizes.label,
		color: colors.navyTextMuted,
	},
	inputControl: {
		flex: 1,
		minWidth: 0,
		height: '100%',
		fontSize: fontSizes.label,
		color: colors.navy,
		fontFamily: fonts.regular,
    // web only
    outlineStyle: 'none' as any,
	},
	inputPrefix: {
		fontSize: fontSizes.label,
		color: colors.navyTextMuted,
	},
	submit: {
		height: 48,
		borderRadius: radius,
		backgroundColor: colors.init,
		alignItems: 'center',
		justifyContent: 'center',
		cursor: 'pointer',
	},
	submitText: {
		color: colors.whiteTextPrimary,
		fontWeight: '800',
		fontSize: fontSizes.subtitle,
		letterSpacing: 0.3,
	},
	submitHover: {
		backgroundColor: colors.initHover,
	},
	submitPressed: {
		backgroundColor: colors.initActive,
	},
	submitDisabled: {
		backgroundColor: colors.initDisabled,
	},
	submitDanger: {
		backgroundColor: colors.urgent,
	},
	submitDangerHover: {
		backgroundColor: colors.urgentHover,
	},
	submitDangerPressed: {
		backgroundColor: colors.urgentActive,
	},
	submitDangerDisabled: {
		backgroundColor: colors.urgentDisabled,
	},

	statusGroup: {
		marginTop: 4,
	},
	statusPills: {
		flexDirection: 'row',
		gap: 6,
		marginTop: 4,
	},
	statusPill: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 8,
		borderRadius: radius,
		backgroundColor: colors.surface,
	},
	statusPillText: {
		fontSize: fontSizes.body,
		fontWeight: '700',
		color: colors.navyTextBody,
	},
	statusPillActive: {
		backgroundColor: colors.navy,
	},
	statusPillActiveText: {
		color: colors.whiteTextPrimary,
	},

	errorText: {
		color: colors.urgent,
		marginBottom: 18,
		fontSize: fontSizes.label,
	},
	statusPage: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	pageStatus: {
		fontSize: fontSizes.heading,
		fontWeight: '800',
		color: colors.navy,
	},
	link: {
		fontSize: fontSizes.label,
		fontWeight: '700',
		color: colors.init,
		cursor: 'pointer',
	},
	linkHover: {
		textDecorationLine: 'underline',
	},

	skeletonLine: {
		backgroundColor: colors.surface,
		borderRadius: radius,
		height: 12,
	},
	skeletonBlock: {
		backgroundColor: colors.surface,
	},
	skeletonLineTitle: {
		width: '50%',
		height: 20,
		marginBottom: 8,
	},
	skeletonLinePanelInfo: {
		width: '30%',
		height: 16,
	},
	skeletonLineButton: {
		width: '100%',
		height: 48,
	},
	skeletonLineButtonSmall: {
		width: '100%',
		height: 24,
	},
	skeletonLineLabel: {
		width: '30%',
		height: 12,
		marginBottom: 16,
	},
	skeletonLineBody: {
		width: '70%',
		height: 12,
		marginVertical: 8,
	},
	skeletonLineWord: {
		width: 80,
		height: 12,
	},
});
