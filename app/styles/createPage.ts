import { StyleSheet } from 'react-native';
import { colors, fontSizes, radius, vh, vw } from '../constants/theme';

export const createPageStyles = StyleSheet.create({
	page: {
		width: vw(100),
		minHeight: vh(90),
		marginBottom: vh(5),
		paddingHorizontal: '8%',
	    paddingBottom: 80,
        paddingTop: 20,
		backgroundColor: colors.bg,
		gap: 28,
	},
	headerBlock: {
		maxWidth: 560,
        marginBottom: 20,
	},
	pageTitle: {
		fontWeight: '800',
		fontSize: fontSizes.heading,
		color: colors.navy,
	},
	pageSubtitle: {
		marginTop: 6,
		fontSize: fontSizes.subtitle,
		color: colors.navyTextMuted,
	},
	contentRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 48,
	},
	previewColumn: {
		width: '32%',
		gap: 12,
		position: 'sticky' as any,
		top: 0,
		alignSelf: 'flex-start',
	},
	previewLabel: {
		fontSize: fontSizes.body,
		fontWeight: '700',
		color: colors.navyTextMuted,
	},

	formColumn: {
		flex: 1,
	},
	formContent: {
		gap: 0,
		paddingBottom: 24,
	},

	section: {
		paddingTop: 30,
		paddingBottom: 6,
		borderTopWidth: 1,
		borderTopColor: colors.surface,
		gap: 16,
	},
	sectionFirst: {
		paddingTop: 0,
		borderTopWidth: 0,
	},
	sectionTitle: {
		fontSize: fontSizes.subtitle,
		fontWeight: '800',
		color: colors.navy,
	},
	sectionHint: {
		marginTop: -8,
		fontSize: fontSizes.body,
		color: colors.navyTextMuted,
		lineHeight: 17,
	},

	fieldRow: {
		flexDirection: 'row',
		gap: 16,
	},
	fieldFlex: {
		flex: 1,
	},
	textAreaWrap: {
		minHeight: 96,
		alignItems: 'flex-start',
		paddingVertical: 12,
        paddingHorizontal: 14,
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: 'transparent',
		borderRadius: radius,
	},
	textAreaControl: {
		flex: 1,
		minHeight: 72,
        width: '100%',
		fontSize: fontSizes.label,
		color: colors.navy,
		textAlignVertical: 'top',
	},
	pillRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	pill: {
		paddingVertical: 9,
		paddingHorizontal: 16,
		borderRadius: radius,
		backgroundColor: colors.surface,
	},
	pillActive: {
		backgroundColor: colors.navy,
	},
	pillText: {
		fontSize: fontSizes.label,
		fontWeight: '700',
		color: colors.navyTextBody,
	},
	pillTextActive: {
		color: colors.whiteTextPrimary,
	},

	dropdownWrap: {
		position: 'relative',
	},
	dropdownTrigger: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
    dropdownValueText: {
        flex: 1,
        minWidth: 0,
        fontSize: fontSizes.label,
        color: colors.navy,
    },
	dropdownPlaceholder: {
		color: colors.navyTextMuted,
	},
	dropdownMenu: {
		position: 'absolute',
		top: '110%',
		left: 0,
		right: 0,
		maxHeight: 240,
		backgroundColor: colors.whiteTextPrimary,
		borderWidth: 2,
		borderColor: colors.surface,
		borderRadius: radius,
		paddingVertical: 4,
		shadowColor: '#0c2c4a',
		shadowOpacity: 0.18,
		shadowRadius: 24,
		shadowOffset: { width: 0, height: 4 },
		elevation: 8,
	},
	dropdownItem: {
		paddingVertical: 10,
		paddingHorizontal: 14,
	},
	dropdownItemActive: {
		backgroundColor: colors.surface,
	},
	dropdownItemText: {
		fontSize: fontSizes.label,
		color: colors.navyTextBody,
	},
	dropdownItemTextActive: {
		fontWeight: '700',
		color: colors.navy,
	},
	photosRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
	},
	photoThumb: {
		width: 84,
		height: 84,
		borderRadius: radius,
		overflow: 'hidden',
		backgroundColor: colors.surface,
	},
	photoThumbImage: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
	},
	photoRemoveBtn: {
		position: 'absolute',
		top: 4,
		right: 4,
		width: 20,
		height: 20,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(12, 44, 74, 0.75)',
	},
	photoRemoveIcon: {
		fontSize: 9,
		color: colors.whiteTextPrimary,
	},
	addPhotoTile: {
		width: 84,
		height: 84,
		borderRadius: radius,
		borderWidth: 2,
		borderStyle: 'dashed',
		borderColor: colors.navyTextSub,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 4,
	},
	addPhotoIcon: {
		fontSize: fontSizes.subtitle,
		color: colors.navyTextMuted,
	},
	addPhotoText: {
		fontSize: fontSizes.body,
		color: colors.navyTextMuted,
	},
	dynamicRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	dynamicInputWrap: {
		height: 42,
	},
	dynamicRemoveBtn: {
		width: 34,
		height: 34,
		borderRadius: radius,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.surface,
	},
	dynamicRemoveIcon: {
		fontSize: fontSizes.body,
		color: colors.navyTextMuted,
	},
	dynamicColumnLabels: {
		flexDirection: 'row',
		gap: 8,
	},
	dynamicColumnLabelText: {
		flex: 1,
		fontSize: fontSizes.body,
		fontWeight: '700',
		color: colors.navyTextMuted,
	},
	addRowBtn: {
		alignSelf: 'flex-start',
	},

	toggleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 4,
	},
	toggleLabel: {
		fontSize: fontSizes.label,
		fontWeight: '700',
		color: colors.navy,
	},
	toggleHint: {
		marginTop: 2,
		fontSize: fontSizes.body,
		color: colors.navyTextMuted,
	},
	footer: {
		marginTop: 8,
		gap: 10,
	},
});
