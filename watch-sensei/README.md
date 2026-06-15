# 🎬 WatchSensei

> **Your Cinematic Universe, Mastered.**

WatchSensei is a premium, full-stack, AI-powered cinematic discovery and tracking platform. Built with a Netflix-tier aesthetic, it integrates live TMDB data, multi-source rating aggregation (TMDB + OMDB), and a Groq LLM recommendation engine to let users discover, track, and get personalized picks for movies and TV shows — all in one place.

---

## 🖼️ Application Showcase

### 🏠 Home — Cinematic Hero
The landing page features a dynamic collage of classic film posters as a live background, overlaid with a deep vignette mask and red ambient glow effects. Authenticated users see a **"Go to My Dashboard"** CTA instead of Sign Up / Sign In.
<p align="center"> 
<img width="468"  alt="localhost_5173-frontend-fpscreenshot (3)" src="https://github.com/user-attachments/assets/fc8f9664-ca45-4cda-a647-dc583d6feb56" />
</p>

---

### 🔍 Discover — Live Trending + Cross-Reference Engine
The Discover page fetches **live weekly trending** data from TMDB and displays it as a responsive poster grid. It simultaneously loads the user's watchlist into an in-memory dictionary for O(1) lookups. Cards already in the user's library display a disabled **"✓ In Watchlist"** button instead of the add action. A persistent **Heart** icon on every card saves a `liked` flag directly to MongoDB via a `PUT` request.

<p align="center"> 
<img width="468"  alt="Screenshot 2026-06-15 060749" src="https://github.com/user-attachments/assets/86ecbd08-527a-46c9-950d-cb773512f199" />

</p>

---

### 🎬 Cinematic Detail View — Dual-API Mashup
Each media page is a fully immersive experience:
- **Aggregated Ratings** from TMDB, IMDb, Rotten Tomatoes, and Metacritic (via OMDB)
- **Streaming Providers** sourced from the TMDB watch-provider endpoint
- **Top Cast** avatar grid with actor and character names
- **User Voices** — three TMDB user review cards
- **YouTube Trailer** embed in a full-screen modal overlay
- **"More Like This"** — horizontally scrolling carousel with mathematical edge-detection to dynamically enable/disable nav arrows at scroll boundaries

<p align="center"> 
<img width="468" alt="localhost_5173-frontend-fpscreenshot (5)" src="https://github.com/user-attachments/assets/7bfbf320-576e-4098-b534-9bf36b212273" />

</p>

---

### 🤖 Ask the Sensei — AI Recommendation Engine
The flagship feature. Users either complete a **3-question mood quiz** or hit **"Surprise Me"** for an instant pick.

**How it works:**
1. Answers (or a randomised hidden theme + Unix timestamp for Surprise Me) are sent to `POST /api/recommend`
2. The backend builds a structured prompt and calls the **Groq API** (`meta-llama/llama-4-scout-17b-16e-instruct`) with strict JSON output enforcement
3. The parsed titles are immediately enriched with official TMDB poster URLs and routing IDs
4. Three recommendation cards are returned to the frontend — each with a poster, year, media-type badge, and **"The Sensei's Reasoning"**

The timestamp injection in Surprise Me guarantees non-repetitive results across every call.

<p align="center"> 
<img width="468" alt="Screenshot 2026-06-13 082213" src="https://github.com/user-attachments/assets/57ea9315-a689-4fde-af18-f13f09b83cab" />

</p>
<p align="center"> 
<img width="468" alt="Screenshot 2026-06-13 082229" src="https://github.com/user-attachments/assets/f91ec726-2a26-4cc4-bfbc-141d78a285d3" />

</p>
<p align="center"> 
<img width="468"  alt="localhost_5173-frontend-fpscreenshot (2)" src="https://github.com/user-attachments/assets/ca91c1c0-b0a4-4f64-ad3a-59afb8712612" />

</p>

---

### 📋 My Universe — Overhauled Watchlist
The watchlist is titled **"My Universe"** and renders the user's saved items as a poster grid with:
- **Status badge** (Plan to Watch / Watching / Completed / Dropped)
- **Interactive 5-star rating** (rendered via Lucide React icons)
- **Heart overlay** in the bottom-right corner of each poster
- **Hover-reveal glassmorphic overlay** exposing Edit and Delete controls — hidden by default to keep the grid clean

**Three-axis live filtering** (no extra API calls):

| Filter | Options |
|--------|---------|
| Media Type | All Media / Movie / TV |
| Status | All / Plan to Watch / Watching / Completed / Dropped |
| Favorites | All / Favorites Only |

**Edit Modal** — a cinematic overlay with a blurred backdrop presenting a status dropdown and an interactive star row, firing a single `PUT /api/watchlist/:id` on save.

**Duplicate protection** — the MongoDB compound unique index on `{ user, externalApiId }` returns a `409 Conflict` that the frontend intercepts to fire an "Already in your watchlist!" toast.

![My Universe](https://github.com/Hammad-cue/Web-Projects/assets/placeholder/watchlist.png)
![Edit Modal](https://github.com/Hammad-cue/Web-Projects/assets/placeholder/edit_modal.png)

---

### 👤 Profile & Account Settings
A protected route accessible only to authenticated users. Exposes:
- **Profile Card** — initials avatar, username, "Sensei Member" badge
- **Account Settings** — update email and configure **Sensei AI Strictness** (Balanced / Strict / Adventurous), which adjusts how the LLM filters recommendations
- **Danger Zone** — permanent account and watchlist deletion

<p align="center"> 
<img width="468" alt="localhost_5173-frontend-fpscreenshot (6)" src="https://github.com/user-attachments/assets/9d693fdb-b508-4d51-81d2-4a6c556b3326" />

</p>

---

### 🔐 Authentication
Session-based auth using `express-session` and `cookie-parser`. Login sets an `HttpOnly` session cookie. All protected API endpoints check `req.session.user` before responding. A `<ProtectedRoute>` wrapper in `App.jsx` redirects unauthenticated React Router navigations to `/login` instantly.



---

## ✨ Key Features at a Glance

| Feature | Detail |
|---------|--------|
| 🎥 Live Discovery | Weekly trending pulled from TMDB on every page load |
| 🔍 Smart Search | Full TMDB search with instant results |
| 🌟 Dual-API Ratings | TMDB + OMDB (IMDb / RT / Metacritic) on every detail page |
| 📺 Streaming Providers | TMDB watch-provider logos per title |
| 🤖 AI Recommendations | Groq LLaMA 4 — quiz mode + Surprise Me with guaranteed uniqueness |
| 📋 Full CRUD Watchlist | Add, edit (status + 5-star rating + like), delete |
| ❤️ Persistent Hearts | Cross-page like state synced to MongoDB in real time |
| 🔄 Cross-Reference Engine | Discover page compares live TMDB feed against user's DB dictionary |
| 🎭 Live Filter | 3-axis client-side filter (type / status / favorites) |
| 🔒 Protected Routes | React + Express dual-layer session auth |
| 👤 Profile Settings | Email, AI strictness, account deletion |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Role |
|-----------|------|
| **React.js** (Vite) | UI framework and component model |
| **React Router DOM** | Client-side routing + `<ProtectedRoute>` |
| **Axios** | HTTP client for all API calls |
| **React Hooks** (`useState`, `useEffect`, `useRef`) | Local state and side effects |
| **Pure CSS** (Variables, Flexbox, Grid, `backdrop-filter`) | All styling — no UI library |
| **Lucide React** | Interactive star-rating icons |
| **React Hot Toast** | Non-blocking notification toasts |

### Backend
| Technology | Role |
|-----------|------|
| **Node.js** | Runtime |
| **Express.js** (ES Modules) | HTTP server and routing |
| **MongoDB** | Persistent database |
| **Mongoose** | ODM — schema definition and validation |
| **express-session** + **cookie-parser** | Session-based authentication |

### External APIs
| API | Usage |
|-----|-------|
| **TMDB API** | Metadata, search, trending, cast, trailers, streaming providers, similar titles |
| **OMDB API** | IMDb rating, Rotten Tomatoes %, Metacritic score |
| **Groq API** (`meta-llama/llama-4-scout-17b-16e-instruct`) | JSON-enforced LLM inference for AI recommendations |

---

## 📂 Project Structure

```
watch-sensei/
├── frontend/                          # React Application (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Auth-aware smart navigation
│   │   │   └── ProtectedRoute.jsx     # Client-side route guard
│   │   ├── pages/
│   │   │   ├── Home.jsx               # Landing / hero page
│   │   │   ├── Search.jsx             # Discover + cross-reference engine
│   │   │   ├── Detail.jsx             # Cinematic media detail view
│   │   │   ├── Recommend.jsx          # AI quiz & Surprise Me UI
│   │   │   ├── Watchlist.jsx          # My Universe — full CRUD UI
│   │   │   └── Profile.jsx            # Account settings & danger zone
│   │   ├── App.jsx                    # Route definitions + ProtectedRoute
│   │   └── index.css                  # Global cinematic styles + ambient glow
│   └── package.json
│
└── backend/                           # Express Node.js Server
    ├── bin/
    │   └── www                        # Server entry point
    ├── models/
    │   ├── User.js                    # Username + password schema
    │   └── WatchlistItem.js           # Full watchlist item schema
    ├── controllers/
    │   └── watchlistController.js     # PUT & DELETE business logic
    ├── routes/
    │   ├── auth.js                    # Register / Login / Logout
    │   ├── details.js                 # TMDB + OMDB aggregation
    │   ├── profile.js                 # Account settings
    │   ├── recommend.js               # Groq AI pipeline + TMDB enrichment
    │   └── watchlist.js               # Full CRUD endpoints
    ├── app.js                         # Express app config (ESM)
    └── .env                           # API secrets (git-ignored)
```

---

## 🗄️ Data Models

### `User`
```javascript
{
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },   // bcrypt-hashed
  timestamps: true
}
```

### `WatchlistItem`
```javascript
{
  user:          { type: ObjectId, ref: 'User', required: true },
  externalApiId: { type: String, required: true },
  title:         { type: String, required: true },
  poster_url:    { type: String },
  mediaType:     { type: String, enum: ['movie', 'tv'], default: 'movie' },
  status:        { type: String, enum: ['Plan to Watch', 'Watching', 'Completed', 'Dropped'],
                   default: 'Plan to Watch' },
  liked:         { type: Boolean, default: false },
  rating:        { type: Number, min: 1, max: 10, default: null },
  timestamps:    true
}
// Compound unique index — prevents duplicate entries per user
watchlistItemSchema.index({ user: 1, externalApiId: 1 }, { unique: true });
```

---

## 📡 REST API Reference

> **Base URL:** `http://localhost:5000/api` (backend) · **Frontend:** `http://localhost:5173`

### Authentication (`/auth`)
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Create a new account | `{ username, password }` |
| `POST` | `/auth/login` | Authenticate and set session cookie | `{ username, password }` |
| `POST` | `/auth/logout` | Destroy current session | — |

### Profile (`/api/profile`)
| Method | Endpoint | Description | Body / Auth |
|--------|----------|-------------|-------------|
| `GET` | `/api/profile` | Get authenticated user's profile | 🔒 Cookie |
| `PUT` | `/api/profile` | Update email and AI strictness setting | `{ email, sensei_strictness }` |
| `DELETE` | `/api/profile` | Delete account and all watchlist data | 🔒 Cookie |

### Media Details (`/api/details`)
| Method | Endpoint | Description | Params |
|--------|----------|-------------|--------|
| `GET` | `/api/media/:type/:id` | Aggregated details: metadata, cast, trailers, providers, similar titles, OMDB scores | `type` = movie/tv · `id` = TMDB ID |

### AI Recommendations (`/api/recommend`)
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/recommend` | Generate 3 AI-curated picks enriched with TMDB posters | `{ surpriseMe: true }` **or** `{ answers: { vibe, setting, format } }` |

> **Note:** `/api/recommend` uses an RPC-style `POST` because the operation is a complex multi-step pipeline (LLM inference → JSON parse → TMDB enrichment), not a simple CRUD action on a named resource.

### Watchlist (`/api/watchlist`)
| Method | Endpoint | Description | Body / Params |
|--------|----------|-------------|---------------|
| `GET` | `/api/watchlist` | Get all items for the authenticated user | 🔒 Cookie |
| `POST` | `/api/watchlist` | Add a new item — returns `409` on duplicate | `{ externalApiId, title, poster_url, mediaType, status }` |
| `PUT` | `/api/watchlist/:id` | Update status, rating, or liked flag | `{ status, rating, liked }` |
| `DELETE` | `/api/watchlist/:id` | Permanently remove an item | `id` = MongoDB `_id` |

### HTTP Status Code Semantics
| Code | Meaning |
|------|---------|
| `200 OK` | Successful GET or PUT |
| `201 Created` | Successful POST — new resource created |
| `204 No Content` | Successful DELETE |
| `401 Unauthorized` | Missing or invalid session |
| `409 Conflict` | Duplicate watchlist entry attempt |
| `500 Internal Server Error` | Unhandled server error |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally on port `27017` (or a MongoDB Atlas URI)
- API keys for **TMDB**, **OMDB**, and **Groq**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Hammad-cue/Web-Projects.git
   cd Web-Projects/watch-sensei
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in `/backend`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/watchsensei
   SESSION_SECRET=your_super_secret_session_key
   TMDB_API_KEY=your_tmdb_api_key
   OMDB_API_KEY=your_omdb_api_key
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Run both servers**

   In one terminal (backend):
   ```bash
   cd backend && npm start
   # Running at http://localhost:5000
   ```

   In another terminal (frontend):
   ```bash
   cd frontend && npm run dev
   # Running at http://localhost:5173
   ```

---

## 🔒 Security Notes

- All protected API endpoints verify `req.session.user` before processing
- The `<ProtectedRoute>` component in React provides a **second layer** of client-side redirect for `/watchlist` and `/profile`
- MongoDB's compound unique index enforces data integrity at the database level (no application-level loop needed)
- Session cookies are `HttpOnly` — inaccessible to client-side JavaScript

---

*Developed by **Hammad Khawar** (SP23-BSE-006) for Advanced Web Technologies — CSC337, COMSATS University Islamabad, Vehari Campus.*
![Uploading localhost_5173-frontend-fpscreenshot (3).jpeg…]()
