import { TextInput, TextInputProps, StyleSheet } from "react-native";
import { colors, fonts } from "../constants/theme";

export function AppTextInput({ style, ...props }: TextInputProps) {
  return <TextInput style={[styles.base, style]} {...props} placeholderTextColor={colors.navyTextDisabled} />;
}

const styles = StyleSheet.create({
  base: {
    fontFamily: fonts.bold,
    fontWeight: "900",
  },
});
