import { StyleSheet } from 'react-native';
import { colors, vh } from '../constants/theme';

export const profilePageStyles = StyleSheet.create({
  page: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: vh(90),
    marginTop: vh(10),
    backgroundColor: colors.bg,
  },
});
