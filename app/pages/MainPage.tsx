import { useState } from 'react';
import { AuctionListings } from '../components/AuctionListings';
import { AuctionSearch } from '../components/AuctionSearch';
import Bar from '../components/Bar';
import { barStyles } from '../styles/bar';
import { AuctionProvider } from '../context/AuctionProvider';
import CreatePage from './CreatePage';
import { Auction, HomeView } from '../constants/types';
import { Pressable, View } from 'react-native';
import { colors, vh, vw } from '../constants/theme';
import { FontAwesome6 } from '@expo/vector-icons';
import { AppText } from '../components/AppText';
import { sharedStyles } from '../styles/shared';
import { useAuthContext } from '../context/AuthContext';

export default function MainPage() {
	function handleCancel(e) {
		e.preventDefault();
		setDeleteMenuOpen(false);
	}

	async function handleDelete(e) {
		e.preventDefault();
        try {
            await fetch(
                `${process.env.EXPO_PUBLIC_API_BASE}/api/delete`,
                {
                    method: "DELETE",
                    headers: {
                        'X-Auction-Application-Key': process.env.EXPO_PUBLIC_SECRET_KEY,
                        Authorization: `Bearer ${token}`,
                    }
                },
            );
        } catch (err) {
            console.error(err);
        } finally {
            logout();
        }
	}

	const [view, setView] = useState<HomeView>({ mode: 'listings' });
	const [deleteMenuOpen, setDeleteMenuOpen] = useState(false);
	const [yesHover, setYesHover] = useState(false);
	const [noHover, setNoHover] = useState(false);

	const goHome = () => setView({ mode: 'listings' });
	const goCreate = () => setView({ mode: 'create' });
	const goEdit = (auction: Auction) => setView({ mode: 'edit', auction });

	const { user, token, logout } = useAuthContext();
    const userId = user.id;

	if (view.mode === 'create' || view.mode === 'edit') {
		return (
			<AuctionProvider>
				<CreatePage
					auction={view.mode === 'edit' ? view.auction : undefined}
					onCreated={goHome}
					onCancel={goHome}
				/>
				<Bar
					onHome={goHome}
					onAdd={goCreate}
					setDeleteMenuOpen={setDeleteMenuOpen}
				/>
			</AuctionProvider>
		);
	}

	return (
		<AuctionProvider>
			<AuctionSearch />
			<AuctionListings onEdit={goEdit} />
			<Bar
				onHome={goHome}
				onAdd={goCreate}
				setDeleteMenuOpen={setDeleteMenuOpen}
			/>
			{deleteMenuOpen && (
				<>
					<Pressable
						onPress={() => setDeleteMenuOpen(false)}
						style={barStyles.overlay}
					></Pressable>
					<View
						style={{
							position: 'absolute',
							width: vw(100),
							height: vh(100),
							justifyContent: 'center',
							alignItems: 'center',
							zIndex: 3,
						}}
					>
						<View style={barStyles.modal}>
							<Pressable
								onPress={() => setDeleteMenuOpen(false)}
								style={barStyles.closeBtn}
							>
								<FontAwesome6 name="xmark" style={barStyles.closeBtnIcon} />
							</Pressable>
							<AppText bold style={barStyles.title}>
								Are you sure you want to delete your account?
							</AppText>
							<View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
								<Pressable
									style={[
										sharedStyles.submit,
										{
											backgroundColor: yesHover ? colors.successHover : colors.success,
											width: '20%',
										},
									]}
									onHoverIn={() => setYesHover(true)}
									onHoverOut={() => setYesHover(false)}
                                    onPress={handleDelete}
								>
									<AppText bold>Yes</AppText>
								</Pressable>
								<Pressable
									style={[
										sharedStyles.submit,
										{
											backgroundColor: noHover ? colors.urgentHover : colors.urgent,
											width: '20%',
										},
									]}
									onHoverIn={() => setNoHover(true)}
									onHoverOut={() => setNoHover(false)}
                                    onPress={handleCancel}
								>
									<AppText>No</AppText>
								</Pressable>
							</View>
						</View>
					</View>
				</>
			)}
		</AuctionProvider>
	);
}
