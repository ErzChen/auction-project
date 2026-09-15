import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/help-page.css';
import '../styles/themes.css';
import TopBar from '../components/TopBar';

export function HelpPage() {
	return (
		<>
			<TopBar />
			<section className="search-section">
				<h1>Erz's Auction Help Page</h1>
				<label className="field">
					<span className="input-wrap">
						<i
							className="fa-solid fa-magnifying-glass input-icon"
							aria-hidden="true"
						></i>
						<input type="search" placeholder="Search for pages…" />
					</span>
				</label>
			</section>
			<section className="help-page">
				<div class="category-grid">
					<button type="button" class="category-card">
						<i class="fa-solid fa-gavel category-icon" aria-hidden="true"></i>
						<h2 class="category-title">Bidding & Auctions</h2>
						<p class="category-description">
							Placing bids, proxy bidding, and what happens when an auction ends.
						</p>
						<span class="category-count">12 articles</span>
					</button>
					<button type="button" class="category-card">
						<i class="fa-solid fa-credit-card category-icon" aria-hidden="true"></i>
						<h2 class="category-title">Payments & Fees</h2>
						<p class="category-description">
							Accepted payment methods, buyer premiums, and invoicing.
						</p>
						<span class="category-count">9 articles</span>
					</button>
					<button type="button" class="category-card">
						<i class="fa-solid fa-box category-icon" aria-hidden="true"></i>
						<h2 class="category-title">Shipping & Pickup</h2>
						<p class="category-description">
							Delivery windows, local pickup, and packaging for fragile lots.
						</p>
						<span class="category-count">7 articles</span>
					</button>
					<button type="button" class="category-card">
						<i class="fa-solid fa-user-shield category-icon" aria-hidden="true"></i>
						<h2 class="category-title">Account & Verification</h2>
						<p class="category-description">
							Identity checks, password resets, and managing saved cards.
						</p>
						<span class="category-count">6 articles</span>
					</button>
					<button type="button" class="category-card">
						<i class="fa-solid fa-rotate-left category-icon" aria-hidden="true"></i>
						<h2 class="category-title">Returns & Disputes</h2>
						<p class="category-description">
							Filing a claim, item condition disagreements, and refunds.
						</p>
						<span class="category-count">8 articles</span>
					</button>
					<button type="button" class="category-card">
						<i class="fa-solid fa-store category-icon" aria-hidden="true"></i>
						<h2 class="category-title">Selling on Erz</h2>
						<p class="category-description">
							Listing an item, setting a reserve, and seller payouts.
						</p>
						<span class="category-count">11 articles</span>
					</button>
				</div>

				<div className="help-columns">
					<div className="help-column">
						<h2 className="section-heading">Popular articles</h2>
						<ul class="article-list">
							<li class="list-item">
								<button type="button" class="article-link">
									<span>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</span>
									<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
								</button>
							</li>
							<li class="list-item">
								<button type="button" class="article-link">
									<span>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</span>
									<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
								</button>
							</li>
							<li class="list-item">
								<button type="button" class="article-link">
									<span>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</span>
									<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
								</button>
							</li>
							<li class="list-item">
								<button type="button" class="article-link">
									<span>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</span>
									<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
								</button>
							</li>
							<li class="list-item">
								<button type="button" class="article-link">
									<span>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</span>
									<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
								</button>
							</li>
						</ul>
					</div>

					<div className="help-column">
						<h2 className="section-heading">Frequently asked</h2>
						<ul class="article-list">
							<li class="list-item">
								<button type="button" class="article-link">
									<span>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</span>
									<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
								</button>
							</li>
							<li class="list-item">
								<button type="button" class="article-link">
									<span>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</span>
									<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
								</button>
							</li>
							<li class="list-item">
								<button type="button" class="article-link">
									<span>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</span>
									<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
								</button>
							</li>
							<li class="list-item">
								<button type="button" class="article-link">
									<span>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</span>
									<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
								</button>
							</li>
							<li class="list-item">
								<button type="button" class="article-link">
									<span>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</span>
									<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
								</button>
							</li>
						</ul>
					</div>
				</div>

				<div className="contact-card">
					<div className="contact-copy">
						<h2 className="section-heading">Still need help?</h2>
						<p className="contact-description">
							Our support team can look into a specific order, bid, or listing on your
							account.
						</p>
					</div>
					<div className="contact-actions">
						<button type="button" className="submit">
							Contact support
						</button>
					</div>
				</div>
			</section>
		</>
	);
}

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<HelpPage />
	</StrictMode>,
);
