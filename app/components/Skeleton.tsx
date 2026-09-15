import { useEffect, useState, useCallback } from 'react';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
	Easing,
	withSequence,
	withDelay,
} from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/theme';

export function Skeleton({ style }: { style?: any }) {
	const translateX = useSharedValue(0);
	const [containerWidth, setContainerWidth] = useState(0);

	const onLayout = useCallback((e: any) => {
		setContainerWidth(e.nativeEvent.layout.width);
	}, []);

	useEffect(() => {
		if (containerWidth === 0) return;
		translateX.value = -containerWidth;
		translateX.value = withRepeat(
			withSequence(
				withTiming(containerWidth, { duration: 600, easing: Easing.linear }),
				withDelay(1000, withTiming(-containerWidth, { duration: 0 })),
			),
			-1,
			false,
		);
	}, [containerWidth]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
	}));

	return (
		<View
			style={[styles.base, style, { backgroundColor: colors.surface }]}
			onLayout={onLayout}
		>
			{containerWidth > 0 && (
				<Animated.View
					style={[
						StyleSheet.absoluteFill,
						animatedStyle,
						{ width: containerWidth * 3, left: -containerWidth },
					]}
				>
					<LinearGradient
						colors={[colors.surface, '#f1ede3', colors.surface]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 0 }}
						style={StyleSheet.absoluteFill}
					/>
				</Animated.View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	base: {
		overflow: 'hidden',
	},
});
