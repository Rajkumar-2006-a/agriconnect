# 🌾 AgriConnect (அக்ரிகனெக்ட்) — Integrated Digital Agriculture Platform

[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.3.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas%20%2F%20Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Backend-Express.js%204.22-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%20Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Cloudinary](https://img.shields.io/badge/Cloud%20Media-Cloudinary%20CDN-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 Table of Contents

- [Overview & Problem Statement](#-overview--problem-statement)
- [System Architecture & Data Flow](#-system-architecture--data-flow)
- [User Roles & Access Control (RBAC)](#-user-roles--access-control-rbac)
- [Core Features & Modules](#-core-features--modules)
  - [1. Direct Farm-to-Consumer Marketplace](#1-direct-farm-to-consumer-marketplace)
  - [2. Farm Machinery & Equipment Rental Hub](#2-farm-machinery--equipment-rental-hub)
  - [3. AgriBot — 24/7 AI Agricultural Assistant](#3-agribot--247-ai-agricultural-assistant)
  - [4. Government Schemes & Subsidies Navigator](#4-government-schemes--subsidies-navigator)
  - [5. Tamil Nadu Agrisnet Live Fertilizer Price Tracker](#5-tamil-nadu-agrisnet-live-fertilizer-price-tracker)
  - [6. Farmer Collaboration & Disease Diagnostic Forum](#6-farmer-collaboration--disease-diagnostic-forum)
  - [7. Regional Agri Doctors & Agronomist Directory](#7-regional-agri-doctors--agronomist-directory)
  - [8. Administrator Control Center & Analytics](#8-administrator-control-center--analytics)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Environment Configuration](#-environment-configuration)
- [Installation & Quick Start](#-installation--quick-start)
- [Database Seeding Scripts](#-database-seeding-scripts)
- [REST API Reference](#-rest-api-reference)
- [Cloudinary Media Storage Pipeline](#-cloudinary-media-storage-pipeline)
- [Deployment on Vercel](#-deployment-on-vercel)
- [Manual Testing & Verification Guide](#-manual-testing--verification-guide)
- [Troubleshooting & FAQ](#-troubleshooting--faq)
- [Authors & Acknowledgments](#-authors--acknowledgments)

---

## 🌟 Overview & Problem Statement

Smallholder and marginal farmers often face severe structural challenges:
- **Excessive Middlemen Margins:** Intermediaries claim high commission fees, driving down farmer income while raising prices for consumers.
- **Low Farm Mechanization:** High capital costs prevent small farmers from owning modern machinery (tractors, power tillers, combine harvesters, rotavators).
- **Fragmented Welfare Information:** Critical government subsidies (PMKSY, PM-KISAN, SMAM machinery grants) are scattered across disparate portals, leading to low scheme adoption.
- **Price Exploitation:** Inaccurate or delayed fertilizer price intelligence exposes farmers to overcharging beyond official Maximum Retail Prices (MRP).
- **Delayed Agronomic Advisory:** Slow access to certified plant pathologists and agronomists leads to preventable crop losses.

**AgriConnect** is an integrated, full-stack digital agriculture ecosystem built on the **MERN (MongoDB, Express, React, Node.js)** architecture. It solves these challenges by combining direct commerce, machinery rental, AI-driven advisory, verified government scheme access, live fertilizer price tracking, community peer-support, and administrative governance into a single responsive, bilingual (English & Tamil தமிழ்) web platform.

---

## 🏗️ System Architecture & Data Flow

```mermaid
flowchart TD
    subgraph Clients["Frontend (React 18 + Vite + Bootstrap 5)"]
        FARMER["🌾 Farmer Dashboard"]
        BUYER["🛒 Buyer Marketplace"]
        RENTAL_OWNER["🚜 Equipment Rental Hub"]
        ADMIN["🛡️ Admin Console"]
        BOT_UI["🤖 AgriBot Voice & Chat Widget"]
    end

    subgraph API_Gateway["Express 4 REST API Layer"]
        AUTH_ROUTER["/api/auth"]
        PRODUCT_ROUTER["/api/products"]
        EQUIP_ROUTER["/api/equipment"]
        ORDER_ROUTER["/api/orders"]
        RENTAL_ROUTER["/api/rentals"]
        POST_ROUTER["/api/posts"]
        FERT_ROUTER["/api/fertilizers"]
        SCHEME_ROUTER["/api/schemes"]
        CHAT_ROUTER["/api/chat"]
        ADMIN_ROUTER["/api/admin"]
    end

    subgraph Security_Storage["Security & Media Infrastructure"]
        JWT["JWT Authentication & RBAC Middleware"]
        MULTER["Multer Image Upload Stream"]
        CLOUDINARY["Cloudinary CDN / Local Storage"]
    end

    subgraph Intelligence_Data["External Services & Database"]
        GEMINI["Google Gemini AI API"]
        AGRISNET["Agrisnet Tamil Nadu Fertilizer API"]
        MONGO[("MongoDB Database / Atlas Cluster")]
    end

    Clients --> API_Gateway
    API_Gateway --> Security_Storage
    API_Gateway --> Intelligence_Data
    CHAT_ROUTER --> GEMINI
    FERT_ROUTER --> AGRISNET
```

---

## 👥 User Roles & Access Control (RBAC)

AgriConnect enforces Role-Based Access Control (RBAC) across 4 dedicated user roles:

| Feature / Permission | 🌾 Farmer | 🛒 Buyer | 🚜 Rental Owner | 🛡️ Administrator |
| :--- | :---: | :---: | :---: | :---: |
| **List Agricultural Crops & Harvest** | ✅ | ❌ | ❌ | ✅ *(Delete/Moderate)* |
| **Manage Received Customer Orders** | ✅ | ❌ | ❌ | ✅ *(Read all)* |
| **Browse Produce & Place Orders** | ❌ | ✅ | ❌ | ❌ |
| **List Farm Equipment & Implements** | ❌ | ❌ | ✅ | ✅ *(Delete/Moderate)* |
| **Request Equipment Booking by Acreage** | ✅ | ❌ | ❌ | ❌ |
| **Approve / Reject Machinery Bookings** | ❌ | ❌ | ✅ | ✅ |
| **Agrisnet Live Fertilizer Price Tracker** | ✅ | ✅ | ✅ | ✅ |
| **Government Schemes & Subsidies Engine** | ✅ | ✅ | ✅ | ✅ *(CRUD Schemes)* |
| **AgriBot AI Voice & Chatbot Advisory** | ✅ | ✅ | ✅ | ✅ |
| **Farmer Collaboration Posts & Comments** | ✅ | ❌ | ❌ | ✅ *(Moderate)* |
| **Connect with Regional Agri Doctors** | ✅ | ✅ | ✅ | ✅ *(Add/Edit Doctors)* |
| **System Metrics & User Management** | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 Core Features & Modules

### 1. Direct Farm-to-Consumer Marketplace
- **Crop Publishing:** Farmers list agricultural produce with title, category (Cereals, Pulses, Vegetables, Fruits, Cash Crops), price per kg/quintal, stock volume, description, seller contact phone, and high-resolution photo.
- **Inventory Control:** Farmers can mark items as sold or update stock directly from the dashboard.
- **Buyer Cart & Checkout:** Buyers browse items with real-time text and category filtering, add items to their cart, configure quantities, review checkout summaries, and place orders with direct/cash-on-delivery options.
- **Order Lifecycle Management:** Farmers track customer orders through dynamic status transitions: `Pending` ➔ `Confirmed` ➔ `Shipped` ➔ `Delivered` ➔ `Cancelled`.

### 2. Farm Machinery & Equipment Rental Hub
- **Machinery Catalog:** Rental owners publish tractors, power tillers, rotavators, combine harvesters, power weeders, and sprayers with hourly/daily rates, primary photo, and multi-attachment gallery images.
- **District-Based Filtering:** Location-aware search across all 38 districts of Tamil Nadu (e.g., Coimbatore, Thanjavur, Madurai, Salem).
- **Acreage Booking Calculation:** Farmers select machinery, enter farm land acreage, and submit booking requests with instant owner notification.
- **Status Workflows:** Owners review tenant details and accept or reject requests (`pending` ➔ `accepted` / `rejected` ➔ `completed`).

### 3. AgriBot — 24/7 AI Agricultural Assistant
- **Google Gemini AI Integration:** Context-aware assistant offering scientific yet accessible farming guidance.
- **Bilingual Conversational Interface:** Fluent English and Tamil (தமிழ்) language processing.
- **Voice Support:** Voice-to-Text input using browser Speech Recognition and Speech Synthesis audio playback.
- **Subject-Matter Knowledge:**
  - Crop disease diagnosis and integrated pest management (organic neem sprays, bio-fungicides).
  - Soil nutrient balancing and NPK fertilizer calculations.
  - Sowing seasons in Tamil Nadu (Kharif, Rabi, Samba, Kuruvai, Thaladi).
  - Platform navigation assistance for finding schemes, fertilizers, and rentals.
- **Resilient Heuristic Fallback:** If the Gemini API key is missing or rate limits occur, AgriBot seamlessly switches to an internal heuristic knowledge engine without crashing or degrading user experience.

### 4. Government Schemes & Subsidies Navigator
- **Verified Repository:** Central and Tamil Nadu State agricultural schemes:
  - **PM-KISAN:** ₹6,000/yr Direct Benefit Transfer for landholding farmers.
  - **Micro Irrigation Scheme (PMKSY):** 100% subsidy for Small & Marginal farmers (<5 acres) and 75% for others on drip/sprinkler installations.
  - **Sub-Mission on Agricultural Mechanization (SMAM):** 40%–50% subsidy on tractors and power tillers.
  - **Pradhan Mantri Fasal Bima Yojana (PMFBY):** Comprehensive crop insurance (1.5%–2% premium).
  - **PM-KUSUM:** Up to 70% subsidy for solar-powered water pump sets.
  - **Chief Minister Uzhavar Pathukappu Thittam:** Tamil Nadu accident relief, educational grants, and farmer pensions.
  - **TANGEDCO Free Electricity:** Free farm power connection scheme.
  - **Kisan Credit Card (KCC):** Low-interest (4%) institutional crop credit.
- **Interactive Eligibility Calculator:** Farmers input their landholding size to immediately see qualified schemes.
- **Document Readiness Checklist:** Direct breakdown of mandatory documents (Patta/Chitta, Aadhaar, Bank Passbook, Passport Photos).
- **One-Click Direct Portal Access:** Verified outbound links to official portals (`pmkisan.gov.in`, `agrisnet.tn.gov.in`, `tnhorticulture.tn.gov.in`).

### 5. Tamil Nadu Agrisnet Live Fertilizer Price Tracker
- **Comprehensive Catalog:** Covers 24+ standard chemical and organic fertilizers (Urea, DAP, Potash/MOP, NPK 10:26:26, NPK 16:20:0:13, City Compost, Super Phosphate).
- **Brand-Wise Price Breakdowns:** Official notified prices across top manufacturers (SPIC, IFFCO, KRIBHCO, MFL Vijay, NFL Kisan, Coromandel Gromor).
- **Dual Language Display:** Fertilizer names in both English and Tamil (e.g., *Urea / யூரியா*, *Potash / பொட்டாஸ்*).
- **Intelligent Caching:** Automatic 24-hour cache layer (`CACHE_HOURS`) preventing unnecessary upstream requests.

### 6. Farmer Collaboration & Disease Diagnostic Forum
- **Topic-Tagged Community:** Posts categorized with visual badges:
  - 🩺 **Plant Disease Help:** Post crop photos to get diagnosis from peers and specialists.
  - 🌾 **Farmer Experience:** Share yields, organic farming results, and success stories.
  - 💡 **Growing Tips:** Water-saving techniques, micro-nutrients, and mulching tips.
  - ❓ **Farming Questions:** General queries on seed germination, weather, and market rates.
- **Interactive Discussions:** Threaded comment system with real-time feedback and photo modal viewer.

### 7. Regional Agri Doctors & Agronomist Directory
- **Certified Agricultural Directory:** Regional listing of agronomists, crop protection specialists, and horticulture experts across Tamil Nadu.
- **Direct Connectivity:** Instant one-click phone dialer (`tel:`) and direct WhatsApp consultation chat triggers.

### 8. Administrator Control Center & Analytics
- **Live Platform KPI Metrics:** Total registered users (broken down by role), listed marketplace products, active rental units, and processed orders.
- **Content Moderation:** Revoke or delete abusive user accounts, unauthorized product listings, or inappropriate community posts.
- **Doctor & Scheme Management:** Add, edit, or delete Agri Doctor contacts and government welfare schemes directly via admin forms.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 18.3.1, Vite 5.3.4 |
| **Routing & Navigation** | React Router DOM 6.26.1 |
| **Styling & Design System** | Bootstrap 5.3.3, Custom CSS Design System, Responsive Media Queries |
| **HTTP Client** | Axios 1.7.2 with interceptors for JWT Bearer Tokens |
| **Backend Runtime** | Node.js 18+ (ES Modules `import/export`) |
| **Server Framework** | Express.js 4.22.3 with Morgan HTTP logging & CORS |
| **Database & ODM** | MongoDB 6+ / MongoDB Atlas, Mongoose 8.5.1 |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` password hashing |
| **File & Cloud Storage** | Multer 1.4.5, Cloudinary SDK 2.11.0 (with local `uploads/` fallback) |
| **Artificial Intelligence** | Google Gemini Generative AI REST API |
| **Speech APIs** | Web Speech API (`webkitSpeechRecognition`, `SpeechSynthesisUtterance`) |
| **Deployment Target** | Vercel Serverless (`vercel.json`) & Standalone Node.js |

---

## 📁 Project Directory Structure

```text
agriconnect/
├── agriculture-platform/
│   ├── backend/
│   │   ├── api/
│   │   │   └── index.js              # Serverless entry point for Vercel
│   │   ├── config/
│   │   │   ├── db.js                 # MongoDB connection & reconnect logic
│   │   │   └── cloudinary.js         # Cloudinary cloud configuration
│   │   ├── controllers/
│   │   │   ├── adminController.js    # System stats, doctor/content moderation
│   │   │   ├── authController.js     # User registration, login, profile updates
│   │   │   ├── chatController.js     # Gemini AI AgriBot with fallback heuristics
│   │   │   └── crudController.js     # Products, equipment, orders, rentals, posts
│   │   ├── data/
│   │   │   ├── fertilizers.json      # Tamil Nadu 24-fertilizer price catalog
│   │   │   └── schemes.json          # 15+ Central & Tamil Nadu welfare schemes
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verification & RBAC authorization
│   │   │   ├── error.js              # 404 handler & centralized error handler
│   │   │   └── upload.js             # Dual-engine Multer storage (Cloudinary / Local)
│   │   ├── models/
│   │   │   ├── AgriDoctor.js         # Certified agronomist schema
│   │   │   ├── Comment.js            # Forum comments schema
│   │   │   ├── Equipment.js          # Machinery schema with multi-attachments
│   │   │   ├── Fertilizer.js         # Notified fertilizer price schema
│   │   │   ├── Order.js              # Buyer marketplace orders schema
│   │   │   ├── Post.js               # Community discussion schema
│   │   │   ├── Product.js            # Agricultural crop listing schema
│   │   │   ├── RentalRequest.js      # Farm equipment booking schema
│   │   │   ├── Scheme.js             # Welfare schemes & subsidies schema
│   │   │   └── User.js               # User accounts schema with bcrypt hook
│   │   ├── routes/
│   │   │   ├── chat.js               # /api/chat endpoint
│   │   │   ├── fertilizers.js        # /api/fertilizers endpoints & Agrisnet sync
│   │   │   ├── routes.js             # Core unified API router
│   │   │   └── schemes.js            # /api/schemes endpoints & category filters
│   │   ├── scripts/
│   │   │   ├── seedFertilizers.js    # Fertilizer catalog seeder
│   │   │   └── seedSchemes.js        # Welfare schemes seeder
│   │   ├── utils/
│   │   │   └── seedAdmin.js          # Admin account and sample doctors seeder
│   │   ├── uploads/                  # Local media directory (local dev fallback)
│   │   ├── .env.example              # Environment variables template
│   │   ├── package.json              # Backend dependencies and scripts
│   │   ├── server.js                 # Standalone Express server setup
│   │   └── vercel.json               # Vercel serverless rewrite rules
│   │
│   ├── frontend/
│   │   ├── public/                   # Static assets & favicon
│   │   ├── src/
│   │   │   ├── assets/               # Branding graphics & imagery
│   │   │   ├── components/
│   │   │   │   ├── AgriChatbot.jsx   # Floating AI assistant with voice input
│   │   │   │   ├── ErrorBoundary.jsx # React production error boundary
│   │   │   │   ├── FarmerCollaborationSection.jsx # Forum & photo blights
│   │   │   │   ├── FarmerIcons.jsx   # Optimized SVG icon collection
│   │   │   │   ├── FertilizerPriceTable.jsx # Interactive price tables
│   │   │   │   ├── Layout.jsx        # Responsive navigation & global footer
│   │   │   │   ├── MyProductsSection.jsx # Farmer product management
│   │   │   │   └── Protected.jsx     # Route authentication guard
│   │   │   ├── constants/
│   │   │   │   └── tamilNaduLocations.js # Tamil Nadu 38 districts list
│   │   │   ├── context/
│   │   │   │   └── AuthContext.jsx   # Global user auth state & token storage
│   │   │   ├── pages/
│   │   │   │   ├── AdminDashboard.jsx # Admin oversight & metrics
│   │   │   │   ├── BuyerMarketplace.jsx # Produce browsing & shopping cart
│   │   │   │   ├── BuyerOrders.jsx   # Purchase tracking & history
│   │   │   │   ├── DetailPages.jsx   # Product & Machinery details
│   │   │   │   ├── EquipmentRental.jsx # Machinery rental catalog
│   │   │   │   ├── FarmerDashboardMain.jsx # All-in-one Farmer dashboard
│   │   │   │   ├── FertilizerPricePage.jsx # Fertilizer price comparison
│   │   │   │   ├── GovernmentSchemesPage.jsx # Subsidy calculator & schemes
│   │   │   │   ├── RentalOwnerDashboard.jsx # Machinery listing & approvals
│   │   │   │   └── SimpleAuth.jsx    # Unified Login & Registration
│   │   │   ├── services/
│   │   │   │   └── api.js            # Axios client with base URL & interceptors
│   │   │   ├── styles/               # Component & theme stylesheets
│   │   │   ├── App.jsx               # React Router route hierarchy
│   │   │   └── main.jsx              # React DOM root mounting
│   │   ├── .env.example              # Frontend environment template
│   │   ├── index.html                # HTML entry point with meta tags
│   │   ├── package.json              # Frontend dependencies and scripts
│   │   ├── vercel.json               # Frontend SPA rewrite rules
│   │   └── vite.config.js            # Vite bundler configuration
│   └── README.md
├── .gitignore
└── README.md
```

---

## ⚙️ Environment Configuration

### Backend (`agriculture-platform/backend/.env`)

Create a `.env` file in `agriculture-platform/backend` based on `.env.example`:

```ini
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Connection (Local MongoDB or Atlas URI)
MONGODB_URI=mongodb://127.0.0.1:27017/agriculture_platform
MONGO_URI=mongodb://127.0.0.1:27017/agriculture_platform

# Authentication
JWT_SECRET=super_secret_jwt_random_hash_key_agriconnect_2026
JWT_EXPIRES_IN=7d

# Frontend CORS Origin
CLIENT_URL=http://localhost:5173

# Default Platform Administrator (used by npm run seed)
ADMIN_EMAIL=admin@agriconnect.com
ADMIN_PASSWORD=Admin@12345
ADMIN_PHONE=9876543210

# External Agriculture APIs & Caching
AGRISNET_BASE=http://115.243.209.84/people_app/fertilizer_price/fertDetails
CACHE_HOURS=24

# Google Gemini AI API (for AgriBot)
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere

# Cloudinary CDN Storage (Optional: Falls back to local uploads if left blank)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_URL=cloudinary://your_cloudinary_api_key:your_cloudinary_api_secret@your_cloud_name
```

### Frontend (`agriculture-platform/frontend/.env`)

Create a `.env` file in `agriculture-platform/frontend` based on `.env.example`:

```ini
# Target API URL (Local development or deployed Vercel/Render backend)
VITE_API_URL=http://localhost:5000/api
```

---

## 💻 Installation & Quick Start

### Prerequisites
- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **MongoDB**: Local MongoDB Community Server installed and running, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI.
- **Git**: Installed on your system.

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Rajkumar-2006-a/agriconnect.git
cd agriconnect/agriculture-platform
```

---

### Step 2: Setup and Start Backend

Open your first terminal in `agriculture-platform/backend`:

```powershell
cd backend

# 1. Install NPM dependencies
npm install

# 2. Copy and populate environment variables
Copy-Item .env.example .env

# 3. Seed initial admin account, Tamil Nadu doctors, schemes, and fertilizers
npm run seed
npm run seed:schemes
npm run seed:fertilizers

# 4. Start the backend in development mode (with nodemon auto-reload)
npm run dev
```

> **Backend is now live at:** `http://localhost:5000`  
> Health check endpoint: `http://localhost:5000/api/health`

---

### Step 3: Setup and Start Frontend

Open a second terminal in `agriculture-platform/frontend`:

```powershell
cd frontend

# 1. Install NPM dependencies
npm install

# 2. Copy environment file
Copy-Item .env.example .env

# 3. Start Vite development server
npm run dev
```

> **Frontend is now live at:** `http://localhost:5173`

---

## 🗄️ Database Seeding Scripts

AgriConnect includes dedicated automation scripts to seed verified agricultural data:

| Command | Script Path | Description |
| :--- | :--- | :--- |
| `npm run seed` | `backend/utils/seedAdmin.js` | Creates the root administrator (`admin@agriconnect.com`) and seeds 5 verified Tamil Nadu Agri Doctors across major districts. |
| `npm run seed:schemes` | `backend/scripts/seedSchemes.js` | Seeds 15+ Central and Tamil Nadu government welfare schemes from `backend/data/schemes.json` into MongoDB. |
| `npm run seed:fertilizers` | `backend/scripts/seedFertilizers.js` | Seeds 24 standard agricultural fertilizers with brand-wise notified prices from `backend/data/fertilizers.json`. |

---

## 📡 REST API Reference

All endpoints are prefixed with `/api`. Protected routes require the header:  
`Authorization: Bearer <JWT_TOKEN>`

### 1. Authentication & Profile (`/api/auth` & `/api/users`)
- `POST /api/auth/register` — Register a new account (`farmer`, `buyer`, or `rentalOwner`).
- `POST /api/auth/login` — Authenticate user and receive JWT.
- `GET /api/auth/me` — *(Protected)* Fetch currently authenticated user's profile.
- `PUT /api/users/profile` — *(Protected)* Update phone, name, and profile picture (via Multer/Cloudinary).

### 2. Crop Marketplace (`/api/products`)
- `GET /api/products` — List all products with optional filters (`category`, `includeSold`).
- `GET /api/products/:id` — Retrieve single product details with farmer information.
- `POST /api/products` — *(Protected: Farmer)* List a new crop with image upload.
- `PUT /api/products/:id` — *(Protected: Farmer, Admin)* Update product details or mark as sold (`isSold: true`).
- `DELETE /api/products/:id` — *(Protected: Farmer, Admin)* Delete a crop listing.

### 3. Equipment & Machinery Rentals (`/api/equipment` & `/api/rentals`)
- `GET /api/equipment` — List available machinery with optional district location filtering.
- `GET /api/equipment/:id` — Retrieve equipment details with attachment specifications.
- `POST /api/equipment` — *(Protected: Rental Owner)* Create equipment with primary image and up to 8 attachments.
- `PUT /api/equipment/:id` — *(Protected: Rental Owner, Admin)* Update equipment availability, rates, or details.
- `DELETE /api/equipment/:id` — *(Protected: Rental Owner, Admin)* Delete equipment.
- `GET /api/rentals` — *(Protected)* View rental requests (Farmers see their bookings; Owners see requests for their gear).
- `POST /api/rentals` — *(Protected: Farmer)* Submit an acreage-based rental request.
- `PUT /api/rentals/:id/status` — *(Protected: Rental Owner, Admin)* Accept, reject, or complete a rental booking.

### 4. Marketplace Orders (`/api/orders`)
- `GET /api/orders` — *(Protected)* Fetch orders (Buyers view their purchases; Farmers view orders received for their crops).
- `POST /api/orders` — *(Protected: Buyer)* Create an order from cart items.
- `PUT /api/orders/:id/status` — *(Protected: Farmer, Admin)* Update order status (`pending`, `confirmed`, `shipped`, `delivered`, `cancelled`).

### 5. Farmer Community Forum (`/api/posts`)
- `GET /api/posts` — Fetch community discussions with comments and authors.
- `POST /api/posts` — *(Protected: Farmer, Admin)* Publish a discussion or plant disease query with image upload.
- `PUT /api/posts/:id` — *(Protected)* Edit post title or content.
- `DELETE /api/posts/:id` — *(Protected)* Delete post.
- `GET /api/posts/:postId/comments` — Fetch comments on a specific post.
- `POST /api/posts/:postId/comments` — *(Protected: Farmer, Admin)* Add a reply or advice to a post.
- `DELETE /api/comments/:id` — *(Protected)* Delete a comment.

### 6. Fertilizer Price Tracking (`/api/fertilizers`)
- `GET /api/fertilizers` — List 24+ standard fertilizers with notified prices.
- `GET /api/fertilizers/:id/price` — Fetch brand-wise pricing for a specific fertilizer.
- `POST /api/fertilizers/sync` — *(Protected: Admin)* Trigger real-time sync with Agrisnet server.

### 7. Government Schemes & Subsidies (`/api/schemes`)
- `GET /api/schemes` — Fetch all active schemes with keyword search and category filters.
- `GET /api/schemes/categories` — List available scheme categories.
- `GET /api/schemes/:id` — Fetch detailed scheme criteria, benefits, and document checklist.
- `POST /api/schemes` — *(Protected: Admin)* Create a new verified government scheme.
- `PUT /api/schemes/:id` — *(Protected: Admin)* Update scheme subsidy rate or eligibility.
- `DELETE /api/schemes/:id` — *(Protected: Admin)* Soft-delete or archive a scheme.

### 8. AgriBot AI Assistant (`/api/chat`)
- `POST /api/chat` — Send query to Gemini AI with platform context. Accepts `{ message: string, language: 'en' | 'ta' }`.

### 9. Administration & Doctors (`/api/admin` & `/api/agri-doctors`)
- `GET /api/agri-doctors` — List verified agricultural doctors by district.
- `POST /api/admin/agri-doctors` — *(Protected: Admin)* Add a doctor to the directory.
- `DELETE /api/admin/agri-doctors/:id` — *(Protected: Admin)* Remove a doctor.
- `GET /api/admin/stats` — *(Protected: Admin)* Retrieve platform KPI statistics.
- `GET /api/admin/users` — *(Protected: Admin)* List registered users.
- `DELETE /api/admin/users/:id` — *(Protected: Admin)* Remove user account.
- `GET /api/admin/products` — *(Protected: Admin)* Moderate all products.

---

## ☁️ Cloudinary Media Storage Pipeline

AgriConnect uses an intelligent **dual-mode media pipeline** in `backend/middleware/upload.js`:

```text
Image Uploaded
      │
      ▼
Is CLOUDINARY_CLOUD_NAME configured in .env?
     ├── YES ──► Uploads directly to Cloudinary CDN via upload_stream
     │           Returns persistent HTTPS URLs (e.g., https://res.cloudinary.com/...)
     │
     └── NO  ──► Falls back seamlessly to local disk storage in backend/uploads/
                 Served statically via Express (/uploads/*)
```

> **Production Recommendation:** Add your free Cloudinary credentials to your production environment variables to ensure image URLs persist across serverless restarts and deployments.

---

## 🚢 Deployment on Vercel

AgriConnect is pre-configured for seamless deployment on Vercel as two decoupled services:

### 1. Deploy the Backend
1. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New > Project**.
2. Select your `agriconnect` Git repository.
3. Set **Root Directory** to `agriculture-platform/backend`.
4. Under **Environment Variables**, add:
   - `MONGODB_URI` / `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL` (your frontend Vercel URL, or `*`)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `GEMINI_API_KEY`
5. Click **Deploy**. Note down the deployment URL (e.g., `https://agriconnect-backend.vercel.app`).

### 2. Deploy the Frontend
1. In Vercel, import the same repository again as a second project.
2. Set **Root Directory** to `agriculture-platform/frontend`.
3. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://agriconnect-backend.vercel.app/api`
4. Click **Deploy**.
5. Your production full-stack platform is now live!

---

## 🧪 Manual Testing & Verification Guide

Follow this standard verification sequence to test all platform roles:

1. **User Registration:**
   - Register a **Farmer** (`farmer@demo.com` / `Farmer123!`).
   - Register a **Buyer** (`buyer@demo.com` / `Buyer123!`).
   - Register a **Rental Owner** (`owner@demo.com` / `Owner123!`).
2. **Farmer Flow:**
   - Log in as the Farmer.
   - Navigate to **My Products** > **Add Product**. Upload a crop photo and submit.
   - Confirm the crop appears in your inventory.
3. **Buyer Flow:**
   - Log in as the Buyer.
   - Open **Marketplace**. Find the product listed by the farmer.
   - Click **Add to Cart**, proceed to `/cart`, and place the order.
   - Verify the order appears in **Purchases** with status `Pending`.
4. **Order Fulfillment:**
   - Switch back to the Farmer account.
   - Open **Customer Orders** and confirm the new order has arrived.
   - Update the status to `Confirmed` and then `Shipped`.
5. **Machinery Rental Flow:**
   - Log in as the Rental Owner.
   - Open **Add Equipment** and list a Tractor with rental rates and district.
   - Log in as the Farmer, navigate to **Rent Equipment**, find the tractor, enter acreage (e.g., `5 acres`), and click **Book Equipment**.
   - Switch back to the Rental Owner dashboard and **Accept** the booking.
6. **Govt Schemes & Subsidies:**
   - Navigate to **Govt Schemes**.
   - Use the Landholding Calculator (Select *Small Farmer - 2.5 to 5 Acres*).
   - Verify 100% subsidy for PMKSY Micro-Irrigation and SMAM machinery grants appear.
   - Click **Official Portal** to verify external redirection.
7. **AgriBot AI Assistant:**
   - Click the floating green AgriBot widget on the bottom right.
   - Ask in English: *"How can I get 100% subsidy for drip irrigation in Tamil Nadu?"*
   - Ask in Tamil: *"தக்காளி பயிரில் இலை சுருட்டை நோயை கட்டுப்படுத்துவது எப்படி?"*
   - Verify AgriBot responds with accurate, well-formatted agronomic advice.
8. **Admin Governance:**
   - Log in as Admin (`admin@agriconnect.com` / password configured in `.env`).
   - Review live platform metrics under `/admin`.
   - Test adding a new certified Agri Doctor and verify their listing appears in the regional directory.

---

## ❓ Troubleshooting & FAQ

<details>
<summary><b>1. MongoDB connection fails (MongooseServerSelectionError)</b></summary>

- If using local MongoDB, ensure the service is running (`mongod` or via Windows Services).
- If using MongoDB Atlas, make sure you have allowed network access from anywhere (`0.0.0.0/0`) in your Atlas Network Access Security Settings.
- Verify `MONGODB_URI` in `backend/.env` is formatted properly without unescaped special characters in the password.
</details>

<details>
<summary><b>2. Uploaded photos do not show up after deployment on Vercel</b></summary>

- Serverless platforms like Vercel have read-only temporary file systems.
- Make sure you have entered `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in your backend environment variables so that images are hosted permanently on Cloudinary CDN.
</details>

<details>
<summary><b>3. AgriBot gives fallback answers instead of live AI responses</b></summary>

- Check that `GEMINI_API_KEY` in `backend/.env` is valid and has active quota from [Google AI Studio](https://aistudio.google.com/).
- Note that AgriBot's built-in heuristic system is designed to provide answers even without an active Gemini API key so that the platform never crashes.
</details>

<details>
<summary><b>4. CORS error when calling backend from frontend</b></summary>

- Ensure `CLIENT_URL` in `backend/.env` matches your frontend origin (e.g. `http://localhost:5173`).
- For multi-domain deployments, you can set `CLIENT_URL=*` in production.
</details>

---

## 📄 License & Acknowledgments

This project is released under the **MIT License**.

- Built with modern open-source technologies: [React](https://react.dev/), [Vite](https://vitejs.dev/), [Express.js](https://expressjs.com/), [MongoDB](https://www.mongodb.com/), [Bootstrap](https://getbootstrap.com/), and [Cloudinary](https://cloudinary.com/).
- Agricultural data references adapted from the **Tamil Nadu Agricultural University (TNAU) Agritech Portal** and **Agrisnet Tamil Nadu**.
- AI services powered by **Google Gemini AI**.
