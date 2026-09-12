import { Pressable, View } from 'react-native';
import { auctionSearchStyles as styles } from '../styles/topBar';
import { AppText } from './AppText';
import { sharedStyles } from '../styles/shared';
import { FontAwesome6 } from '@expo/vector-icons';
import { AppTextInput } from './AppTextInput';
import { useRef, useState } from 'react';
import { useAuctionContext } from '../context/AuctionContext';

export function AuctionSearch() {
	const [focused, setFocused] = useState(false);
	const keywordRef = useRef(null);
    const { keyword, setKeyword } = useAuctionContext();

    const hasKeyword = keyword.length > 0;

	return (
		<View style={styles.bar}>
			<View style={[sharedStyles.field, { marginBottom: 0, width: "90%" }]}>
				<Pressable 
                    style={[
                        sharedStyles.inputWrap,
                        focused && sharedStyles.inputWrapFocused,
                    ]}
                    onPress={() => keywordRef.current?.focus()}
                >
					<FontAwesome6 name="magnifying-glass" style={sharedStyles.inputIcon} />
					<AppTextInput
						ref={keywordRef}
						style={sharedStyles.inputControl}
                        value={keyword}
                        onChangeText={setKeyword}
                        placeholder='Search keywords...'
                        autoCapitalize='none'
                        onFocus={() => setFocused(true)}
						onBlur={() => setFocused(false)}
					/>
                    {hasKeyword && (
                        <Pressable
                            onPress={() => setKeyword('')}
                        >
					        <FontAwesome6 name="xmark" style={sharedStyles.inputIcon} />
                        </Pressable>
                    )}
				</Pressable>
			</View>
		</View>
	);
}
