import path from 'path';
import Database from 'better-sqlite3';
import { DB_DIR } from '../config.js';

const DB_PATH = path.join(DB_DIR, 'auctions.db');
console.log(`Using database at: ${DB_PATH}`);

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE CHECK (length(username) <= 30 AND length(username) >= 3),
        email TEXT NOT NULL UNIQUE CHECK (email LIKE '%_@_%._%'),
        password_hash TEXT NOT NULL
    );
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS auctions (
        auction_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,

        -- price
        starting_price INTEGER NOT NULL,
        current_price INTEGER NOT NULL,
        bid_increment_rules TEXT NOT NULL,  -- JSON.stringify 
                                            -- [{"min": 0, "max": 5000, "increment": 100}, 
                                            -- {"min": 5000, "max": 20000, "increment": 500}]
        currency TEXT NOT NULL DEFAULT 'USD',

        -- winner 
        winning_user_id INTEGER,
        winning_bid_id INTEGER,

        -- listing 
        title TEXT NOT NULL CHECK (length(title) <= 100),
        description TEXT CHECK (length(description) <= 1000),
        condition TEXT NOT NULL,
        details TEXT, -- JSON.stringify 
                     -- [{"detail": "Storage", "info": "256GB"}, 
                     -- {"detail": "Generation", "info": "5th"}]
        category TEXT NOT NULL,
        image_paths TEXT NOT NULL,  -- JSON.stringify(['/img/30a.jpg', '/img/30b.jpg'])

        -- location/shipping
        location TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        shipping_pickup_description TEXT NOT NULL,
        is_shipping_available INTEGER NOT NULL DEFAULT 0,
        shipping_cost INTEGER,

        -- lifecycle
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('upcoming', 'active', 'sold', 'expired')),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),

        -- soft delete
        deleted INTEGER NOT NULL DEFAULT 0,
        deleted_at TEXT,

        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (winning_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
        FOREIGN KEY (winning_bid_id) REFERENCES bids(bid_id) ON DELETE SET NULL
    );
`);

const auctionColumns = db.prepare(`PRAGMA table_info(auctions)`).all();
const auctionColumnNames = new Set(auctionColumns.map((col) => col.name));
if (!auctionColumnNames.has('latitude')) {
	db.exec(`ALTER TABLE auctions ADD COLUMN latitude REAL`);
}
if (!auctionColumnNames.has('longitude')) {
	db.exec(`ALTER TABLE auctions ADD COLUMN longitude REAL`);
}

db.exec(`
    CREATE TABLE IF NOT EXISTS bids (
        bid_id INTEGER PRIMARY KEY AUTOINCREMENT,
        auction_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        is_winning INTEGER NOT NULL DEFAULT 0,  
        is_cancelled INTEGER NOT NULL DEFAULT 0,

        FOREIGN KEY (auction_id) REFERENCES auctions(auction_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ); 
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS pre_bids (
        pre_bid_id INTEGER PRIMARY KEY AUTOINCREMENT,
        auction_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),

        FOREIGN KEY (auction_id) REFERENCES auctions(auction_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE (auction_id, user_id)
    );
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS auction_views (
        auction_id INTEGER NOT NULL,
        viewer_key TEXT NOT NULL,

        PRIMARY KEY (auction_id, viewer_key),
        FOREIGN KEY (auction_id) REFERENCES auctions(auction_id) ON DELETE CASCADE
    );
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        expires_at INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS password_resets (
        reset_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        used INTEGER NOT NULL DEFAULT 0
    );
`);

export default db;
