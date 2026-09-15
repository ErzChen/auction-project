import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';

export const CATEGORIES = [
	'Electronics',
	'Furniture',
	'Collectibles',
	'Jewelry & Watches',
	'Art',
	'Vehicles',
	'Sporting Goods',
	'Home & Garden',
	'Other',
];
export const CURRENCIES = ['USD', 'CAD', 'EUR', 'GBP'];
export const STATUSES = ['upcoming', 'active', 'sold', 'expired'];

export let DB_DIR = process.env.DB_DIR;
export let SEED_DB = process.env.SEED_DB;
export let PORT = process.env.PORT;
export let APPLICATION_SECRET_KEY = process.env.APPLICATION_SECRET_KEY;
export let JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
export let FRONTEND_DIST_DIR = process.env.FRONTEND_DIST_DIR;

if (!DB_DIR) {
	DB_DIR = './database';
	console.error('DB_DIR environment variable is not set');
}

if (!SEED_DB) {
	SEED_DB = false;
	console.error('SEED_DB environment variable is not set');
}

if (!process.env.RESEND_API_KEY) {
	console.error('RESEND_API_KEY environment variable is not set');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

if (!PORT) {
	PORT = 3000;
	console.error('PORT environment variable is not set');
}

if (!APPLICATION_SECRET_KEY) {
	APPLICATION_SECRET_KEY = 'WoweeSecretKey';
	console.error('APPLICATION_SECRET_KEY environment variable is not set');
}

if (!JWT_SECRET_KEY) {
	JWT_SECRET_KEY = 'generatedRandomHexString';
	console.error('JWT_SECRET_KEY environment variable is not set');
}

if (!FRONTEND_DIST_DIR) {
	FRONTEND_DIST_DIR = './public/dist';
	console.error('FRONTEND_DIST_DIR environment variable is not set');
}

if (!fs.existsSync(FRONTEND_DIST_DIR)) {
	console.error(`Frontend build does not exist or FRONTEND_DIST_DIR has the wrong path`);
}

FRONTEND_DIST_DIR = path.resolve(FRONTEND_DIST_DIR);

if (!fs.existsSync(DB_DIR)) {
	fs.mkdirSync(DB_DIR, { recursive: true });
	console.log(`Created database directory: ${DB_DIR}`);
}
