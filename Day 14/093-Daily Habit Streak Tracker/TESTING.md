# Testing Guide - Daily Habit Streak Tracker

## 🧪 How to Test

### 1. Start the Server
```bash
cd "D:\programs fsd\Daily Habit Streak Tracker"
node server.js
```

You should see:
```
===========================================
🔥 Habit Streak Tracker running!
🌐 Server: http://localhost:3002
📁 Data: habits.json
===========================================
```

### 2. Open in Browser
```
http://localhost:3002
```

### 3. Test Scenarios

#### ✅ Test 1: Add a New Habit
1. Click "Add Habit" button
2. Fill in:
   - Name: "Exercise Daily"
   - Category: Health
   - Description: "30 minutes workout"
   - Target: 1
3. Click "Save Habit"
4. **Expected**: Success toast "✓ Habit created successfully!"
5. **Verify**: Habit appears in the grid

#### ✅ Test 2: Complete a Habit
1. Find the habit you just created
2. Click "✓ Mark Complete" button
3. **Expected**: 
   - Toast: "✓ Habit completed! 1 day streak!"
   - Button changes to "✅ Done Today"
   - Stat "Today Done" increases to 1
   - Progress bar shows 100%

#### ✅ Test 3: View Progress (Heatmap)
1. Click "📊 View Progress" on any habit
2. **Expected**:
   - Modal opens with heatmap
   - Today's cell is green (completed)
   - Milestones show "First Step ✓" achieved
   - Current Streak: 1 day
   - Longest Streak: 1 day

#### ✅ Test 4: Edit a Habit
1. Click "✎ Edit" on any habit
2. Change the name or description
3. Click "Save Habit"
4. **Expected**: Success toast "✓ Habit updated successfully!"
5. **Verify**: Changes appear in the card

#### ✅ Test 5: Search Habits
1. Add 2-3 more habits
2. Type in the search box
3. **Expected**: Habits filter in real-time

#### ✅ Test 6: Filter Buttons
1. Click "🔥 Active" - Shows habits with streaks
2. Click "✅ Done Today" - Shows completed habits
3. Click "⏰ Not Done" - Shows incomplete habits
4. **Expected**: Correct filtering each time

#### ✅ Test 7: Delete a Habit
1. Click "🗑 Delete"
2. Confirm the dialog
3. **Expected**: 
   - Toast: "✓ Habit deleted successfully!"
   - Habit disappears from grid
   - Stats update

#### ✅ Test 8: Mobile Responsiveness
1. Open DevTools (F12)
2. Toggle device toolbar
3. Test on different screen sizes:
   - iPhone (375px)
   - iPad (768px)
   - Desktop (1200px)
4. **Expected**: All layouts look good, buttons are tappable

#### ✅ Test 9: Data Persistence
1. Add a habit
2. Refresh the browser (F5)
3. **Expected**: Habit still exists
4. Stop the server (Ctrl+C)
5. Start it again: `node server.js`
6. **Expected**: All habits are still there

#### ✅ Test 10: Keyboard Shortcuts
1. Press `Ctrl+N` - Modal should open
2. Press `Escape` - Modal should close
3. **Expected**: Shortcuts work correctly

### 4. Common Issues & Solutions

#### Issue: "Failed to save habit"
- **Solution**: Check server console for errors. Ensure habits.json exists in the folder.

#### Issue: Habits don't appear
- **Solution**: 
  1. Check browser console (F12) for errors
  2. Verify server is running on port 3002
  3. Check if habits.json has data

#### Issue: Buttons don't work
- **Solution**: 
  1. Check browser console for JavaScript errors
  2. Ensure script.js is loaded (Network tab in DevTools)
  3. Clear browser cache and reload

### 5. Verify Data File
Check `habits.json` - it should look like:
```json
[
  {
    "id": "1775970772324",
    "name": "Exercise Daily",
    "category": "health",
    "description": "30 minutes workout",
    "target": 1,
    "streak": 1,
    "longestStreak": 1,
    "currentProgress": 0,
    "completedDates": ["2026-04-12"],
    "createdAt": "2026-04-12T05:12:52.324Z",
    "updatedAt": "2026-04-12T05:12:52.324Z"
  }
]
```

### 6. Success Criteria
✅ All 10 test scenarios pass  
✅ No console errors  
✅ Data persists after refresh  
✅ Mobile responsive  
✅ Toast notifications appear  
✅ All buttons work correctly  

---

**Status**: ✅ Fully Tested & Workable  
**Last Updated**: April 12, 2026
