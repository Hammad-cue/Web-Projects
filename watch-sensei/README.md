# 🎬 WatchSensei

**WatchSensei** is a full-stack, server-side rendered (SSR) web application built to serve as a comprehensive tracker for movies and anime. Developed using an MVC (Model-View-Controller) architecture, the application integrates multiple external APIs (TMDB and OMDB) with a local MongoDB database to provide a seamless, dark-mode user experience. 

Users can discover trending content, view immersive media details, and manage personalized watchlists with full CRUD (Create, Read, Update, Delete) functionality.

---

## 📸 Application Showcase & Modules

### 1. The Discovery Engine (Home Page)
The landing page greets users with a dynamic carousel of daily trending content fetched live from the TMDB API, encouraging immediate engagement even before logging in.
> <img src="https://github.com/user-attachments/assets/1c463d08-6c2a-4d16-a70c-68ec64d30f97" width="975" alt="Home Page">
> <img src="https://github.com/user-attachments/assets/453b4080-4411-49eb-b509-761705f73085"width="975">


### 2. Live Search & Explore
The Explore page utilizes URL query parameters to manage state. If the search bar is empty, it defaults to a paginated "Trending This Week" view. If a user searches, it queries the TMDB database for specific matches.
> <img src="https://github.com/user-attachments/assets/2dbcf200-fd89-46aa-b3dc-26a85f4ff020" width="975" alt="Explore Page">

### 3. Immersive Details & Dual-API Mashup
The Details page acts as a mini-IMDb. It dynamically renders a cinematic background, embeds a playable YouTube trailer, and performs a secondary API call to OMDB to fetch external critical consensus (Rotten Tomatoes, Metacritic).
<p align="center">
<img src="https://github.com/user-attachments/assets/5edc2e20-d679-43a0-a8d6-a6c3467a9d24" width="468" alt="Details Page">
</p>

### 4. Personalized Watchlist (CRUD Operations)
Authenticated users have a private database array. The interface allows them to filter their list by status, update their progress via dropdowns, and remove items seamlessly.
> <img src="https://github.com/user-attachments/assets/6f613159-b60e-48c2-a8a5-d9a9e878fa92" width="975" alt="Watchlist Page">

### 5. Dashboard Stats Module
A dedicated analytical view providing users with insights into their viewing habits, including total titles completed, currently watching, and preferred genres.
<img src="https://github.com/user-attachments/assets/4257c1e4-428d-4bc7-8dd7-522ef0f2c25b" width="975" alt="Dashboard Stats">

### 6. Secure Authentication & Input Validations
Robust server-side checks ensure data integrity and security. The system enforces strict regex formatting (alphanumeric and underscores only, 3-20 characters) for usernames, a minimum password length of 6 characters, and checks for duplicate accounts.
<p align="center">
<img src="https://github.com/user-attachments/assets/84406938-6d56-4278-8796-cce295c34b00" width="450" alt="Login Screen">
</p> 
Above: User Login Interface.
<p align="center">
<img src="https://github.com/user-attachments/assets/71fa2b7c-1afd-4cb6-a5df-fe779e358956" width="450" alt="Register Validation">
</p> 
Above: Server-side validation errors displayed to the user (e.g., duplicate username, weak password).

---

## ✨ Key Features

* **Discovery Engine:** Displays a carousel of live "Trending Today" and "Trending This Week" content upon opening the app.
* **Live Search:** Search the global TMDB database for millions of movies and anime.
* **Dual-API Details Pages:** Immersive detail pages that display high-res backdrops, YouTube trailers, top cast, TMDB user reviews, and an API mashup fetching critical scores (Rotten Tomatoes, Metacritic, IMDb) from OMDB.
* **Personalized Watchlist (CRUD):** Authenticated users can add items, update their watch status (Watching, Completed, Dropped), rate them out of 10, and delete them. Database queries are strictly locked to the authenticated user's session ID.
* **Dashboard Analytics:** Visual breakdown of watchlist statistics and user viewing metrics.
* **Secure Authentication:** User passwords are securely hashed utilizing `bcryptjs` with a salt factor of 10 before saving to the MongoDB cluster, and sessions are managed via `express-session`.

---

## 🛠️ Tech Stack

* **Frontend:** EJS (Embedded JavaScript templates), HTML5, Bootstrap 5, Custom CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose (ODM)
* **External APIs:** * [TMDB API](https://developer.themoviedb.org/docs) (Core movie/anime data, trailers, cast)
  * [OMDB API](https://www.omdbapi.com/) (External ratings/badges)

---

## 📂 Project Structure

WatchSensei follows a clean MVC (Model-View-Controller) architecture to separate business logic, data models, and user interfaces.

```text
WATCH-SENSEI/
├── bin/                    # Executable scripts (e.g., server startup)
├── controllers/            # Core business logic and request handling
│   ├── authController.js
│   ├── detailsController.js
│   ├── profileController.js
│   ├── searchController.js
│   └── watchlistController.js
├── middleware/             # Custom middleware functions
│   └── authMiddleware.js   # Route protection and session verification
├── models/                 # Mongoose database schemas
│   ├── User.js
│   └── WatchlistItem.js
├── public/                 # Static assets (CSS, client-side JS, images)
├── routes/                 # Express route definitions mapping URLs to controllers
│   ├── auth.js
│   ├── details.js
│   ├── index.js
│   ├── profile.js
│   ├── search.js
│   ├── users.js
│   └── watchlist.js
├── views/                  # EJS templates for server-side HTML rendering
│   ├── details.ejs
│   ├── error.ejs
│   ├── index.ejs
│   ├── layout.ejs
│   ├── login.ejs
│   ├── profile.ejs
│   ├── register.ejs
│   └── search.ejs
├── .env                    # Environment variables (Ignored in Git)
├── app.js                  # Main Express application setup and config
├── package.json            # Project metadata and npm dependencies
└── README.md               # Project documentation
```
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
    git clone [https://github.com/Hammad-cue/Web-Projects/tree/main/watch-sensei](https://github.com/Hammad-cue/Web-Projects/tree/main/watch-sensei)
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

### 3. Watchlist & Dashboard Management - *Requires Authentication*
| Method | Endpoint | Description | Response / Action |
| :--- | :--- | :--- | :--- |
| `GET` | `/watchlist` | Fetches user's list. Accepts `?status=` query for filtering. | Renders `watchlist.ejs` |
| `POST`| `/watchlist/add` | **Create:** Saves a new movie/anime to the user's DB. | Redirects to `/watchlist` |
| `POST`| `/watchlist/update/:id`| **Update:** Modifies the watch status and rating of an item. | Redirects to `/watchlist` |
| `POST`| `/watchlist/delete/:id`| **Delete:** Removes an item from the user's DB. | Redirects to `/watchlist` |
| `GET` | `/dashboard` | Aggregates and displays user watchlist statistics. | Renders `dashboard.ejs` |

---

*Developed by Hammad Khawar (SP23-BSE-006) for Advanced Web Technologies, COMSATS University Islamabad Vehari.*
