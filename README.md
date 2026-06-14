# 🔐 Saraha App — Anonymous Messaging Platform

> Send honest messages anonymously. No one will ever know it's you.

**Built by [A'laa Yasser](https://github.com/alaa2024Mandour)** — First full-stack project at Route Academy

🌐 **Live API:** `http://13.50.127.162`  
📱 **Mobile UI:** Flutter (Android)  
📦 **Repo:** [github.com/alaa2024Mandour/sarahaApp](https://github.com/alaa2024Mandour/sarahaApp)

---

## 📌 What is Saraha?

Saraha is an anonymous messaging app where users can share their link and receive completely anonymous messages from anyone — even people without an account.

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Caching | Redis |
| Auth | JWT (Access + Refresh Tokens) |
| OAuth | Google Sign-In |
| File Upload | Multer + Cloudinary |
| Email | Nodemailer + Node Event Emitters |
| Validation | Joi |
| Encryption | Node.js `crypto` (AES) |
| Hashing | bcrypt |
| Deployment | AWS EC2 |
| Mobile UI | Flutter (Dart) |

---

## 🚀 Features

### 🔐 Authentication & Security
- Email/password sign up with OTP email verification
- Google OAuth login (`/signup/gmail`)
- JWT access tokens (24h) + refresh tokens (30d)
- Role-based authorization (user / admin)
- Login attempt protection — banned after 5 wrong tries (Redis)
- OTP rate limiting — max 3 resends, then blocked for 60s (Redis)
- All phone numbers encrypted with AES via Node `crypto`
- Passwords hashed with bcrypt (12 salt rounds)
- Logout from one device or all devices

### 📧 Email System
- OTP emails sent **asynchronously** via Node.js Event Emitters
- API responds instantly — email sends in the background
- Supports: email verification, forgot password, resend OTP

### 💬 Messaging
- Send anonymous messages to any user — **no account required**
- Attach images/docs (up to 3 files via Cloudinary)
- Users receive all messages in their inbox

### 👤 User Profile
- Upload profile picture (Cloudinary)
- Update first name, last name, phone, gender
- Profile cached in Redis (5 min TTL) for fast reads
- Visit counter — tracks how many people visited your profile
- Share your profile publicly

### ⚡ Performance
- Redis caching for user profiles
- Background email sending via Event Emitters
- Revoked JWT tokens stored in Redis (not DB) to reduce load

---

## 📁 Folder Structure

```
src/
├── config/
│   └── config.service.js        # environment variables
├── DB/
│   ├── models/                  # Mongoose models
│   ├── db.service.js            # generic DB operations
│   └── redis/
│       └── redis.service.js     # Redis operations
├── common/
│   ├── enum/                    # enums (roles, providers...)
│   ├── middleware/              # auth, validation, multer
│   └── utils/
│       ├── security/            # hash, encrypt/decrypt
│       ├── email/               # email template, events, sender
│       ├── cloudinary.js
│       └── auth.service.js      # JWT generate/verify
└── modules/
    ├── user/                    # user routes, service, validation
    └── message/                 # message routes, service, validation
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/signUp` | ❌ | Register with profile pic |
| POST | `/signIn` | ❌ | Login → returns access + refresh token |
| POST | `/signup/gmail` | ❌ | Google OAuth login |
| POST | `/confirm` | ❌ | Verify email with OTP code |
| POST | `/resend` | ❌ | Resend OTP |
| POST | `/forgotPassword` | ❌ | Send reset OTP |
| PATCH | `/resetPassword` | ❌ | Reset password with OTP |
| POST | `/refreshToken` | 🔄 Refresh | Get new access token |
| POST | `/logOut` | ✅ | Logout (one or all devices) |

### User
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✅ | Get my profile |
| GET | `/:id` | ✅ | Get user profile (increments visit count) |
| GET | `/shareProfile/:id` | ❌ | Public profile |
| GET | `/all` | ✅ | Get all users |
| PATCH | `/updateProfile` | ✅ | Update name, phone, gender |
| PATCH | `/updatePassword` | ✅ | Change password |

### Messages
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/sendMessage` | ❌ | Send anonymous message (with attachments) |
| GET | `/getUserMessages` | ✅ | Get my received messages |

---

## 🔧 Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB
- Redis
- Cloudinary account
- Google OAuth credentials

### 1. Clone the repo
```bash
git clone https://github.com/alaa2024Mandour/sarahaApp.git
cd sarahaApp
npm install
```

### 2. Create `.env` file
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
REDIS_URL=your_redis_url

ACCESS_SECRET_KEY=your_access_secret
REFRESH_SECRET_KEY=your_refresh_secret
PREFIX=Bearer

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

ENCRYPTION_KEY=your_32_char_key
ENCRYPTION_IV=your_16_char_iv

GOOGLE_CLIENT_ID=your_google_web_client_id
```

### 3. Run
```bash
# Development
npm run dev

# Production
npm start
```

---

## 📱 Mobile App (Flutter)

A Flutter mobile app was built to demonstrate the full user experience:

- Sign up / Sign in / Google login
- OTP email verification
- View & edit profile
- Browse all users
- Send anonymous messages
- View received messages inbox

> The Flutter source is available in the `/flutter` branch of this repo.

---

## 🌐 Deployment

The API is deployed on **AWS EC2** and managed with **PM2** for process management and auto-restart.

```
Base URL: http://13.50.127.162
```

---

## 👨‍💻 Author

**A'laa Yasser**  
First full-stack project — built at **Route Academy**  
Under the guidance and support of the instructors and mentors at Route Academy 🙏

[![GitHub](https://img.shields.io/badge/GitHub-alaa2024Mandour-black?logo=github)](https://github.com/alaa2024Mandour)

---

## 📄 License

MIT License — feel free to use this project for learning purposes.
