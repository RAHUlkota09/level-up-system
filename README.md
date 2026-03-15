# ⚡ LEVEL UP SYSTEM
### Solo Leveling Inspired Personal Fitness Tracker

---

## 🎮 WHAT IS THIS?

A full-stack fitness tracking web application inspired by the **Solo Leveling** anime/novel.
The system acts as an AI coach that assigns daily missions, tracks your nutrition,
monitors your stats, and rewards you with XP and level-ups — just like the System in Solo Leveling.

**Designed for Indian users** with Indian food database, Indian dietary habits, and
protein targets tailored for muscle gain / fat loss goals.

---

## 🖥️ TECH STACK

| Layer       | Technology             |
|-------------|------------------------|
| Frontend    | React.js + Tailwind CSS + Framer Motion |
| Backend     | Node.js + Express.js   |
| Database    | MongoDB                |
| Auth        | JWT (JSON Web Tokens)  |
| Charts      | Chart.js + react-chartjs-2 |

---

## 📁 PROJECT STRUCTURE

```
level-up-system/
│
├── backend/                    ← Node.js + Express server
│   ├── server.js               ← Main entry point (starts server)
│   ├── package.json            ← Backend dependencies
│   ├── .env.example            ← Environment variable template
│   │
│   ├── config/
│   │   ├── aiEngine.js         ← Rule-based AI decision engine
│   │   └── foodDatabase.js     ← Indian food nutritional database
│   │
│   ├── controllers/            ← Business logic for each feature
│   │   ├── authController.js   ← Register / Login
│   │   ├── missionController.js← Mission CRUD + completion
│   │   ├── nutritionController.js ← Food logging
│   │   └── statsController.js  ← Stats + weight tracking
│   │
│   ├── middleware/
│   │   └── auth.js             ← JWT verification middleware
│   │
│   ├── models/                 ← MongoDB schemas
│   │   ├── User.js             ← User profile + stats + XP
│   │   ├── Mission.js          ← Daily missions
│   │   ├── FoodLog.js          ← Food entries
│   │   ├── WeightLog.js        ← Weight history
│   │   └── XPProgress.js       ← XP history
│   │
│   └── routes/                 ← API route definitions
│       ├── auth.js
│       ├── missions.js
│       ├── nutrition.js
│       ├── stats.js
│       ├── user.js
│       └── xp.js
│
├── frontend/                   ← React.js application
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   │
│   ├── public/
│   │   └── index.html          ← HTML shell
│   │
│   └── src/
│       ├── App.js              ← Routes + Auth provider
│       ├── index.js            ← React entry point
│       │
│       ├── styles/
│       │   └── index.css       ← Global CSS + Solo Leveling theme
│       │
│       ├── hooks/
│       │   └── useAuth.js      ← Auth context + hooks
│       │
│       ├── services/
│       │   └── api.js          ← All API call functions
│       │
│       ├── components/
│       │   └── ui/
│       │       └── MainLayout.jsx ← Sidebar nav layout
│       │
│       └── pages/
│           ├── LoginPage.jsx
│           ├── RegisterPage.jsx
│           ├── DashboardPage.jsx   ← Main hub
│           ├── MissionsPage.jsx    ← Quest board
│           ├── NutritionPage.jsx   ← Food tracker
│           ├── StatsPage.jsx       ← Charts + stats
│           └── ProfileSetupPage.jsx
│
└── README.md                   ← This file
```

---

## 🚀 INSTALLATION GUIDE (BEGINNER FRIENDLY)

### STEP 1 — Install Node.js

1. Go to https://nodejs.org
2. Download the **LTS version** (recommended)
3. Install it (click Next → Next → Install)
4. Verify installation — open Terminal / Command Prompt and type:

```bash
node --version
# Should print something like: v18.17.0

npm --version
# Should print something like: 9.6.7
```

---

### STEP 2 — Install MongoDB

**Option A: MongoDB Community Server (Local)**
1. Go to https://www.mongodb.com/try/download/community
2. Download for your OS (Windows/Mac/Linux)
3. Install it
4. Start MongoDB service:
   - Windows: It auto-starts as a service
   - Mac: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

**Option B: MongoDB Atlas (Free Cloud — Easier for beginners)**
1. Go to https://cloud.mongodb.com
2. Create a free account
3. Create a free cluster
4. Get your connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/levelupsystem`)
5. Use this string in your `.env` file (see Step 4)

---

### STEP 3 — Download / Clone the Project

If you have Git installed:
```bash
git clone <repository-url>
cd level-up-system
```

Or just download the ZIP and extract it.

---

### STEP 4 — Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install all dependencies
npm install

# Create your .env file from the template
# On Windows:
copy .env.example .env

# On Mac/Linux:
cp .env.example .env
```

Now open the `.env` file in VS Code and fill in your values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/levelupsystem
JWT_SECRET=mySecretKey12345ChangeThis
NODE_ENV=development
```

> ⚠️ Change `JWT_SECRET` to any random string — this is used to sign auth tokens

---

### STEP 5 — Setup Frontend

```bash
# Open a NEW terminal tab/window
# Navigate to frontend folder
cd frontend

# Install all dependencies (this takes 2-3 minutes)
npm install
```

---

### STEP 6 — Run the Application

You need **two terminals** open simultaneously.

**Terminal 1 — Start Backend:**
```bash
cd backend
npm run dev
# You should see:
# ╔══════════════════════════════════════╗
# ║      LEVEL UP SYSTEM - BACKEND       ║
# ╠══════════════════════════════════════╣
# ║  ✓ MongoDB Connected Successfully    ║
# ║  ✓ Server running on port 5000       ║
# ║  ✓ System Status: ONLINE             ║
# ╚══════════════════════════════════════╝
```

**Terminal 2 — Start Frontend:**
```bash
cd frontend
npm start
# Browser will open automatically at http://localhost:3000
```

---

## 🎮 USING THE APPLICATION

### First Time Setup:
1. Open http://localhost:3000 in your browser
2. Click **REGISTER** to create your account
3. Fill in your physical stats (height, weight, age, goal)
4. The system will calculate your calorie and protein targets
5. You'll be taken to the **Dashboard**

### Daily Usage:
1. **Dashboard** — See your level, XP, today's missions, nutrition progress
2. **Missions** — Complete daily quests to earn XP and level up
3. **Nutrition** — Log your meals using the Indian food database
4. **Stats** — See your progress charts and stat attributes
5. **Profile** — Update your weight/goals anytime

---

## ⚙️ HOW TO MODIFY THE APP

### Add New Food Items
Open `backend/config/foodDatabase.js` and add a new entry:
```javascript
{
  name: 'Rajma (Kidney Beans)',
  category: 'protein',
  per100g: { protein: 9, carbs: 23, fats: 0.5, calories: 127 },
  commonServings: [{ name: '1 cup cooked', grams: 200 }]
}
```

### Add New Mission Types
Open `backend/config/aiEngine.js` and add to `missionTemplates`:
```javascript
workout: [
  // ... existing missions ...
  {
    title: 'Do 200 Jumping Jacks',
    description: 'Full body warm-up',
    difficulty: 'medium',
    xpReward: 70,
    target: 200,
    unit: 'reps'
  }
]
```

### Change XP Formula
Open `backend/config/aiEngine.js` and modify `xpForLevel`:
```javascript
const xpForLevel = (level) => {
  // Change this formula to adjust leveling speed
  return level * 150 + (level - 1) * 75; // Slower leveling
};
```

### Modify AI Penalties
Open `backend/config/aiEngine.js`, find `analyzeUserPerformance()`:
```javascript
// Change the threshold for warnings
if (missionCompletionRate < 0.6) { // Was 0.5 — stricter now
  // Apply penalty
}
```

### Change Color Theme
Open `frontend/src/styles/index.css` and modify the color variables,
or edit `frontend/tailwind.config.js` to change the theme colors.

---

## 🔧 API ENDPOINTS REFERENCE

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | /api/auth/register              | Register new user        |
| POST   | /api/auth/login                 | Login                    |
| GET    | /api/auth/me                    | Get current user         |
| GET    | /api/missions/today             | Get today's missions     |
| PUT    | /api/missions/:id/complete      | Complete a mission       |
| POST   | /api/missions/analyze           | Run AI daily analysis    |
| GET    | /api/nutrition/foods/search     | Search food database     |
| POST   | /api/nutrition/log              | Log food entry           |
| GET    | /api/nutrition/today            | Today's food logs        |
| GET    | /api/stats                      | User stats + level       |
| PUT    | /api/stats/profile              | Update profile           |
| POST   | /api/stats/weight               | Log body weight          |

---

## 🐛 COMMON ERRORS & FIXES

**Error: "MongoDB connection failed"**
→ Make sure MongoDB is running. Run `mongod` in a terminal.
→ Or use MongoDB Atlas with the cloud connection string.

**Error: "npm install fails"**
→ Delete `node_modules` folder and `package-lock.json`, then run `npm install` again.

**Error: "Port 5000 already in use"**
→ Change `PORT=5001` in your `.env` file, and update `proxy` in `frontend/package.json`.

**Error: "Cannot find module"**
→ Make sure you ran `npm install` in BOTH the `backend` AND `frontend` folders.

**Frontend shows no data**
→ The frontend has demo data built-in. If backend is offline, it shows demo mode.
→ Start the backend server with `npm run dev` in the backend folder.

---

## 🚀 FUTURE IMPROVEMENTS

1. **Push Notifications** — Remind user to log meals and complete missions
2. **Photo Progress** — Upload before/after photos
3. **Workout Logger** — Track sets, reps, and weights for each exercise
4. **Social Features** — Compare rankings with friends
5. **Mobile App** — React Native version
6. **AI Integration** — GPT-powered personalized coaching messages
7. **Barcode Scanner** — Scan packaged food barcodes for auto nutrition data
8. **Indian Recipe Database** — Full recipes with auto macro calculation
9. **Sleep Tracking Integration** — Connect with fitness bands
10. **Dark/Light Mode Toggle**

---

## 📊 LEVELING SYSTEM EXPLAINED

| Level Range | Rank | XP to Next Level | Description |
|-------------|------|-----------------|-------------|
| 1-4         | E    | 100-350 XP      | Beginner Hunter |
| 5-9         | D    | 400-800 XP      | Novice Hunter |
| 10-14       | C    | 850-1200 XP     | Intermediate |
| 15-19       | B    | 1250-1700 XP    | Advanced |
| 20-29       | A    | 1750-2700 XP    | Expert |
| 30-39       | S    | 2750-3700 XP    | Elite |
| 40-49       | SS   | 3750-4700 XP    | Master |
| 50+         | SSS  | 4750+ XP        | Shadow Monarch |

**XP Formula:** `level × 100 + (level-1) × 50`

---

*"I alone level up."* — Sung Jin-Woo
"# level-up-system" 
