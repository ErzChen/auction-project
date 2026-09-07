import { insertAuction, setAuctionWinner } from './middleware/auctions-db.js';
import { insertUser } from './middleware/users-db.js';
import db from './middleware/db.js';
import { incrementFor, insertBid } from './middleware/bids-db.js';

const DEFAULT_INCREMENT_RULES = JSON.stringify([
	{ min: 0, max: 500, increment: 25 },
	{ min: 500, max: 2000, increment: 100 },
	{ min: 2000, max: 10000, increment: 250 },
	{ min: 10000, max: null, increment: 500 },
]);

const now = new Date();

function dt(offsetDays = 0, offsetHours = 0, offsetMinutes = 0) {
  const ms = now.getTime() 
    + (offsetDays * 24 * 60 * 60 * 1000) 
    + (offsetHours * 60 * 60 * 1000) 
    + (offsetMinutes * 60 * 1000);
    
  return new Date(ms).toISOString();
}

function seedBidsForAuction(
	auctionId,
	auction,
	ownerId,
	startingPrice,
	currentPrice,
) {
	const rules = JSON.parse(
		auction.bid_increment_rules ?? DEFAULT_INCREMENT_RULES,
	);
	const bidderPool = Array.from({ length: 12 }, (_, i) => i + 1).filter(
		(id) => id !== ownerId,
	);

	const amounts = [];
	let price = startingPrice;
	while (price < currentPrice) {
		price = Math.min(price + incrementFor(rules, price), currentPrice);
		amounts.push(price);
	}
	if (amounts.length === 0) amounts.push(currentPrice);

	let lastBidId = null;
	let lastBidderId = null;
	amounts.forEach((amount, i) => {
		const bidderId = bidderPool[(auctionId + i) % bidderPool.length];
		const isLast = i === amounts.length - 1;
		const isCancelled = auctionId % 3 === 0 && !isLast && i === 0;

		const { lastInsertRowid: bidId } = insertBid.run({
			auction_id: auctionId,
			user_id: bidderId,
			amount,
			is_winning: isLast && !isCancelled ? 1 : 0,
			is_cancelled: isCancelled ? 1 : 0,
		});

		if (isLast) {
			lastBidId = bidId;
			lastBidderId = bidderId;
		}
	});

	return { lastBidId, lastBidderId };
}

function deriveStartingPrice(a) {
	if (a.status === 'upcoming') return a.price;
	const lowered = Math.round((a.price * 0.65) / 5) * 5;
	return Math.max(lowered, 10);
}

function seedAuction(a) {
	const row = {
		user_id: a.user_id,
		starting_price: deriveStartingPrice(a),
		current_price: a.price,
		bid_increment_rules: a.bid_increment_rules ?? DEFAULT_INCREMENT_RULES,
		currency: a.currency ?? 'USD',
		title: a.title,
		description: a.description,
		condition: a.condition ?? null,
		category: a.category,
		image_paths: JSON.stringify(a.images ?? []),
		location: a.location,
		is_shipping_available: a.is_shipping_available ? 1 : 0,
		shipping_pickup_description:
			a.shipping_pickup_description ??
			(a.is_shipping_available
				? 'Ships to buyer; local pickup also available on request.'
				: 'Local pickup only; contact seller to arrange.'),
		shipping_cost: a.shipping_cost ?? null,
		start_time: a.start_time,
		end_time: a.end_time,
		status: a.status,
	};

	const { lastInsertRowid: auctionId } = insertAuction.run(row);

	if (a.status === 'active' || a.status === 'sold') {
		const { lastBidId, lastBidderId } = seedBidsForAuction(
			auctionId,
			row,
			a.user_id,
			row.starting_price,
			row.current_price,
		);

		if (a.status === 'sold' && lastBidId) {
			setAuctionWinner.run(lastBidderId, lastBidId, auctionId);
		}
	}
}

export function seedDatabase() {
	const { n: userCount } = db.prepare('SELECT COUNT(*) n FROM users').get();
	if (userCount > 0) {
		console.log('Database already has data, skipping seed.');
		return;
	}

	for (let i = 1; i <= 12; i++) {
		insertUser.run(`user${i}`, `user${i}@example.com`, `placeholder_hash_${i}`);
	}

	const auctions = [
		{
			user_id: 1,
			price: 450.0,
			title: 'Vintage Leather Armchair',
			description: 'Mid-century brown leather, minor wear on arms',
			condition: 'Good',
			location: 'Portland, OR',
			category: 'furniture',
			start_time: dt(-12, 9),
			end_time: dt(-5, 9),
			status: 'sold',
			images: ['/img/1a.jpg'],
			is_shipping_available: true,
			shipping_cost: 25,
		},
		{
			user_id: 2,
			price: 1850.0,
			title: 'MacBook Pro 16" 2021',
			description: '32GB RAM, 1TB SSD, battery health 92%',
			condition: 'Excellent',
			location: 'San Francisco, CA',
			category: 'electronics',
			start_time: dt(-11, 12),
			end_time: dt(-4, 12),
			status: 'sold',
			images: ['/img/2a.jpg', '/img/2b.jpg'],
			is_shipping_available: true,
			shipping_cost: 25,
		},
		{
			user_id: 3,
			price: 180.0,
			title: 'Hand-Thrown Ceramic Vase Set',
			description: 'Set of 3, glazed in cobalt blue',
			condition: 'New',
			location: 'Austin, TX',
			category: 'home',
			start_time: dt(-13, 15, 30),
			end_time: dt(-6, 15, 30),
			status: 'sold',
			images: ['/img/3a.jpg'],
			is_shipping_available: true,
			shipping_cost: 15,
		},
		{
			user_id: 1,
			price: 4200.0,
			title: 'Fender Stratocaster 1978',
			description: 'Original pickups, refinished body',
			condition: 'Good',
			location: 'Nashville, TN',
			category: 'music',
			start_time: dt(-17, 10),
			end_time: dt(-10, 10),
			status: 'sold',
			images: ['/img/4a.jpg', '/img/4b.jpg', '/img/4c.jpg'],
			is_shipping_available: true,
			shipping_cost: 60,
		},
		{
			user_id: 4,
			price: 3100.0,
			title: 'Trek Domane SL5 Road Bike',
			description: 'Size 56cm, carbon frame, 2023 model',
			condition: 'Excellent',
			location: 'Denver, CO',
			category: 'sporting goods',
			start_time: dt(-10, 8),
			end_time: dt(-3, 8),
			status: 'sold',
			images: ['/img/5a.jpg'],
			is_shipping_available: false,
		},
		{
			user_id: 5,
			price: 650.0,
			title: 'Signed First Edition Novel',
			description: 'Author signature verified, dust jacket intact',
			condition: 'Excellent',
			location: 'Boston, MA',
			category: 'books',
			start_time: dt(-9, 11),
			end_time: dt(-2, 11),
			status: 'sold',
			images: [],
			is_shipping_available: true,
			shipping_cost: 10,
		},
		{
			user_id: 2,
			price: 7800.0,
			title: 'Rolex Datejust 36mm',
			description: 'Stainless steel, box and papers included',
			condition: 'Excellent',
			location: 'New York, NY',
			category: 'jewelry',
			start_time: dt(-22, 9),
			end_time: dt(-15, 9),
			status: 'sold',
			images: ['/img/7a.jpg'],
			is_shipping_available: true,
			shipping_cost: 50,
		},
		{
			user_id: 6,
			price: 2200.0,
			title: 'Antique Persian Rug',
			description: '9x12ft, hand-knotted wool, early 1900s',
			condition: 'Good',
			location: 'Santa Fe, NM',
			category: 'home',
			start_time: dt(-8, 7),
			end_time: dt(-1, 7),
			status: 'sold',
			images: ['/img/8a.jpg', '/img/8b.jpg'],
			is_shipping_available: false,
		},
		{
			user_id: 3,
			price: 4500.0,
			title: 'Nikon Z9 Mirrorless Camera',
			description: 'Body only, under 5k shutter count',
			condition: 'Excellent',
			location: 'Seattle, WA',
			category: 'electronics',
			start_time: dt(-14, 14),
			end_time: dt(-7, 14),
			status: 'sold',
			images: ['/img/9a.jpg'],
			is_shipping_available: true,
			shipping_cost: 20,
		},
		{
			user_id: 7,
			price: 1600.0,
			title: 'Handmade Walnut Dining Table',
			description: 'Seats 8, live edge, custom build',
			condition: 'New',
			location: 'Asheville, NC',
			category: 'furniture',
			start_time: dt(-16, 13),
			end_time: dt(-9, 13),
			status: 'sold',
			images: ['/img/10a.jpg'],
			is_shipping_available: false,
		},
		{
			user_id: 4,
			price: 550.0,
			title: 'PlayStation 5 Bundle',
			description: 'Console, 2 controllers, 5 games',
			condition: 'Good',
			location: 'Chicago, IL',
			category: 'electronics',
			start_time: dt(-9, 16),
			end_time: dt(-2, 16),
			status: 'sold',
			images: ['/img/11a.jpg', '/img/11b.jpg'],
			is_shipping_available: true,
			shipping_cost: 15,
		},
		{
			user_id: 8,
			price: 950.0,
			title: 'Original Oil Landscape Painting',
			description: '24x36in, framed, artist unknown',
			condition: 'Good',
			location: 'Providence, RI',
			category: 'art',
			start_time: dt(-18, 10, 30),
			end_time: dt(-11, 10, 30),
			status: 'sold',
			images: ['/img/12a.jpg'],
			is_shipping_available: true,
			shipping_cost: 30,
		},
		{
			user_id: 5,
			price: 320.0,
			title: 'Kitchenaid Stand Mixer',
			description: 'Professional 600 series, 6qt bowl',
			condition: 'Excellent',
			location: 'Minneapolis, MN',
			category: 'home',
			start_time: dt(-8, 6),
			end_time: dt(-1, 6),
			status: 'sold',
			images: ['/img/13a.jpg'],
			is_shipping_available: true,
			shipping_cost: 12,
		},
		{
			user_id: 9,
			price: 150.0,
			title: 'Vintage Rolex Submariner Box',
			description: 'Box and papers only, no watch',
			condition: 'Fair',
			location: 'Los Angeles, CA',
			category: 'collectibles',
			// Kept genuinely "active" (start in the past, end in the future)
			// rather than mirroring the original fixed dates, which had both
			// ends of this listing already in the past.
			start_time: dt(-3, 9),
			end_time: dt(4, 9),
			status: 'active',
			images: [],
			is_shipping_available: true,
			shipping_cost: 8,
		},
		{
			user_id: 6,
			price: 280.0,
			title: 'Yeti Cooler 65qt',
			description: 'Used twice, no scratches',
			condition: 'Excellent',
			location: 'Salt Lake City, UT',
			category: 'sporting goods',
			start_time: dt(-10, 17),
			end_time: dt(-3, 17),
			status: 'sold',
			images: ['/img/15a.jpg'],
			is_shipping_available: false,
		},
		{
			user_id: 10,
			price: 2600.0,
			title: 'Gibson Les Paul Standard',
			description: '2019, honeyburst finish, hard case',
			condition: 'Excellent',
			location: 'Memphis, TN',
			category: 'music',
			start_time: dt(-11, 9),
			end_time: dt(-4, 9),
			status: 'sold',
			images: ['/img/16a.jpg', '/img/16b.jpg'],
			is_shipping_available: true,
			shipping_cost: 55,
		},
		{
			user_id: 7,
			price: 3400.0,
			title: 'Set of 4 Eames Chairs',
			description: 'Herman Miller, walnut shell, good condition',
			condition: 'Good',
			location: 'Grand Rapids, MI',
			category: 'furniture',
			start_time: dt(-15, 12),
			end_time: dt(-8, 12),
			status: 'sold',
			images: ['/img/17a.jpg'],
			is_shipping_available: false,
		},
		{
			user_id: 11,
			price: 380.0,
			title: 'GoPro Hero 12 Kit',
			description: 'Includes 3 mounts and extra battery',
			condition: 'New',
			location: 'San Diego, CA',
			category: 'electronics',
			start_time: dt(-8, 5),
			end_time: dt(-1, 5),
			status: 'sold',
			images: ['/img/18a.jpg'],
			is_shipping_available: true,
			shipping_cost: 10,
		},
		{
			user_id: 8,
			price: 8500.0,
			title: 'Diamond Tennis Bracelet',
			description: '3.5 carat total weight, GIA certified',
			condition: 'Excellent',
			location: 'Miami, FL',
			category: 'jewelry',
			start_time: dt(-19, 8),
			end_time: dt(-12, 8),
			status: 'sold',
			images: ['/img/19a.jpg'],
			is_shipping_available: true,
			shipping_cost: 40,
		},
		{
			user_id: 12,
			price: 425.0,
			title: 'Restored Schwinn Cruiser Bike',
			description: '1962 frame, new tires and seat',
			condition: 'Good',
			location: 'Madison, WI',
			category: 'sporting goods',
			start_time: dt(-12, 11),
			end_time: dt(-5, 11),
			status: 'sold',
			images: ['/img/20a.jpg', '/img/20b.jpg'],
			is_shipping_available: false,
		},
		{
			user_id: 9,
			price: 620.0,
			title: 'Herman Miller Aeron Chair',
			description: 'Size B, fully loaded, PostureFit SL',
			condition: 'Excellent',
			location: 'Ann Arbor, MI',
			category: 'furniture',
			start_time: dt(-11, 10),
			end_time: dt(-4, 10),
			status: 'sold',
			images: ['/img/21a.jpg'],
			is_shipping_available: true,
			shipping_cost: 35,
		},
		{
			user_id: 10,
			price: 899.0,
			title: 'iPad Pro 12.9" M2',
			description: '256GB, Wi-Fi + Cellular, Magic Keyboard included',
			condition: 'Excellent',
			location: 'Cupertino, CA',
			category: 'electronics',
			start_time: dt(-10, 9),
			end_time: dt(-3, 9),
			status: 'sold',
			images: ['/img/22a.jpg', '/img/22b.jpg'],
			is_shipping_available: true,
			shipping_cost: 15,
		},
		{
			user_id: 11,
			price: 410.5,
			title: 'Weber Genesis Gas Grill',
			description: '3-burner, stainless steel, used one season',
			condition: 'Good',
			location: 'Kansas City, MO',
			category: 'home',
			start_time: dt(-9, 13),
			end_time: dt(-2, 13),
			status: 'sold',
			images: ['/img/23a.jpg'],
			is_shipping_available: false,
		},
		{
			user_id: 1,
			price: 2750.0,
			title: 'Canon EOS R5 Camera Body',
			description: 'Under 8k shutter actuations, includes 2 batteries',
			condition: 'Excellent',
			location: 'Brooklyn, NY',
			category: 'electronics',
			start_time: dt(-13, 8),
			end_time: dt(-6, 8),
			status: 'sold',
			images: ['/img/24a.jpg'],
			is_shipping_available: true,
			shipping_cost: 20,
		},
		{
			user_id: 2,
			price: 340.0,
			title: 'Antique Brass Telescope',
			description: 'Victorian era, working condition, wooden tripod',
			condition: 'Good',
			location: 'Charleston, SC',
			category: 'collectibles',
			start_time: dt(-16, 14),
			end_time: dt(-9, 14),
			status: 'sold',
			images: ['/img/25a.jpg'],
			is_shipping_available: true,
			shipping_cost: 25,
		},
		{
			user_id: 3,
			price: 1150.0,
			title: 'Peloton Bike+',
			description: 'Includes weights and shoes, size 9',
			condition: 'Excellent',
			location: 'Boulder, CO',
			category: 'sporting goods',
			start_time: dt(-8, 10),
			end_time: dt(-1, 10),
			status: 'sold',
			images: ['/img/26a.jpg'],
			is_shipping_available: false,
		},
		{
			user_id: 12,
			price: 275.0,
			title: 'First Edition Comic Book Lot',
			description: '15 issues, bagged and boarded, 1970s-80s',
			condition: 'Good',
			location: 'Philadelphia, PA',
			category: 'collectibles',
			start_time: dt(-18, 9),
			end_time: dt(-11, 9),
			status: 'sold',
			images: ['/img/27a.jpg', '/img/27b.jpg'],
			is_shipping_available: true,
			shipping_cost: 12,
		},
		{
			user_id: 4,
			price: 1890.0,
			title: 'Martin D-28 Acoustic Guitar',
			description: 'Rosewood back and sides, hard case included',
			condition: 'Excellent',
			location: 'Nashville, TN',
			category: 'music',
			start_time: dt(-12, 15),
			end_time: dt(-5, 15),
			status: 'sold',
			images: ['/img/28a.jpg'],
			is_shipping_available: true,
			shipping_cost: 55,
		},
		{
			user_id: 5,
			price: 3200.0,
			title: 'Sapphire and Diamond Ring',
			description: '2 carat sapphire, platinum band, appraisal included',
			condition: 'Excellent',
			location: 'Chicago, IL',
			category: 'jewelry',
			start_time: dt(-21, 11),
			end_time: dt(-14, 11),
			status: 'sold',
			images: ['/img/29a.jpg'],
			is_shipping_available: true,
			shipping_cost: 20,
		},
		{
			user_id: 6,
			price: 780.0,
			title: 'Mid-Century Teak Sideboard',
			description: 'Danish design, refinished top, original hardware',
			condition: 'Good',
			location: 'Portland, OR',
			category: 'furniture',
			start_time: dt(-7, 6),
			end_time: dt(0, 0, 1),
			status: 'active',
			images: ['/img/30a.jpg', '/img/30b.jpg'],
			is_shipping_available: false,
		},
		{
			user_id: 8,
			price: 500.0,
			title: 'Refurbished Espresso Machine',
			description: 'Commercial-grade, fully serviced, new gaskets',
			condition: 'Excellent',
			location: 'Portland, OR',
			category: 'home',
			start_time: dt(1, 9),
			end_time: dt(8, 9),
			status: 'upcoming',
			images: ['/img/31a.jpg'],
			is_shipping_available: true,
			shipping_cost: 30,
		},
		{
			user_id: 12,
			price: 1200.0,
			title: 'Carbon Fiber Road Bike Frameset',
			description: 'Unbuilt, size 54cm, includes fork and headset',
			condition: 'New',
			location: 'Madison, WI',
			category: 'sporting goods',
			start_time: dt(2, 10),
			end_time: dt(9, 10),
			status: 'upcoming',
			images: [],
			is_shipping_available: true,
			shipping_cost: 45,
		},
	];

	for (const auction of auctions) {
		seedAuction(auction);
	}
}

if (process.argv[1] && process.argv[1].endsWith('seed-auctions.js')) {
	seedDatabase();
}
