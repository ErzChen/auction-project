import { useEffect, useRef, useState } from 'react';
import gavelLogo from '../../images/gavel-logo.png';
import { useAuthContext } from '../context/AuthContext.js';
import '../styles/top-bar.css';

function TopBar() {
	function handleProfileClick(e) {
		e.preventDefault();
		if (!user) {
			window.location.href = '/auth';
			return;
		}
		setMenuOpen((prev) => !prev);
	}

	async function handleLogout() {
		setMenuOpen(false);
		if (logout) await logout();
		window.location.href = '/auth';
	}

	function handleDeleteClick() {
		setDeleteMenuOpen(true);
		setMenuOpen(false);
	}

	function handleCancelDelete() {
		setDeleteMenuOpen(false);
	}

	async function handleConfirmDelete() {
		try {
			await fetch(`${CONFIG.API_BASE}/api/delete`, {
				method: 'DELETE',
				credentials: 'include',
			});
		} catch (err) {
			console.error('Failed to delete account', err);
		} finally {
			logout();
		}
		window.location.href = '/auth';
	}

	const auth = useAuthContext();
	const user = auth?.user;
	const logout = auth?.logout;

	const [menuOpen, setMenuOpen] = useState(false);
	const [deleteMenuOpen, setDeleteMenuOpen] = useState(false);
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

	return (
		<section className="top-bar">
			<div className="top-bar-branding">
				<img src={gavelLogo} alt="Gavel logo" className="top-bar-logo" />
				<span>Erz's Auction</span>
			</div>
			<nav className="top-bar-nav">
				<a className="nav-button" href="/">
					<span>Listings</span>
				</a>
				<a className="nav-button" href="/about">
					<span>About Us</span>
				</a>
				<a className="nav-button" href="/help">
					<span>Help</span>
				</a>
				<div ref={profileRef} style={{ display: 'contents' }}>
					<a
						className="nav-button profile-trigger"
						onClick={handleProfileClick}
						aria-haspopup="true"
						aria-expanded={menuOpen}
						aria-label="Account menu"
					>
						<span>
							<i className="fa-duotone fa-solid fa-circle-user user-profile"></i>
						</span>
					</a>
					{user && menuOpen && (
						<div className="profile-menu">
							<button
								type="button"
								className="profile-menu-item"
								onClick={() => (window.location.href = `/profile/${user.id}`)}
							>
								<i className="fa-solid fa-user" aria-hidden="true"></i>
								Profile
							</button>
							<button
								type="button"
								className="profile-menu-item profile-menu-item-danger"
								onClick={handleLogout}
							>
								<i className="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
								Logout
							</button>
							<button
								type="button"
								className="profile-menu-item profile-menu-item-danger"
								onClick={handleDeleteClick}
							>
								<i className="fa-solid fa-trash" aria-hidden="true"></i>
								Delete Account
							</button>
						</div>
					)}
				</div>
			</nav>
			{deleteMenuOpen && (
				<>
					<div className="modal-overlay" onClick={handleCancelDelete}></div>
					<div className="modal">
						<button
							type="button"
							className="modal-close-btn"
							onClick={handleCancelDelete}
							aria-label="Close"
						>
							<i className="fa-solid fa-xmark"></i>
						</button>
						<h2 className="modal-title">
							Are you sure you want to delete your account?
						</h2>
						<div className="modal-actions">
							<button
								type="button"
								className="submit submit-success"
								onClick={handleConfirmDelete}
							>
								Yes
							</button>
							<button
								type="button"
								className="submit submit-urgent"
								onClick={handleCancelDelete}
							>
								No
							</button>
						</div>
					</div>
				</>
			)}
		</section>
	);
}

export default TopBar;
