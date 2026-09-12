import { forwardRef } from "react";
import { TextInput, TextInputProps, StyleSheet } from "react-native";
import { colors, fonts } from "../constants/theme";

export const AppTextInput = forwardRef<TextInput, TextInputProps>(
  function AppTextInput({ style, ...props }, ref) {
    return (
      <TextInput
        ref={ref}
        style={[styles.base, style]}
        {...props}
        placeholderTextColor={colors.navyTextDisabled}
      />
    );
  },
);

const styles = StyleSheet.create({
  base: {
    fontFamily: fonts.bold,
    fontWeight: "900",
  },
});
