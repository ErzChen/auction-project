# Erz's Auction

A full-stack online auction platform, users can list items for auction, browse and search listings, place live bids, queue pre-bids on upcoming auctions, and track auctions in real time via WebSockets.

## Overview

The project is made up of three parts that share one backend:

| Part | Stack | Description |
|---|---|---|
| **Server** | Node.js, Express, better-sqlite3, Socket.IO | REST API + WebSocket server, SQLite database, auth, image uploads, email |
| **Web client** | React, Vite, React Router | Multi-page site (main, auth, listing, profile, help, about) |
| **Client application** | React Native, Expo | Cross-platform (iOS/Android/Web) app | Creating and managing auctions | 

> **Layout Disclaimer**  
> This application is explicitly built and optimized for a portrait layout (something around 16:9 aspect ratio).

## Features

- **Authentication** — register, sign in, sign out, forgot/reset password (email via Resend), session tokens (JWT + server-side session store)
- **Listings** — create, edit, and delete auction listings with photos, categories, item details, pricing, and custom bid-increment tiers
- **Bidding** — place bids with automatic minimum-increment enforcement, cancel bids with automatic recalculation of the current price, queue a pre-bid on upcoming auctions
- **Live updates** — new bids, cancellations, and status changes (upcoming → active → sold/expired) broadcast in real time over Socket.IO
- **Search & filtering** — filter by keyword, category, price range, status, and distance (lat/lng + radius)
- **Profiles** — public seller profile pages showing a user's listings
- **View tracking** — per-auction view counts
- **Image uploads** — multi-image upload with server-side resizing/compression (Sharp)
- **Account management** — delete account (cascades bids, pre-bids, and listings)

## Tech Stack

**Backend**
- Express, cookie-parser, cors
- better-sqlite3 (SQLite)
- Socket.IO (real-time bidding/auction updates)
- bcrypt (password hashing), jsonwebtoken (sessions)
- multer + sharp (image upload & processing)
- Resend (transactional email)

**Web client**
- React 19, Vite, React Router
- Vanilla CSS 

**Client application**
- React Native + Expo (SDK 57)
- React Navigation (native stack)
- react-native-reanimated, expo-linear-gradient, expo-secure-store
- socket.io-client

## Getting Started

### Prerequisites

- Node.js (LTS)
- npm

### 1. Backend setup

```bash
npm install
```

Create a `.env` file with:

```bash
DB_DIR=./database
SEED_DB=true # or false if you don't want the sample auctions
PORT=3000
APPLICATION_SECRET_KEY=your-app-key
JWT_SECRET_KEY=your-jwt-secret
FRONTEND_DIST_DIR=./public/dist
RESEND_API_KEY=your-resend-key
```

Run the server:

```bash
npm run dev    # auto-restarts on changes
# or
npm start
# or
node server.js
```

On first run with `SEED_DB=true`, the database is seeded with sample users and auctions.

### 2. Web client (Vite)

```bash
cd public
npm install
```

Set `API_BASE` in a `.env` file 

```bash
npm run build # in public dir
```

### 3. Mobile/Universal client (Expo)

```bash
cd app
npm install
```

Set `EXPO_PUBLIC_API_BASE` and `EXPO_PUBLIC_SECRET_KEY` in a `.env` file, then:

```bash
npx expo start     # Expo dev server (scan QR for device, or press w/i/a to open emulators)
```

## API Summary

All routes are prefixed with `/api` and require the `X-Auction-Application-Key` header for cross-origin, non-authenticated requests (same-origin requests are allowed automatically).

| Method | Route | Description |
|---|---|---|
| POST | `/api/register` | Create an account |
| POST | `/api/login` | Sign in |
| POST | `/api/logout` | Sign out |
| GET | `/api/me` | Current session's user |
| POST | `/api/forgot-password` | Send password reset email |
| POST | `/api/reset-password` | Reset password with token |
| DELETE | `/api/delete` | Delete the current account |
| GET | `/api/user/:user_id` | Public user info |
| GET | `/api/auctions` | Search/list auctions (filters: status, category, keyword, price range, distance, pagination) |
| POST | `/api/auctions` | Create a listing |
| PATCH | `/api/auctions/:auction_id` | Edit a listing |
| DELETE | `/api/auctions/:auction_id` | Delete a listing |
| POST | `/api/auctions/uploads` | Upload listing photos |
| GET | `/api/bids/:auction_id` | List bids for an auction |
| POST | `/api/bids` | Place a bid |
| PUT | `/api/bids/:bid_id/cancel` | Cancel a bid |
| GET | `/api/pre-bids/:auction_id` | Get your pre-bid for an upcoming auction |
| POST | `/api/pre-bids` | Queue a pre-bid |
| PUT | `/api/pre-bids/:pre_bid_id/cancel` | Cancel a pre-bid |

Real-time events (Socket.IO): `join-auction`, `leave-auction`, `new-bid`, `bid-cancelled`, `delete-auction`, `update-auction-status`, `view-count-update`.
