import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';

export let DB_DIR = process.env.DB_DIR;
export let SEED_DB = process.env.SEED_DB;
export let PORT = process.env.PORT;
export let FRONTEND_URL = process.env.FRONTEND_URL;
export let APPLICATION_SECRET_KEY = process.env.APPLICATION_SECRET_KEY;

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

if (!FRONTEND_URL) {
	FRONTEND_URL = 'http://localhost:5173';
	console.error('FRONTEND_URL environment variable is not set');
}

if (!APPLICATION_SECRET_KEY) {
	APPLICATION_SECRET_KEY = 'WoweeSecretKey';
	console.error('APPLICATION_SECRET_KEY environment variable is not set');
}

if (!fs.existsSync(DB_DIR)) {
	fs.mkdirSync(DB_DIR, { recursive: true });
	console.log(`Created database directory: ${DB_DIR}`);
}
