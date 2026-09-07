import { StyleSheet } from 'react-native';
import { colors, vh } from '../constants/theme';

export const mainPageStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: vh(90),
    marginTop: vh(10),
  },
});
