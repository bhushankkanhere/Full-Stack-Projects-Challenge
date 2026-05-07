# 🔥 Daily Habit Streak Tracker

A full-stack web application to build consistency, track your progress, and achieve your goals through habit tracking with streak counting and milestone achievements.

## 🚀 Features

### Core Functionality
- **Add & Manage Habits**: Create habits with categories, descriptions, and daily targets
- **Daily Tracking**: Mark habits as complete each day with one click
- **Streak Counting**: Automatic streak calculation and tracking
- **Calendar Heatmap**: Visual 60-day activity history
- **Milestone System**: 8 achievement levels (1, 3, 7, 14, 21, 30, 60, 90 days)
- **Real-time Stats**: Dashboard showing total habits, active streaks, best streak, and today's completions
- **Smart Progress Tracking**: Reset progress after daily target reached

### Organization
- **8 Categories**: Health, Learning, Productivity, Mindfulness, Social, Creative, Finance, Other
- **Search**: Find habits by name, category, or description
- **Filters**: View All, Active, Completed Today, or Not Done Today
- **Progress Bars**: Visual daily progress with targets

### User Experience
- **Modern UI/UX**: Clean design with sticky navbar, card-based layout, smooth animations
- **Mobile Responsive**: Works perfectly on phones, tablets, and desktops
- **Toast Notifications**: Success/error messages with auto-dismiss
- **Keyboard Shortcuts**: Ctrl+N (new habit), Escape (close modals)
- **Loading States**: Visual feedback during data loading
- **Empty States**: Helpful messages when no habits exist
- **Touch-Optimized**: All buttons minimum 44x44px for easy tapping

### Bug Fixes & Improvements
- ✅ Fixed habit saving issue - all data persists correctly
- ✅ Improved error handling with detailed messages
- ✅ Better validation for form inputs
- ✅ Enhanced streak calculation logic
- ✅ Cleaner, more maintainable code structure

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js HTTP server (no frameworks)
- **Storage**: JSON file (`habits.json`)
- **API**: RESTful endpoints (GET, POST, PUT, DELETE)

## 📦 How to Run

1. **Navigate to the directory**:
   ```bash
   cd "D:\programs fsd\Daily Habit Streak Tracker"
   ```

2. **Start the server**:
   ```bash
   node server.js
   ```

3. **Open in browser**:
   ```
   http://localhost:3002
   ```

## 📁 Project Structure

```
Daily Habit Streak Tracker/
├── index.html          # Main HTML entry point
├── style.css           # Responsive stylesheet with gradient theme
├── script.js           # Client-side JavaScript
├── server.js           # Node.js backend with REST API
└── habits.json         # Data file (auto-created)
```

## 🎨 Design

- **Color Scheme**: Teal to Red gradient (#4ECDC4 → #FF6B6B)
- **Typography**: Segoe UI, 16px base
- **Responsive Breakpoints**: 768px (tablet), 480px (mobile)
- **Touch-Friendly**: All buttons minimum 44x44px

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/habits` | Get all habits |
| POST | `/api/habits` | Create new habit |
| PUT | `/api/habits/:id` | Update habit |
| DELETE | `/api/habits/:id` | Delete habit |
| POST | `/api/habits/:id/complete` | Mark habit complete for today |

## 📱 Mobile Features

- ✅ Responsive grid layouts
- ✅ Touch-optimized buttons
- ✅ Readable text on all screens
- ✅ Optimized modals for mobile
- ✅ Swipe-friendly cards

## 🎯 Example Use Cases

1. **Fitness**: Track daily exercise, meditation, water intake
2. **Learning**: Reading 30 mins daily, practice coding, language study
3. **Productivity**: Morning routine, journaling, goal review
4. **Mindfulness**: Meditation, gratitude practice, digital detox

## 🏆 Milestone Achievements

- 🌱 **First Step**: 1 day completed
- 🔥 **Getting Started**: 3-day streak
- ⭐ **Week Warrior**: 7-day streak
- 💪 **Two Weeks Strong**: 14-day streak
- 🎯 **Habit Formed**: 21-day streak
- 🏆 **Monthly Master**: 30-day streak
- 👑 **Habit Champion**: 60-day streak
- 🚀 **Legendary**: 90-day streak

## 📊 Stats Dashboard

Real-time tracking of:
- Total habits created
- Active streaks (current streak > 0)
- Best streak (longest across all habits)
- Today's completions

## 🔒 Data Persistence

All data is stored in `habits.json` with the following structure:
```json
{
  "id": "unique_timestamp",
  "name": "Exercise",
  "category": "health",
  "description": "30 minutes workout",
  "target": 1,
  "streak": 7,
  "longestStreak": 14,
  "currentProgress": 0,
  "completedDates": ["2026-04-05", "2026-04-06", ...],
  "createdAt": "2026-04-01T10:00:00.000Z",
  "updatedAt": "2026-04-12T08:30:00.000Z"
}
```

## 🎓 Learning Objectives

This program demonstrates:
- REST API design patterns
- Responsive CSS with Grid/Flexbox
- State management in vanilla JS
- Date calculations for streaks
- Data visualization (heatmap)
- Milestone tracking systems
- Full-stack architecture

---

**Server Port**: 3002  
**Status**: ✅ Complete & Tested  
**Last Updated**: April 12, 2026
