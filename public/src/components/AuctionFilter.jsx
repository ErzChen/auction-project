import { useState } from 'react';
import '../styles/auction-filter.css';
import { DEFAULT_FILTERS, useAuctionContext } from '../context/AuctionContext.js';

const CATEGORIES = [
	'All categories',
	'Furniture',
	'Art',
	'Jewelry',
	'Collectibles',
	'Electronics',
	'Vehicles',
	'Other',
];

const STATUSES = [
	{ value: 'upcoming', label: 'Upcoming' },
	{ value: 'active', label: 'Active' },
	{ value: 'sold', label: 'Sold' },
	{ value: 'expired', label: 'Expired' },
];

export function AuctionFilter({ userId = null }) {
	const { applyFilters, resetFilters } = useAuctionContext();
	const [pendingFilters, setPendingFilters] = useState({
		...DEFAULT_FILTERS,
		user_id: userId || null,
	});

	const hasFilters = pendingFilters.statuses.length !== DEFAULT_FILTERS.statuses.length ||
		!DEFAULT_FILTERS.statuses.every((s) => pendingFilters.statuses.includes(s)) ||
		pendingFilters.category !== DEFAULT_FILTERS.category ||
		pendingFilters.keyword !== DEFAULT_FILTERS.keyword ||
		pendingFilters.start_price !== DEFAULT_FILTERS.start_price ||
		pendingFilters.end_price !== DEFAULT_FILTERS.end_price;

	function handleFieldChange(field, value) {
		setPendingFilters((prev) => ({ ...prev, [field]: value }));
	}

	function handleApply(e) {
		e.preventDefault();
		applyFilters({...pendingFilters, user_id: userId || null});
	}

	function handleReset() {
		setPendingFilters({ ...DEFAULT_FILTERS, user_id: userId || null });
		resetFilters({ user_id: userId || null });
	}

	function toggleStatuses(value) {
		setPendingFilters((prev) => ({
			...prev,
			statuses: prev.statuses.includes(value)
				? prev.statuses.filter((s) => s !== value)
				: [...prev.statuses, value],
		}));
	}

	return (
		<aside className="auction-filtering-section">
			<form className="filter-form" onSubmit={handleApply}>
				<h2 className="filter-heading">Filter listings</h2>

				<label className="field">
					<span>Search</span>
					<span className="input-wrap">
						<i className="fa-solid fa-magnifying-glass input-icon" aria-hidden="true"></i>
						<input
							type="search"
							placeholder="Search by title…"
							value={pendingFilters.keyword}
							onChange={(e) => handleFieldChange('keyword', e.target.value)}
						/>
					</span>
				</label>

				<label className="field">
					<span>Category</span>
					<span className="input-wrap">
						<select
							value={pendingFilters.category}
							onChange={(e) =>
								handleFieldChange(
									'category',
									e.target.value === 'All categories' ? '' : e.target.value,
								)
							}
						>
							{CATEGORIES.map((c) => (
								<option key={c} value={c === 'All categories' ? '' : c}>
									{c}
								</option>
							))}
						</select>
					</span>
				</label>

				<fieldset className="field status-group">
					<span>Status</span>
					<div className="status-pills">
						{STATUSES.map((s) => (
							<button
								type="button"
								key={s.value}
								className={`status-pill ${
									pendingFilters.statuses.includes(s.value) ? 'active' : ''
								}`}
								onClick={() => toggleStatuses(s.value)}
							>
								{s.label}
							</button>
						))}
					</div>
				</fieldset>

				<div className="field">
					<span>Price range</span>
					<div className="filter-price-inputs">
						<span className="input-wrap">
							<span>$</span>
							<input
								type="number"
								min="0"
								placeholder="Min"
								value={pendingFilters.start_price}
								onChange={(e) => handleFieldChange('start_price', e.target.value)}
							/>
						</span>
						<span>–</span>
						<span className="input-wrap">
							<span>$</span>
							<input
								type="number"
								min="0"
								placeholder="Max"
								value={pendingFilters.end_price}
								onChange={(e) => handleFieldChange('end_price', e.target.value)}
							/>
						</span>
					</div>
				</div>

				<button type="submit" className="submit">
					Apply filters
				</button>
				{hasFilters && (
					<button type="button" className="filter-reset-btn" onClick={handleReset}>
						Clear all
					</button>
				)}
			</form>
		</aside>
	);
}

export default AuctionFilter;