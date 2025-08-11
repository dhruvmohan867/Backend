# **Backend-Project — Video Sharing Backend**

**Backend for a video-sharing platform** with secure authentication (access + refresh tokens), user profiles/channels, subscription tracking, and Cloudinary-powered media uploads.

---

## 📚 Table of Contents
- [Tech Stack](#-tech-stack)
- [Key Features](#-key-features)
- [Folder Structure](#-folder-structure)
- [Local Development](#-local-development)
- [Contributing](#-contributing)
- [License](#-license)

## 🔧 Tech-stack 
### 🧩 Core (Backend)
- 🟢 **Node.js**  
- ⚡ **Express.js**
- 🧭 **Mongoose** (MongoDB ODM)
- 🍃 **MongoDB**

### 🔐 Auth & Security
- 🔑 **JWT** (access + refresh tokens)
- 🔒 **bcrypt** (password hashing)
- 🍪 **cookie-parser** (httpOnly refresh token cookie)
- 🌐 **CORS**

### 📁 File / Media Uploads & Storage
- 📂 **Multer** (multipart/form-data handling)
- ☁️ **Cloudinary** (media storage & CDN)
- 🗂️ (recommended) **AWS S3 / CloudFront** (alternative for scale)

### 🗄️ Data & Persistence
- 🍃 **MongoDB (Atlas / self-hosted)**
- 🔎 Indexing best-practices (subscriptions.channel, subscriptions.subscriber)

### 🚀 Dev Tools & Local Dev
- 🔁 **nodemon** (dev auto-reload)
- 🎨 **Prettier** (code formatting)
- 🔍 **ESLint** (linting) — recommended
- 🔧 **dotenv** (env management)

### 🧪 Testing & Quality
- ✅ **Jest** (unit testing)
- 🧪 **Supertest** (integration testing for Express)
- 📦 **CI**: **GitHub Actions** / GitLab CI — recommended

### 🐳 Containerization & Deployment
- 🐳 **Docker** (containerization)
- ☸️ **Kubernetes** (optional, for orchestration)
- ☁️ **Deploy options**: Heroku / Render / Railway / DigitalOcean / AWS / GCP / Azure

### 🔁 Caching & Messaging (scale options)
- 🔁 **Redis** (caching, session store, rate-limiting)
- 🐇 **RabbitMQ** or ⚙️ **Kafka** (message queue for async processing)

### 🎞️ Media Processing / Transcoding
- 🎬 **FFmpeg** (server-side transcoding pipelines)
- 📹 **react-player** / HTML5 <video> (frontend playback)

### 📈 Observability & Monitoring
- 📝 **morgan** / **winston** / **pino** (logging)
- 🐞 **Sentry** (error monitoring)
- ⏱️ **Prometheus** + 📊 **Grafana** (metrics & dashboards)

### ⚙️ Security & Hardening
- 🛡️ **helmet** (security headers)
- 🧯 **express-rate-limit** (throttling)
- 🔍 **input validation** (Joi / celebrate / express-validator)

### 🔁 Helpful Libraries
- 🧾 **mongoose-aggregate-paginate-v2** (aggregation pagination)
- 📦 **cloudinary SDK**
- 🔗 **axios** (HTTP client for frontend)
- ♻️ **React Query (TanStack Query)** (recommended for server state)

### ⚛️ Frontend (recommended)
- ⚛️ **React** (Vite / CRA / Next.js)  
- 💨 **Tailwind CSS** (or Chakra UI / MUI)  
- 📡 **Axios** (withCredentials: true for refresh cookie)  
- 🎛️ **react-hook-form** + **zod/yup** (form validation)  
- 🧭 **React Router** (routing)  
- 🔄 **React Query** (data fetching & caching)

### 🧩 Optional / Future Add-ons
- 🔐 OAuth / Social login (Google / GitHub)  
- ♻️ CDN + Edge caching for thumbnails & assets  
- 🔂 Background workers (transcoding, thumbnail generation)  
- 📦 Versioned API & API docs (Swagger / OpenAPI)

---

## ✨ Key features
- **Secure authentication:** register, login, logout, refresh tokens (access + refresh cookie)  
- **User profiles / channels** with avatar & cover image uploads  
- **Subscription model:** subscribe / unsubscribe, subscriber counts  
- **Video uploads** via Multer → Cloudinary  
- **Aggregation-based channel info** (subscriber counts, isSubscribed flag)  
- **Error handling utilities:** ApiError, ApiResponse, asyncHandler

 ---

 ## 📂 Folder Structure

 ```bash
  server/
├── public/
│ └── temp/
├── src/
│ ├── controllers/
│ ├── db/ 
│ ├── middlewares/ 
│ ├── models/ 
│ ├── routes/ 
│ ├── utils/ 
│ ├── app.js 
│ └── index.js
├── .env.example 
├── .gitignore
├── package.json
└── Licence
```

## 🛠️ Local development

### Prerequisites
- Node.js (v16+), npm  
- MongoDB (local or Atlas)  
- Cloudinary account (for media uploads)

### Install

**Terminal Commands**
```bash
# clone the repo
git clone https://github.com/dhruvmohan867/Backend-Project.git

# go into project folder
cd Mega_project

# install dependencies
npm install
```
Run (development)

```bash
npm run dev
```
### 🤝 Contributing

- Fork the repo
- git checkout -b feat/your-feature
- Commit your changes, push, open a PR


## License
This project is licensed under the MIT License. See [LICENSE](./Licence) for details.













