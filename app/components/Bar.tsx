import { useEffect, useRef, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { barStyles as styles } from '../styles/bar';
import { GestureResponderEvent, Image, Pressable, View } from 'react-native';
import { AppText } from './AppText';
import { FontAwesome6 } from '@expo/vector-icons';

function Bar({
	onHome,
	onAdd,
	setDeleteMenuOpen,
}: {
	onHome: () => void;
	onAdd: () => void;
	setDeleteMenuOpen: (open: boolean) => void;
}) {
	function handleProfileClick(e: GestureResponderEvent) {
		e.preventDefault();
		setMenuOpen((prev) => !prev);
	}

	function handleDeleteClick(e: GestureResponderEvent) {
		e.preventDefault();
		setDeleteMenuOpen(true);
		setMenuOpen(false);
	}

	async function handleLogout() {
		setMenuOpen(false);
		if (logout) await logout();
	}

	const [menuOpen, setMenuOpen] = useState(false);
	const [hovered, setHovered] = useState('');
	const profileRef = useRef<any>(null);
	const { logout } = useAuthContext();

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (profileRef.current && !(profileRef.current as any).contains(e.target)) {
				setMenuOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	return (
		<View style={[styles.bar, { bottom: 0 }]}>
			<Pressable
				onHoverIn={() => setHovered('house')}
				onHoverOut={() => setHovered('')}
				style={[styles.navButton, styles.profileTrigger]}
				onPress={onHome}
			>
				<FontAwesome6
					name="house"
					style={[
						styles.userProfileIcon,
						hovered == 'house' && styles.navButtonTextHover,
					]}
				/>
			</Pressable>
			<Pressable
				onHoverIn={() => setHovered('add')}
				onHoverOut={() => setHovered('')}
				style={[styles.navButton, styles.profileTrigger]}
				onPress={onAdd}
			>
				<FontAwesome6
					name="add"
					style={[
						styles.userProfileIcon,
						hovered == 'add' && styles.navButtonTextHover,
					]}
				/>
			</Pressable>
			<View ref={profileRef} style={{ display: 'contents' }}>
				<Pressable
					onHoverIn={() => setHovered('circle-user')}
					onHoverOut={() => setHovered('')}
					style={[styles.navButton, styles.profileTrigger]}
					onPress={handleProfileClick}
				>
					<FontAwesome6
						name="circle-user"
						style={[
							styles.userProfileIcon,
							hovered == 'circle-user' && styles.navButtonTextHover,
						]}
					/>
				</Pressable>
				{menuOpen && (
					<View style={styles.profileMenu}>
						<Pressable style={styles.profileMenuItem} onPress={handleDeleteClick}>
							<FontAwesome6 name="trash" style={styles.profileMenuItemDangerText} />
							<AppText bold>Delete Account</AppText>
						</Pressable>
						<Pressable style={styles.profileMenuItem} onPress={handleLogout}>
							<FontAwesome6
								name="right-from-bracket"
								style={styles.profileMenuItemDangerText}
							/>
							<AppText bold>Logout</AppText>
						</Pressable>
					</View>
				)}
			</View>
		</View>
	);
}

export default Bar;
