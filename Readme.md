# Breve — Full-Stack Video Sharing Platform

A YouTube-like video sharing platform built with the **MERN stack**. Features user authentication, video uploads with Cloudinary, real-time interactions (likes, comments, subscriptions), playlists, tweets, channel dashboard, and a premium glassmorphic UI.

![Node.js](https://img.shields.io/badge/Node.js-22-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-5-blue?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)

---

## Features

### Authentication & Users
- Register with avatar + cover image (uploaded to Cloudinary)
- Login with JWT (access token + refresh token in httpOnly cookies with `sameSite: 'none'`)
- Auto token refresh on expiry via Axios interceptors
- Settings page: update profile, avatar, cover image, change password (old files auto-deleted from Cloudinary)
- Channel profiles with subscriber counts

### Videos
- Upload video + thumbnail to Cloudinary (explicit `resource_type: "video"`)
- Cancel in-progress uploads (AbortController)
- Search videos by title/description with regex
- Paginated listing with sort options + "Load More" UI
- View count tracking with abuse prevention (only increments once per user via watchHistory check)
- Update/delete with Cloudinary cleanup (atomic database transactions)
- Toggle publish/unpublish from Dashboard

### Social Features
- **Comments** — Add, edit, delete with per-comment like toggle (owner-only edit/delete)
- **Likes** — Toggle like/unlike on videos, comments, and tweets with optimistic UI updates
- **Subscriptions** — Subscribe/unsubscribe with self-subscribe prevention + dedicated Subscriptions page
- **Tweets** — Short posts (280 char max) with like support, edit, and delete

### Playlists
- Create, update, delete playlists
- Add/remove videos (deduplication with `$addToSet`)
- Preview thumbnails from first video
- Playlist detail page with video list and remove functionality
- Save-to-playlist modal from video player

### Dashboard
- Total videos, subscribers, views, and likes at a glance with gradient stat icons
- Channel video management: toggle publish/unpublish, delete videos

### UI & Special Effects
- Premium dark theme with aurora-inspired color palette
- Glassmorphism cards, header, and sidebar (`backdrop-filter: blur()`)
- Skeleton loading placeholders with shimmer animation
- Staggered `fadeInUp` entry animations on cards, tweets, and stats
- Gradient text on page headers
- Glow-on-hover effects for cards and buttons
- Mobile-responsive sidebar with hamburger menu and slide-in drawer

### Security
- **Helmet** — Secure HTTP headers
- **Rate Limiting** — 100 requests per 15 minutes per IP
- **Input Validation** — express-validator on register, login, comments, tweets, video upload
- **File Type Filtering** — Multer only accepts images and videos (100MB max)
- **Ownership Checks** — Users can only edit/delete their own content

---

## Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express 5 | Server framework |
| MongoDB + Mongoose | Database + ODM |
| JWT + bcrypt | Authentication |
| Cloudinary | Media storage (images + videos) |
| Multer | File upload handling |
| Helmet | Security headers |
| express-rate-limit | Rate limiting |
| express-validator | Input validation |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 + Vite 8 | UI framework + build tool |
| React Router v7 | Client-side routing |
| Axios | API calls with interceptors + token refresh |
| react-hot-toast | Toast notifications |
| react-icons | Icon library |

---

## Project Structure

```
Breve/
├── server/
│   ├── public/temp/              # Multer temp uploads
│   └── src/
│       ├── controllers/          # Business logic (9 controllers)
│       │   ├── user.controller.js
│       │   ├── video.controller.js
│       │   ├── comment.controller.js
│       │   ├── like.controller.js
│       │   ├── subscription.controller.js
│       │   ├── tweet.controller.js
│       │   ├── playlist.controller.js
│       │   ├── dashboard.controller.js
│       │   └── healthcheck.controller.js
│       ├── models/               # Mongoose schemas (7 models)
│       ├── routes/               # Express routers (9 route files)
│       ├── middlewares/          # Auth, Multer, Validation
│       ├── utils/               # ApiError, ApiResponse, asyncHandler, Cloudinary
│       ├── db/                  # MongoDB connection
│       ├── app.js               # Express app config
│       └── index.js             # Entry point
├── client/
│   ├── vercel.json              # Vercel SPA rewrites
│   └── src/
│       ├── api/axios.js         # Axios instance with interceptors
│       ├── context/AuthContext.jsx
│       ├── components/          # Header, Sidebar, VideoCard
│       └── pages/               # 14 pages
│           ├── Home.jsx         # Video feed with pagination + skeleton loader
│           ├── Login.jsx        # Auth with animated orbs
│           ├── Register.jsx     # Multi-field registration
│           ├── Upload.jsx       # Video upload with cancel support
│           ├── VideoPlayer.jsx  # Player + comments + likes + save-to-playlist
│           ├── Tweets.jsx       # Tweet CRUD with optimistic likes
│           ├── Dashboard.jsx    # Stats + video management
│           ├── LikedVideos.jsx  # Liked videos feed
│           ├── History.jsx      # Watch history feed
│           ├── Playlists.jsx    # Playlist grid
│           ├── PlaylistDetail.jsx # Playlist video list with remove
│           ├── Channel.jsx      # Channel profile with tabs
│           ├── Settings.jsx     # Profile, avatar, cover, password management
│           └── Subscriptions.jsx # Subscribed channels grid
└── Readme.md
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### 1. Clone & Configure

```bash
git clone <repo-url>
cd Breve
```

Create `server/.env`:
```env
PORT=2001
MONGODB_URL=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=<your-secret>
ACCESS_TOKEN_ENTRY=1d
REFRESH_TOKEN_SECRET=<your-secret>
REFRESH_TOKEN_ENTRY=10d
CLOUDINARY_CLOUD_NAME=<your-cloud>
CLOUDINARY_API_KEY=<your-key>
CLOUDINARY_API_SECRET=<your-secret>
```

Create `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:2001/api/v1
```

### 2. Start Backend

```bash
cd server
npm install
npm run dev
```
Server runs at `http://localhost:2001`

### 3. Start Frontend

```bash
cd client
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

---

## Deployment

| Service | Platform |
|---------|----------|
| Backend | [Render](https://render.com) |
| Frontend | [Vercel](https://vercel.com) |

For production, update `CORS_ORIGIN` in the server `.env` to your Vercel domain, and set `VITE_API_BASE_URL` in the client `.env` to your Render backend URL.

---

## API Endpoints (31 total)

### Users — `/api/v1/users`
| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| POST | `/register` | ✗ | Register with avatar + cover image |
| POST | `/login` | ✗ | Login, returns JWT tokens |
| POST | `/logout` | ✓ | Clear cookies + tokens |
| POST | `/refresh-token` | ✗ | Refresh access token |
| POST | `/change-password` | ✓ | Change password |
| GET | `/current-user` | ✓ | Get current user |
| PATCH | `/update-account` | ✓ | Update profile details |
| PATCH | `/avatar` | ✓ | Update avatar |
| PATCH | `/cover-image` | ✓ | Update cover image |
| GET | `/c/:username` | ✓ | Get channel profile |
| GET | `/history` | ✓ | Get watch history |

### Videos — `/api/v1/videos`
| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| GET | `/` | ✗ | Search, filter, paginate |
| POST | `/` | ✓ | Upload video + thumbnail |
| GET | `/:videoId` | ✗ | View video (smart view counting) |
| PATCH | `/:videoId` | ✓ | Update (owner only) |
| DELETE | `/:videoId` | ✓ | Delete with atomic cleanup (owner only) |
| PATCH | `/toggle/publish/:videoId` | ✓ | Toggle publish (owner only) |

### Comments — `/api/v1/comments`
| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| GET | `/:videoId` | ✗ | Paginated comments with likes |
| POST | `/:videoId` | ✓ | Add comment |
| PATCH | `/c/:commentId` | ✓ | Update (owner only) |
| DELETE | `/c/:commentId` | ✓ | Delete (owner only) |

### Likes — `/api/v1/likes`
| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| POST | `/toggle/v/:videoId` | ✓ | Toggle video like |
| POST | `/toggle/c/:commentId` | ✓ | Toggle comment like |
| POST | `/toggle/t/:tweetId` | ✓ | Toggle tweet like |
| GET | `/videos` | ✓ | Get liked videos |

### Subscriptions — `/api/v1/subscriptions`
| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| POST | `/c/:channelId` | ✓ | Toggle subscription |
| GET | `/c/:channelId` | ✓ | Get subscribers |
| GET | `/u/:subscriberId` | ✓ | Get subscribed channels |

### Tweets — `/api/v1/tweets`
| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| POST | `/` | ✓ | Create tweet (max 280 chars) |
| GET | `/user/:userId` | ✗ | Get user tweets |
| PATCH | `/:tweetId` | ✓ | Update (owner only) |
| DELETE | `/:tweetId` | ✓ | Delete (owner only) |

### Playlists — `/api/v1/playlists`
| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| POST | `/` | ✓ | Create playlist |
| GET | `/user/:userId` | ✗ | Get user playlists |
| GET | `/:playlistId` | ✗ | Get playlist details |
| PATCH | `/:playlistId` | ✓ | Update (owner only) |
| DELETE | `/:playlistId` | ✓ | Delete (owner only) |
| PATCH | `/add/:videoId/:playlistId` | ✓ | Add video (owner only) |
| PATCH | `/remove/:videoId/:playlistId` | ✓ | Remove video (owner only) |

### Dashboard — `/api/v1/dashboard`
| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| GET | `/stats` | ✓ | Channel statistics |
| GET | `/videos` | ✓ | Channel videos |

### Healthcheck — `/api/v1/healthcheck`
| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| GET | `/` | ✗ | Server health check |

---

## License

MIT — see [Licence](Licence).
