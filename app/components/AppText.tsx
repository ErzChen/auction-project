import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";
import { fonts } from "../constants/theme";

type AppTextProps = TextProps & {
  bold?: boolean;
};

export function AppText({ style, bold, ...props }: AppTextProps) {
  return <Text style={[styles.base, bold && styles.bold, style]} {...props} />;
}

const styles = StyleSheet.create({
  base: {
    fontFamily: fonts.regular,
  },
  bold: {
    fontFamily: fonts.bold,
  },
});
