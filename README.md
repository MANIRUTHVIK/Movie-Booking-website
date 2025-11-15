# 🚀 Quick Start Guide

## Start the Application

### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

✅ Backend will run on **http://localhost:3000**

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

✅ Frontend will run on **http://localhost:5173**

---

## First Time Usage

### 1. Create User Account

1. Open browser to `http://localhost:5173`
2. You'll see the login page
3. Click "Create a new account"
4. Enter:
   - Name: `John Doe`
   - Email: `user@example.com`
   - Password: `password123`
5. Click "Sign up"
6. You're now logged in! ✅

### 2. Create Admin Account

1. Click "Logout" in the navbar
2. Click "Create a new account"
3. Enter:
   - Name: `Admin User`
   - Email: `admin@example.com`
   - Password: `admin123`
   - **Note**: The backend sets role to "user" by default
4. For testing, you can modify the backend or create a user and manually change role to "admin" in MongoDB

---

## Test the User Flow

### Browse Movies

- Currently no movies → Admin needs to add them first
- Or if movies exist → Browse, search, filter

### Book a Movie (If shows available)

1. Click "Book Tickets" on a movie
2. Select a show time
3. Click "Select Seats"
4. Choose your seats (click to toggle)
5. Click "Proceed to Payment"
6. Enter test card details:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/2025)
   - CVC: Any 3 digits (e.g., 123)
   - Name: Your name
7. Click "Pay & Confirm Booking"
8. Success! ✅

### View Bookings

1. Click "Profile" in navbar
2. See your booking history
3. Each booking shows status, seats, and amount

---

## Test the Admin Flow

### Add Movies

1. Login as admin
2. You'll see "Admin Dashboard"
3. Click "Movies" tab
4. Click "+ Add Movie"
5. Fill in:
   - Title: `Inception`
   - Description: `A mind-bending thriller`
   - Duration: `148`
   - Language: `English`
   - Genre: `Sci-Fi`
6. Click "Add Movie"
7. Movie appears in table! ✅

### Add Shows

1. Click "Shows" tab
2. Click "+ Add Show"
3. Fill in:
   - Movie: Select from dropdown
   - Date: Future date
   - Time: e.g., `19:00`
   - Screen: `1`
   - Price: `12.00`
   - Seats: `50`
4. Click "Add Show"
5. Show appears in table! ✅

### Manage Users

1. Click "Users" tab
2. See all registered users
3. Can delete users if needed

---

## Expected Results

### User Experience

✅ Can browse movies
✅ Can search and filter
✅ Can select shows
✅ Can pick seats interactively
✅ Can complete payment
✅ Can view booking history

### Admin Experience

✅ Can add/edit/delete movies
✅ Can schedule shows
✅ Can manage users
✅ Can see real-time data

---

## File Structure

```
Movie Booking website/
├── backend/              ← DO NOT MODIFY
│   ├── server.js
│   ├── models/
│   ├── config/
│   └── ...
│
├── frontend/             ← ALL NEW CODE HERE
│   ├── src/
│   │   ├── components/   ← 10 components
│   │   ├── pages/        ← 6 pages
│   │   ├── context/      ← Auth context
│   │   ├── utils/        ← API client
│   │   ├── App.jsx       ← Routes
│   │   ├── App.css       ← Styles
│   │   └── index.css     ← Global styles
│   └── package.json
│
├── COMPLETION_SUMMARY.md ← What was built
├── USER_GUIDE.md         ← How to use
└── README.md            ← This file
```

---

## Troubleshooting

### Backend not starting

```bash
cd backend
npm install
npm run dev
```

### Frontend not starting

```bash
cd frontend
npm install
npm run dev
```

### No movies showing

- Login as admin
- Add movies first
- Then add shows for those movies

### Payment fails

- Use test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC

### Can't access admin

- Make sure you're logged in as admin
- Role must be "admin" in database

---

## Key URLs

| Page            | URL               | Access      |
| --------------- | ----------------- | ----------- |
| Login/Register  | `/auth`           | Public      |
| Movies          | `/`               | Users       |
| Shows           | `/shows/:movieId` | Users       |
| Booking         | `/booking`        | Users       |
| Profile         | `/profile`        | Users       |
| Admin Dashboard | `/admin`          | Admins only |

---

## Technology Stack

**Frontend**

- React 19
- React Router DOM 7
- Axios
- Vite

**Backend** (Already built)

- Node.js
- Express
- MongoDB
- Stripe

---

## Color Scheme

All styling uses **black, white, and grey**:

- Background: Black (#000)
- Cards: Dark Grey (#1a1a1a)
- Text: White (#fff)
- Accents: Grey shades

---

## Features Implemented

✅ User authentication (register/login)
✅ Movie browsing with search & filters
✅ Show selection
✅ Interactive seat selection
✅ Stripe payment integration
✅ Booking history
✅ Admin dashboard
✅ Movie management
✅ Show scheduling
✅ User management
✅ Protected routes
✅ Responsive design
✅ Modern animations
✅ Error handling
✅ Loading states

---

## 🎉 You're All Set!

Your complete movie booking platform is ready to use!

**Backend**: http://localhost:3000
**Frontend**: http://localhost:5173

Happy booking! 🍿🎬
