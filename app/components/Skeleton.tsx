import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
  Easing,
} from "react-native-reanimated";
import { StyleSheet, ViewStyle } from "react-native";
import { colors } from "../constants/theme";

const BASE_COLOR = colors.surface;
const HIGHLIGHT_COLOR = "#f1ede3";

interface SkeletonProps {
  style?: ViewStyle | ViewStyle[];
}

export function Skeleton({ style }: SkeletonProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [BASE_COLOR, HIGHLIGHT_COLOR]
    ),
  }));

  return <Animated.View style={[styles.base, animatedStyle, style]} />;
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
  },
});