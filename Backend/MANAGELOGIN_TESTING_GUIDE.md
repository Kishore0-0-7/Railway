# ManageLogin Testing Guide

## Prerequisites
✅ Backend server running on port 3000
✅ Frontend server running on port 8080
✅ PostgreSQL database with worker_accounts and admin_accounts tables
✅ At least one admin account in database (use Backend/create-admin.js)

## Step-by-Step Testing

### 1. Start Servers
```bash
# Terminal 1 - Backend
cd Backend
npm start
# Should see: "Server running on http://localhost:3000"

# Terminal 2 - Frontend
cd Frontend
npm run dev
# Should see: "Local: http://localhost:8080"
```

### 2. Login as Admin
1. Go to http://localhost:8080
2. Click "Login" or navigate to login page
3. Enter credentials:
   - Email: `admin@railway.com`
   - Password: `admin123`
4. Should redirect to Dashboard

### 3. Navigate to ManageLogin Page
1. Click "Manage Login" in the navigation menu
2. Should see form at top and table at bottom
3. Table should load workers from database (may be empty at first)

### 4. Test Creating a New Worker

#### Test Case 1: Create Valid Worker
1. Fill in the form:
   - Name: `Test Worker`
   - Mobile Number: `9876543210`
   - Joining Date: Select today's date
   - Gender: Select `Male`
   - Username: `testworker`
   - Password: `test123`
   - Confirm Password: `test123`
2. Click "Create Account"
3. **Expected Result:**
   - Success toast: "Worker account created successfully!"
   - Form clears
   - New worker appears in table with auto-generated ID (WOR001, WOR002, etc.)

#### Test Case 2: Validation - Empty Fields
1. Leave all fields empty
2. Click "Create Account"
3. **Expected Result:**
   - Error toast: "Name is required"

#### Test Case 3: Validation - Password Mismatch
1. Fill in all fields
2. Password: `test123`
3. Confirm Password: `test456` (different)
4. Click "Create Account"
5. **Expected Result:**
   - Error toast: "Passwords do not match!"

#### Test Case 4: Duplicate Mobile Number
1. Fill in form with same mobile number as existing worker
2. Click "Create Account"
3. **Expected Result:**
   - Error toast: "Worker with this mobile number already exists"

#### Test Case 5: Duplicate Username
1. Fill in form with same username as existing worker
2. Click "Create Account"
3. **Expected Result:**
   - Error toast: "Worker with this username already exists"

### 5. Test Viewing Workers

#### Test Case 1: Worker List Display
1. After creating workers, check the table
2. **Expected Result:**
   - Table shows all workers
   - Columns display correctly:
     - S.No (1, 2, 3...)
     - Name (full_name from DB)
     - Login ID (worker_id like WOR001)
     - Phone No. (mobile_number)
     - Gender (Male/Female/Other or N/A)
     - Joining Date (formatted as "15 Jan 2024")
     - Total Bookings (shows "-")
     - Status (green badge showing "active")

#### Test Case 2: Empty State
1. If no workers exist in database
2. **Expected Result:**
   - Table shows: "No workers found. Create one using the form above."

#### Test Case 3: Loading State
1. Refresh page
2. **Expected Result:**
   - Table briefly shows: "Loading workers..."
   - Then displays worker list

### 6. Test Editing a Worker

#### Test Case 1: Load Worker Data
1. Click on any row in the worker table
2. **Expected Result:**
   - Form populates with worker data
   - Username field is disabled with gray background
   - Helper text shows: "Username cannot be changed"
   - Button changes to "Save" instead of "Create Account"

#### Test Case 2: Update Worker Details
1. Click on a worker row
2. Modify name to `Updated Worker Name`
3. Change mobile number to `1112223334`
4. Click "Save"
5. **Expected Result:**
   - Success toast: "Worker account updated successfully!"
   - Form clears
   - Table refreshes with updated data

#### Test Case 3: Cancel Edit
1. Click on a worker row
2. Modify some fields
3. Click "Cancel"
4. **Expected Result:**
   - Form clears
   - No changes saved
   - No API call made

### 7. Test Password Reset

#### Test Case 1: Reset Password
1. Click on a worker row to edit
2. Click "Reset Password" button (red button)
3. **Expected Result:**
   - Red button is replaced with password input field
   - Label: "New Password"

#### Test Case 2: Update Password
1. After clicking "Reset Password"
2. Enter new password: `newpass123`
3. Enter confirm password: `newpass123`
4. Click "Save"
5. **Expected Result:**
   - Success toast: "Worker account updated successfully!"
   - Password updated in database (bcrypt hashed)

#### Test Case 3: Password Mismatch
1. After clicking "Reset Password"
2. Enter new password: `newpass123`
3. Enter confirm password: `different456`
4. Click "Save"
5. **Expected Result:**
   - Error toast: "New passwords do not match!"
   - No changes saved

#### Test Case 4: Empty Password
1. After clicking "Reset Password"
2. Leave password field empty
3. Click "Save"
4. **Expected Result:**
   - Error toast: "Please enter new password before saving."

### 8. Test Loading States

#### Test Case 1: Submitting State
1. Fill in form to create or edit worker
2. Click "Create Account" or "Save"
3. **Expected Result:**
   - Button shows "Creating..." or "Saving..."
   - Both buttons are disabled
   - Button has reduced opacity

#### Test Case 2: Page Load State
1. Refresh the page
2. **Expected Result:**
   - Table shows "Loading workers..." briefly
   - Then displays data

### 9. Test Error Handling

#### Test Case 1: Backend Down
1. Stop the backend server
2. Try to create or edit a worker
3. **Expected Result:**
   - Error toast: "Failed to create worker account" or similar
   - Form remains filled (data not lost)

#### Test Case 2: Invalid Admin ID
1. Clear localStorage or set invalid adminId
2. Try to create a worker
3. **Expected Result:**
   - Error toast: "Admin not found" or similar backend error

#### Test Case 3: Network Error
1. Disconnect internet
2. Try to create or fetch workers
3. **Expected Result:**
   - Error toast showing network error message

## Verification Checklist

### Database Verification
After creating/updating workers, verify in PostgreSQL:

```sql
-- Check worker_accounts table
SELECT * FROM worker_accounts ORDER BY created_at DESC;

-- Should see:
-- - worker_id auto-generated (WOR001, WOR002, etc.)
-- - full_name, mobile_number, joining_date, gender populated
-- - user_name as entered
-- - password hashed with bcrypt (starts with $2b$)
-- - status = 'active'
-- - admin_id matches creator admin
-- - created_at timestamp
```

### Browser Console
Check for:
- No JavaScript errors
- API calls showing correct data
- 200 status codes for successful operations
- 400/500 status codes with proper error messages for failures

### Network Tab (Chrome DevTools)
Monitor API calls:
- `GET /api/worker/get-all-workers` - On page load
- `POST /api/worker/create-worker` - When creating worker
- `PUT /api/worker/update-worker/:id` - When updating worker
- `PUT /api/worker/update-password/:id` - When resetting password

## Common Issues & Solutions

### Issue 1: "Admin not found" error
**Cause:** No admin account in database
**Solution:** Run `node Backend/create-admin.js` to create admin account

### Issue 2: Workers not loading
**Cause:** Backend not running or wrong port
**Solution:** 
- Check backend is running on port 3000
- Check frontend API baseURL is correct (http://localhost:3000)

### Issue 3: CORS errors
**Cause:** CORS not configured for frontend port
**Solution:** Check Backend/src/app.js CORS origin includes http://localhost:8080

### Issue 4: "Cannot read properties of null"
**Cause:** adminId not in localStorage
**Solution:** Login first before accessing ManageLogin page

### Issue 5: Date format issues
**Cause:** Invalid date format from backend
**Solution:** Check date formatting functions work with backend date format

## Success Criteria

✅ Can create new workers with all validations working
✅ Can view all workers in table with correct data
✅ Can edit worker details by clicking table row
✅ Can reset worker passwords
✅ Username field is disabled when editing
✅ All loading states display correctly
✅ All error messages show proper toasts
✅ Form clears after successful create/update
✅ Table refreshes automatically after changes
✅ No console errors
✅ Data persists in PostgreSQL database

## Test Data Examples

### Valid Worker 1
- Name: John Smith
- Mobile: 9876543210
- Date: 2024-01-15
- Gender: Male
- Username: johnsmith
- Password: john123

### Valid Worker 2
- Name: Jane Doe
- Mobile: 9876543211
- Date: 2024-01-20
- Gender: Female
- Username: janedoe
- Password: jane123

### Valid Worker 3
- Name: Bob Wilson
- Mobile: 9876543212
- Date: 2024-02-01
- Gender: Other
- Username: bobwilson
- Password: bob123

## Performance Notes
- Worker list should load within 1-2 seconds
- Form submission should respond within 500ms
- Table refresh after create/update should be instant
- No freezing or lag during operations
