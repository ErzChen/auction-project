import { useEffect, useRef, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { barStyles as styles } from '../styles/bar';
import { Image, Pressable, View } from 'react-native';
import { AppText } from './AppText';
import { FontAwesome6 } from '@expo/vector-icons';
import { AuctionSearch } from './AuctionSearch';

const gavelLogo = require('../assets/images/gavel-logo.png');

function Bar() {
	const auth = useAuthContext();
	const user = auth?.user;
	const logout = auth?.logout;

	const [menuOpen, setMenuOpen] = useState(false);
    const [hovered, setHovered] = useState('');
	const profileRef = useRef(null);

	useEffect(() => {
		function handleClickOutside(e) {
			if (profileRef.current && !profileRef.current.contains(e.target)) {
				setMenuOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	function handleProfileClick(e) {
		e.preventDefault();
		setMenuOpen((prev) => !prev);
	}

	async function handleLogout() {
		setMenuOpen(false);
		if (logout) await logout();
	}

	return (
		<View style={[styles.bar, { bottom: 0 }]}>
			<Pressable
				onHoverIn={() => setHovered('house')}
				onHoverOut={() => setHovered('')}
				style={[styles.navButton, styles.profileTrigger]}
			>
				<FontAwesome6 name="house" style={[
					styles.userProfileIcon,
					hovered == 'house' && styles.navButtonTextHover,
				]} />
			</Pressable>
			<Pressable
				onHoverIn={() => setHovered('add')}
				onHoverOut={() => setHovered('')}
				style={[styles.navButton, styles.profileTrigger]}
			>
				<FontAwesome6 name="add" style={[
					styles.userProfileIcon,
					hovered == 'add' && styles.navButtonTextHover,
				]} />
			</Pressable>
			<View ref={profileRef} style={{ display: 'contents' }}>
				<Pressable
					onHoverIn={() => setHovered('circle-user')}
					onHoverOut={() => setHovered('')}
					style={[styles.navButton, styles.profileTrigger]}
					onPress={handleProfileClick}
				>
					<FontAwesome6 name="circle-user" style={[
						styles.userProfileIcon,
						hovered == 'circle-user' && styles.navButtonTextHover,
					]} />
				</Pressable>
				{user && menuOpen && (
					<View style={styles.profileMenu}>
						<Pressable style={styles.profileMenuItem} onPress={handleLogout}>
							<FontAwesome6
								name="right-from-bracket"
								style={styles.profileMenuItemDangerText}
							/>
							<AppText>
								Logout
							</AppText>
						</Pressable>
					</View>
				)}
			</View>
		</View>
	);
}

export default Bar;
