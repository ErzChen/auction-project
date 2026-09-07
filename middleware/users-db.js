import db from './db.js';

export const insertUser = db.prepare(`
    INSERT INTO users (username, email, password_hash) 
    VALUES (?, ?, ?)
`);

export const getUserById = db.prepare(`SELECT * FROM users WHERE user_id = ?`);

export const getUserByUsername = db.prepare(`
    SELECT * FROM users 
    WHERE username = ?
`);

export const getUserByEmail = db.prepare(`SELECT * FROM users WHERE email = ?`);

export const getUserByEmailOrUsername = db.prepare(`
    SELECT user_id FROM users 
    WHERE email = ? OR username = ?
`);

export const updateUserPassword = db.prepare(`
    UPDATE users SET password_hash = ? 
    WHERE user_id = ?
`);

export const insertSession = db.prepare(`
    INSERT INTO sessions (session_id, user_id, expires_at) 
    VALUES (?, ?, ?)
`);

export const insertPasswordReset = db.prepare(`
    INSERT INTO password_resets (user_id, token_hash, expires_at) 
    VALUES (?, ?, ?)
`);

export const expirePasswordReset = db.prepare(`
    UPDATE password_resets SET used = 1 
    WHERE reset_id = ?
`);

export const getPasswordResetByToken = db.prepare(`
    SELECT * FROM password_resets 
    WHERE token_hash = ? AND used = 0
`);

export const getSession = db.prepare(`
    SELECT * FROM sessions 
    WHERE session_id = ?
`);

export const deleteSession = db.prepare(`
    DELETE FROM sessions 
    WHERE session_id = ?
`);

export default db;
