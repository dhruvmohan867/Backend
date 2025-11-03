# Breve — Video Sharing Backend (Node.js + Express + MongoDB)

Backend for a video-sharing platform with secure authentication (JWT access + refresh tokens), user profiles, and Cloudinary-powered media uploads.

- Backend: [server/](server)


---

## Features (current)

- User auth
  - Register with avatar and optional cover image
  - Login, logout, refresh access token
  - Change password
  - Get current user
  - Update account, update avatar, update cover image
  - Watch history with populated owners
- Media uploads
  - Multer saves to local temp (`public/temp`)
  - Upload to Cloudinary via SDK, deletes temp files
- Utilities
  - Centralized error and response helpers
  - JWT-based auth middleware
  - CORS and cookie support

Key files:
- App entry: [server/src/index.js](server/src/index.js)
- Express app: [server/src/app.js](server/src/app.js)
- Mongo connect: [server/src/db/index.js](server/src/db/index.js)
- Auth middleware: [server/src/middlewares/auth.middleware.js](server/src/middlewares/auth.middleware.js)
- Multer: [server/src/middlewares/multer.middleware.js](server/src/middlewares/multer.middleware.js)
- Cloudinary helper: [server/src/utils/cloudinary.js](server/src/utils/cloudinary.js)
- User routes: [server/src/routes/user.routes.js](server/src/routes/user.routes.js)
- User controller: [server/src/controllers/user.controller.js](server/src/controllers/user.controller.js)
- Models: [server/src/models](server/src/models)

---

## Tech Stack

- Node.js, Express
- MongoDB, Mongoose
- JWT, bcrypt, cookie-parser
- Multer, Cloudinary
- CORS, dotenv, nodemon

---

## Setup

1) Install dependencies
- Terminal (from server/)
```bash
npm install
```

2) Create .env (server/.env)
```md
PORT=2001
MONGODB_URL=mongodb+srv://<user>:<pass>@<cluster-host>.mongodb.net
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=<random-long-secret>
ACCESS_TOKEN_ENTRY=1d
REFRESH_TOKEN_SECRET=<random-long-secret>
REFRESH_TOKEN_ENTRY=10d

CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
```

3) Run
```bash
# Dev (auto-restart)
npm run dev

# Prod
npm start
```

Server runs at http://localhost:${PORT}.

---

## API

Base path: /api/v1/users

- POST /register
  - form-data (multipart)
    - text: fullname, email, username, password
    - files: avatar (required), coverImage (optional)
- POST /login
  - JSON: { email?: string, username?: string, password: string }
  - Sets httpOnly cookies: accessToken, refreshToken
- POST /logout
  - Auth required (Bearer header or cookies)
- POST /refresh-token
  - Uses refreshToken cookie or body.refreshToken
- POST /change-password
  - Auth required
  - JSON: { oldPassword, newPassword }
- GET /current-user
  - Auth required
- PATCH /update-account
  - Auth required
  - JSON: { fullName, email }
- PATCH /avatar
  - Auth required
  - form-data: avatar (file)
- PATCH /cover-image
  - Auth required
  - form-data: coverImage (file)
- GET /c/:username
  - Auth required
- GET /history
  - Auth required

Auth header format:
```md
Authorization: Bearer <accessToken>
```

---

## Quick test (curl)

- Register (multipart)
```bash
curl -X POST http://localhost:2001/api/v1/users/register \
  -H "Accept: application/json" \
  -F "fullname=John Doe" \
  -F "email=john@example.com" \
  -F "username=john" \
  -F "password=secret" \
  -F "avatar=@/path/to/avatar.jpg" \
  -F "coverImage=@/path/to/cover.jpg"
```

- Login (JSON)
```bash
curl -X POST http://localhost:2001/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secret"}' \
  -c cookies.txt -b cookies.txt
```

- Get current user (with cookies)
```bash
curl http://localhost:2001/api/v1/users/current-user -c cookies.txt -b cookies.txt
```

---

## Project Structure

```txt
server/
  public/
    temp/
  src/
    controllers/
    db/
    middlewares/
    models/
    routes/
    utils/
    app.js
    index.js
```

---

## Implementation Notes

- Env loading is done at the top of [server/src/index.js](server/src/index.js).
- Global error handler added in [server/src/app.js](server/src/app.js) to normalize failures.
- Token extraction fixed in [server/src/middlewares/auth.middleware.js](server/src/middlewares/auth.middleware.js) to accept cookie or Authorization header.
- Cloudinary uploader in [server/src/utils/cloudinary.js](server/src/utils/cloudinary.js) uses resource_type:auto and deletes temp files safely.

---

## Troubleshooting

- MongoDB SRV ENOTFOUND
  - Your DNS cannot resolve the Atlas SRV record. Check host in MONGODB_URL, flush DNS, try another network, whitelist IP in Atlas.

- Cloudinary “Must supply api_key”
  - Ensure .env keys exist and have no spaces. Verify `CLOUDINARY_*` values log as present at startup.
  - Restart the server after editing .env.

- Postman shows “Cannot GET /api/v1/users/login”
  - The route is POST only. Use POST with JSON and `Content-Type: application/json`.

- req.body undefined on POST JSON
  - Ensure `Content-Type: application/json` header is set so `express.json()` can parse it.

---

## Roadmap (next)

- Video endpoints (upload, list, get-by-id, update, delete, increment views)
- Subscriptions, likes, comments, playlists
- Email verification + password reset
- Rate limiting, helmet, input validation

---

## License

MIT — see [Licence](Licence).















