# Recurring Sessions Feature - Complete Implementation Guide

## ✅ Feature Complete!

The recurring sessions feature has been fully implemented with Google Calendar-style functionality.

---

## 🎯 What's New

### 1. Create Recurring Sessions
When creating a new session, you can now set it to repeat automatically:
- **Daily**: Every day or every X days
- **Weekly**: Specific days of the week (e.g., every Tuesday and Thursday)
- **Monthly**: Every month or every X months

### 2. Flexible End Options
Choose when the recurrence stops:
- **Never**: Continues indefinitely (limited to 2 years for safety)
- **On Date**: Ends on a specific date
- **After X Occurrences**: Stops after a set number of repetitions

### 3. Smart Session Management
- All recurring sessions are linked by a `recurring_group_id`
- Each session stores the recurrence pattern
- Easy identification of recurring sessions

---

## 📊 Database Changes

### New Fields in `sessions` Table:
```sql
is_recurring          TINYINT(1)    -- Whether session is part of a series
recurring_group_id    VARCHAR(36)   -- UUID linking related sessions
recurrence_rule       JSON          -- Stores the recurrence pattern
recurrence_exception  TINYINT(1)    -- Marks modified instances
```

### Recurrence Rule Structure (JSON):
```json
{
  "frequency": "daily|weekly|monthly",
  "interval": 1,
  "daysOfWeek": [1, 3, 5],  // Monday, Wednesday, Friday (0=Sunday)
  "endType": "never|date|count",
  "endDate": "2024-12-31",
  "endCount": 10
}
```

---

## 🎨 User Interface

### Creating Recurring Sessions

1. **Go to**: `/sessions/new`

2. **Fill in session details**:
   - Entity/Center
   - Date (start date of recurrence)
   - Start time
   - End time
   - Session type
   - Therapists
   - Notes

3. **Check**: "Repetir sesión" checkbox

4. **Configure recurrence**:

   **Frequency Options**:
   - Diariamente
   - Semanalmente
   - Mensualmente

   **Interval**:
   - "Repetir cada X días/semanas/meses"
   - Example: Every 2 weeks

   **Days of Week** (for weekly):
   - Click day buttons: L M X J V S D
   - Multiple days can be selected
   - Example: Select Tuesday and Thursday

   **End Condition**:
   - ⚪ Nunca
   - ⚪ En la fecha: [date picker]
   - ⚪ Después de: [X] repeticiones

5. **Review Summary**:
   - Live preview shows: "Cada 2 semanas los Martes, Jueves, hasta el 31/12/2024"

6. **Click**: "Crear Sesiones Recurrentes"

### What Happens:
- Multiple session records are created
- All linked by `recurring_group_id`
- All have same therapists, times, and details
- Only the date differs for each occurrence

---

## 💻 Technical Implementation

### Frontend Components

#### 1. RecurrenceSelector Component
**File**: `src/components/sessions/RecurrenceSelector.tsx`

**Features**:
- Checkbox to enable/disable recurrence
- Frequency dropdown (daily/weekly/monthly)
- Interval input (every X periods)
- Day of week selector (for weekly)
- End type radio group (never/date/count)
- Live summary preview

**Props**:
```typescript
interface RecurrenceSelectorProps {
  value: RecurrenceRule | null;
  onChange: (rule: RecurrenceRule | null) => void;
  disabled?: boolean;
}
```

#### 2. Updated SessionForm
**File**: `src/components/forms/SessionForm.tsx`

**Changes**:
- Imports `RecurrenceSelector`
- Adds `recurrence_rule` to form state
- Shows RecurrenceSelector only for NEW sessions (not edits)
- Button text changes: "Crear Sesión" → "Crear Sesiones Recurrentes"

### Backend Services

#### 1. RecurringSessionService
**File**: `backend/src/Services/RecurringSessionService.php`

**Methods**:

**`generateRecurringDates()`**
- Takes start date and recurrence rule
- Returns array of dates matching the pattern
- Respects end conditions
- Safety limit: max 365 occurrences or 2 years

**`createRecurringSessions()`**
- Takes base session data and recurrence rule
- Generates recurring group ID (UUID)
- Creates array of session data for each date
- Returns complete session data ready for database

**`getDeleteConditions()`**
- Returns SQL conditions for deletion
- Supports 3 modes: this, this_and_following, all

**Example Usage**:
```php
$service = new RecurringSessionService();

$recurrenceRule = [
    'frequency' => 'weekly',
    'interval' => 1,
    'daysOfWeek' => [2, 4], // Tuesday, Thursday
    'endType' => 'count',
    'endCount' => 10
];

$sessions = $service->createRecurringSessions($baseData, $recurrenceRule);
// Returns 10 sessions: 5 Tuesdays + 5 Thursdays
```

#### 2. Updated SessionController
**File**: `backend/src/Controllers/SessionController.php`

**Changes**:
- Imports `RecurringSessionService`
- Checks for `recurrence_rule` in request body
- If recurring:
  - Generates all session instances
  - Creates each in database
  - Attaches therapists to each
  - Returns array of all created sessions
- If not recurring:
  - Creates single session (original behavior)

---

## 🧪 Testing Guide

### Test Case 1: Weekly Recurring Session

**Steps**:
1. Login as admin
2. Go to `/sessions/new`
3. Fill in:
   - Entity: Any
   - Date: Today
   - Start: 09:00
   - End: 11:00
   - Type: Caballos
   - Therapists: Select one
4. Check "Repetir sesión"
5. Select:
   - Frequency: Semanalmente
   - Interval: 1
   - Days: Tuesday, Thursday
   - End: Después de 6 repeticiones
6. Click "Crear Sesiones Recurrentes"

**Expected Result**:
- Creates 6 sessions total
- 3 on Tuesdays, 3 on Thursdays
- All have same recurring_group_id
- Success message: "6 recurring sessions created"

**Verify**:
```sql
SELECT id, date, recurring_group_id, is_recurring
FROM sessions
WHERE is_recurring = 1
ORDER BY date;
```

### Test Case 2: Daily Recurring with End Date

**Steps**:
1. Create new session
2. Check "Repetir sesión"
3. Select:
   - Frequency: Diariamente
   - Interval: 2 (every 2 days)
   - End: En la fecha (30 days from now)
4. Submit

**Expected Result**:
- Creates ~15 sessions (every 2 days for 30 days)
- All on alternating days

### Test Case 3: Monthly Recurring

**Steps**:
1. Create new session with date: 1st of the month
2. Check "Repetir sesión"
3. Select:
   - Frequency: Mensualmente
   - Interval: 1
   - End: Después de 12 repeticiones
4. Submit

**Expected Result**:
- Creates 12 sessions
- One on the 1st of each month for 12 months

---

## 🔧 API Reference

### Create Recurring Session

**Endpoint**: `POST /api/sessions`

**Request Body**:
```json
{
  "entity_id": 1,
  "project_id": 1,
  "date": "2024-04-01",
  "start_time": "09:00",
  "end_time": "11:00",
  "hours": 2,
  "participants": 10,
  "type": "caballos",
  "notes": "Terapia con caballos",
  "therapist_ids": [1, 2],
  "recurrence_rule": {
    "frequency": "weekly",
    "interval": 1,
    "daysOfWeek": [2, 4],
    "endType": "count",
    "endCount": 10
  }
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "10 recurring sessions created",
  "data": [
    {
      "id": 101,
      "date": "2024-04-02",
      "is_recurring": 1,
      "recurring_group_id": "550e8400-e29b-41d4-a716-446655440000",
      ...
    },
    // ... more sessions
  ]
}
```

### Create Single Session (Non-Recurring)

**Request Body**:
```json
{
  "entity_id": 1,
  "project_id": 1,
  "date": "2024-04-01",
  "start_time": "09:00",
  "end_time": "11:00",
  "hours": 2,
  "participants": 10,
  "type": "caballos",
  "therapist_ids": [1, 2]
  // No recurrence_rule = single session
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 100,
    "date": "2024-04-01",
    "is_recurring": 0,
    ...
  }
}
```

---

## 📝 Next Steps (Future Enhancements)

These features are planned but not yet implemented:

### 1. Visual Indicators
- [ ] Show recurring icon (🔄) on session lists
- [ ] Display "Part of recurring series" badge
- [ ] Color-code recurring sessions

### 2. Delete Options
- [ ] Delete only this event
- [ ] Delete this and following events
- [ ] Delete all events in series

### 3. Edit Options
- [ ] Edit only this event (creates exception)
- [ ] Edit all future events
- [ ] Edit entire series

### 4. Exception Handling
- [ ] Mark individual sessions as exceptions
- [ ] Allow modifying single occurrence without affecting series

---

## 🐛 Known Limitations

1. **Edit Restrictions**: Currently, recurring sessions can't be edited as a series (only individually)
2. **Deletion**: Individual deletion works, but no "delete series" option yet
3. **UI Indicators**: No visual indicator on session lists showing which sessions are recurring
4. **Max Occurrences**: Safety limit of 365 occurrences to prevent database overflow

---

## 📚 Code Files Modified/Created

### Created:
1. `backend/migrations/009_add_recurring_sessions.sql` - Database schema
2. `backend/src/Services/RecurringSessionService.php` - Recurrence logic
3. `src/components/sessions/RecurrenceSelector.tsx` - UI component
4. `RECURRING_SESSIONS_GUIDE.md` - This documentation

### Modified:
1. `backend/src/Controllers/SessionController.php` - Create endpoint
2. `src/types/models.ts` - Added RecurrenceRule type
3. `src/lib/validations/schemas.ts` - Added recurrence validation
4. `src/components/forms/SessionForm.tsx` - Integrated RecurrenceSelector

---

## ✅ Summary

**What Works Now**:
- ✅ Create recurring sessions (daily/weekly/monthly)
- ✅ Configure intervals (every X periods)
- ✅ Select specific days of week
- ✅ Set end conditions (never/date/count)
- ✅ All sessions linked by group ID
- ✅ All therapists attached to each occurrence
- ✅ Beautiful Google Calendar-style UI

**Ready to Use**: Go to http://localhost:3000/sessions/new and try it!

---

## 🎉 Success!

The recurring sessions feature is now fully functional and ready for testing!
