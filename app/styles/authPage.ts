import { StyleSheet } from 'react-native';
import { colors, fontSizes } from '../constants/theme';

export const authPageStyles = StyleSheet.create({
	page: {
		flex: 1,
		flexDirection: 'row',
		width: '100%',
	},
	brandPanel: {
		width: '38%',
		height: '100%',
		padding: 40,
		backgroundColor: colors.navy,
		justifyContent: 'space-between',
		overflow: 'hidden',
	},
	branding: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	brandingText: {
		fontWeight: '800',
		fontSize: fontSizes.title,
		color: colors.whiteTextPrimary,
	},
	brandLogo: {
		height: 50,
		width: 50,
		resizeMode: 'contain',
	},
	listingDisplay: {
		flex: 1,
		marginVertical: 40,
		overflow: 'hidden',
	},
	listingRowItem: {
		paddingVertical: 10,
		fontSize: fontSizes.label,
		letterSpacing: 0.5,
		color: colors.whiteTextMuted,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(250, 248, 244, 0.08)',
	},
});
