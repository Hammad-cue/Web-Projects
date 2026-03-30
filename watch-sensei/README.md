# 🎬 WatchSensei

**WatchSensei** is a full-stack, server-side rendered web application designed to be the ultimate companion for tracking movies and anime. Built as a midterm project, it features a custom "Midnight Cinema" dark-mode UI, secure user authentication, and a dual-API mashup that pulls live data from TMDB and OMDB.

---

## ✨ Key Features

* **Discovery Engine:** Displays a carousel of live "Trending Today" and "Trending This Week" content upon opening the app.
* **Live Search:** Search the global TMDB database for millions of movies and anime.
* **Dual-API Details Pages:** Immersive detail pages that display high-res backdrops, YouTube trailers, top cast, TMDB user reviews, and an API mashup fetching critical scores (Rotten Tomatoes, Metacritic, IMDb) from OMDB.
* **Personalized Watchlist (CRUD):** Authenticated users can add items, update their watch status (Watching, Completed, Dropped), rate them out of 10, and delete them.
* **Secure Authentication:** User passwords are securely hashed using `bcryptjs`, and sessions are managed via `express-session`.

---

## 🛠️ Tech Stack

* **Frontend:** EJS (Embedded JavaScript templates), HTML5, Bootstrap 5, Custom CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose (ODM)
* **External APIs:** * [TMDB API](https://developer.themoviedb.org/docs) (Core movie/anime data, trailers, cast)
    * [OMDB API](https://www.omdbapi.com/) (External ratings/badges)

---

## 🚀 Getting Started

Follow these instructions to run WatchSensei on your local machine.

### Prerequisites
1.  **Node.js** installed on your machine.
2.  **MongoDB** installed and running locally on port `27017` (or a MongoDB Atlas URI).
3.  API Keys for TMDB and OMDB.

### Installation
1.  **Clone or unzip the repository:**
    ```bash
    git clone <repository-url>
    cd watchsensei
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and add the following keys:
    ```env
    PORT=3000
    MONGODB_URI=mongodb://127.0.0.1:27017/watchsensei
    SESSION_SECRET=your_super_secret_session_key
    TMDB_API_KEY=your_tmdb_api_key_here
    OMDB_API_KEY=your_omdb_api_key_here
    ```

4.  **Start the server:**
    ```bash
    npm start
    ```
    *The app will be running at `http://localhost:3000`*

---

## 📡 Application Routes & API Endpoints

WatchSensei follows an MVC (Model-View-Controller) architecture. Below is the documentation for the internal application routes.

### 1. Public Routes & Discovery
| Method | Endpoint | Description | Response / Action |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Landing page. Fetches daily trending content. | Renders `index.ejs` |
| `GET` | `/search` | If `?q=` is provided, searches TMDB. If empty, fetches weekly trending. | Renders `search.ejs` |
| `GET` | `/details/:type/:id` | Dual-API Mashup. Fetches movie/tv details, trailers, and OMDB ratings. | Renders `details.ejs` |

### 2. User Authentication (`/auth`)
| Method | Endpoint | Description | Response / Action |
| :--- | :--- | :--- | :--- |
| `GET` | `/auth/register` | Displays the registration form. | Renders `register.ejs` |
| `POST`| `/auth/register` | Validates input, hashes password, creates user. | Redirects to `/search` |
| `GET` | `/auth/login` | Displays the login form. | Renders `login.ejs` |
| `POST`| `/auth/login` | Authenticates user against hashed DB credentials. | Redirects to `/watchlist`|
| `GET` | `/auth/logout` | Destroys the current user session. | Redirects to `/auth/login` |

### 3. Watchlist Management (`/watchlist`) - *Requires Authentication*
| Method | Endpoint | Description | Response / Action |
| :--- | :--- | :--- | :--- |
| `GET` | `/watchlist` | Fetches user's list. Accepts `?status=` query for filtering. | Renders `watchlist.ejs` |
| `POST`| `/watchlist/add` | **Create:** Saves a new movie/anime to the user's DB. | Redirects to `/watchlist` |
| `POST`| `/watchlist/update/:id`| **Update:** Modifies the watch status and rating of an item. | Redirects to `/watchlist` |
| `POST`| `/watchlist/delete/:id`| **Delete:** Removes an item from the user's DB. | Redirects to `/watchlist` |

---
*Developed for Midterm Project Assessment.*
