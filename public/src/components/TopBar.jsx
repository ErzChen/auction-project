import { useEffect, useRef, useState } from 'react';
import gavelLogo from '../../images/gavel-logo.png';
import { useAuthContext } from '../context/AuthContext.js';
import '../styles/top-bar.css';

function TopBar() {
	const auth = useAuthContext();
	const user = auth?.user;
	const logout = auth?.logout;

	const [menuOpen, setMenuOpen] = useState(false);
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
		if (!user) {
			window.location.href = '/pages/auth.html';
			return;
		}
		setMenuOpen((prev) => !prev);
	}

	async function handleLogout() {
		setMenuOpen(false);
		if (logout) await logout();
		window.location.href = '/pages/auth.html';
	}

	return (
		<section className="top-bar">
			<div className="top-bar-branding">
				<img src={gavelLogo} alt="Gavel logo" className="top-bar-logo" />
				<span>Erz's Auction</span>
			</div>
			<nav className="top-bar-nav">
				<a className="nav-button"><span>Listings</span></a>
				<a className="nav-button"><span>About Us</span></a>
				<a className="nav-button"><span>Help</span></a>
				<div ref={profileRef} style={{ display: 'contents' }}>
          <a
						href="#"
						className="nav-button profile-trigger"
						role="button"
						onClick={handleProfileClick}
						aria-haspopup="true"
						aria-expanded={menuOpen}
						aria-label="Account menu"
					>
						<span><i className="fa-duotone fa-solid fa-circle-user user-profile"></i></span>
					</a>
					{user && menuOpen && (
						<div className="profile-menu">
							<button type="button" className="profile-menu-item">
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
						</div>
					)}
				</div>
			</nav>
		</section>
	);
}

export default TopBar;