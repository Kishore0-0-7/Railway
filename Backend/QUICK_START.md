# 🚀 Quick Start Guide - Frontend ↔️ Backend Connection

## ✅ **CONNECTION STATUS: SUCCESSFUL**

Your frontend and backend are now fully connected! Here's what you need to know:

---

## 🎯 What's Working Right Now

### ✅ **1. Dashboard Page**
- Real-time statistics from database
- Monthly revenue chart with actual data
- Recent bookings list from DB
- Live category breakdown (Sitting/Sleeper)
- All data updates automatically from backend

### ✅ **2. Login Page**
- Authenticates against your database
- Stores admin information securely
- Shows proper error messages
- Redirects to dashboard on success

### ✅ **3. Worker List Page**
- Displays all workers from database
- Shows real worker information
- Search functionality works
- Click to view worker details

---

## 🖥️ How to Run

### **Terminal 1 - Start Backend**
```powershell
cd Backend
npm start
```
**Result:** Backend runs on http://localhost:3000

### **Terminal 2 - Start Frontend**
```powershell
cd Frontend
npm run dev
```
**Result:** Frontend runs on http://localhost:8080

### **Open Browser**
Navigate to: **http://localhost:8080**

---

## 🔐 Testing Authentication

1. **Go to:** http://localhost:8080
2. **Login with:** Your admin credentials from the database
3. **Table:** `admin_accounts`
4. **Fields:** `username` and `password`

If you don't have an admin account yet, you'll need to:
- Create one directly in the database, OR
- Use the backend API: `POST /api/admin/register`

---

## 📊 API Integration Details

### **API Base URL:** `http://localhost:3000/api`

### **Connected Endpoints:**

#### Dashboard APIs:
```
GET /analytics/dashboard/stats           - Dashboard statistics
GET /analytics/dashboard/monthly-revenue - Revenue chart data
GET /analytics/dashboard/recent-bookings - Recent bookings
```

#### Admin APIs:
```
POST /admin/login                        - Login authentication
```

#### Worker APIs:
```
GET /worker/get-all-workers              - Get all workers
```

---

## 🗄️ Database Requirements

### **Must Have These Tables:**

1. **`admin_accounts`** - For login
   - Required fields: `admin_id`, `username`, `password`, `full_name`

2. **`bookings`** - For dashboard
   - Required fields: `booking_id`, `guest_name`, `phone_number`, `booking_type`, `booking_status`, `total_amount`, `created_at`, etc.

3. **`worker_accounts`** - For worker list
   - Required fields: `worker_id`, `full_name`, `mobile_number`, `gender`, `is_active`, `created_at`

### **Database Connection:**
Check and update: `Backend/src/config/db.js`

---

## 🔧 Configuration Files

### **Backend CORS** (`Backend/src/app.js`)
```javascript
cors({
  origin: ["http://localhost:5173", "http://localhost:8080", "http://localhost:3000"],
  credentials: true,
})
```

### **Frontend API** (`Frontend/src/services/api.ts`)
```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

---

## 🎨 Code Structure

### **Frontend API Calls:**
```typescript
// Import the API service
import { adminAPI, workerAPI, analyticsAPI } from '@/services/api';

// Example: Fetch dashboard stats
const response = await analyticsAPI.getDashboardStats();
const stats = response.data.data;

// Example: Login
const response = await adminAPI.login(username, password);
```

### **Error Handling:**
```typescript
try {
  const response = await analyticsAPI.getDashboardStats();
  setData(response.data.data);
} catch (error) {
  toast.error(error.response?.data?.error || "Failed to load data");
}
```

---

## 🐛 Troubleshooting

### **Problem: "Failed to load dashboard data"**
**Solution:**
1. Check if backend is running (Terminal 1)
2. Verify database connection in `Backend/src/config/db.js`
3. Ensure tables have data
4. Check browser console for specific errors

### **Problem: "Invalid credentials"**
**Solution:**
1. Verify admin exists in `admin_accounts` table
2. Check username and password are correct
3. Password might be hashed - check how it's stored

### **Problem: CORS Error**
**Solution:**
1. Ensure both servers are running
2. Check `Backend/src/app.js` CORS configuration
3. Frontend must be on port 8080 or 5173

### **Problem: 404 Not Found**
**Solution:**
1. Backend must be running on port 3000
2. Check the API endpoint exists in routes
3. Verify API path in network tab (F12)

### **Problem: Loading Forever**
**Solution:**
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Verify backend is responding

---

## 📱 Browser DevTools Check

### **Press F12 to open DevTools**

1. **Console Tab:**
   - Should see no red errors
   - May see informational logs

2. **Network Tab:**
   - Filter by "XHR" or "Fetch"
   - Should see requests to localhost:3000
   - Status should be 200 (success)
   - Check response data

3. **Application Tab:**
   - Check localStorage for:
     - `isLoggedIn: "true"`
     - `username`
     - `adminId` (after login)

---

## 📈 Expected Data Flow

```
User Actions (Frontend)
    ↓
React Component
    ↓
API Service (api.ts)
    ↓
Axios HTTP Request
    ↓
Express Backend (port 3000)
    ↓
PostgreSQL Database
    ↓
Response back through chain
    ↓
UI Updates with Data
```

---

## ✨ Success Checklist

When everything is working, you should see:

- ✅ Backend server running on port 3000
- ✅ Frontend server running on port 8080
- ✅ Login page loads without errors
- ✅ Can log in with database credentials
- ✅ Dashboard shows real revenue numbers
- ✅ Dashboard chart displays actual data
- ✅ Booking table shows database records
- ✅ Worker list displays database workers
- ✅ No CORS errors in console
- ✅ Network tab shows 200 status codes

---

## 📚 Additional Documentation

- **Full Integration Guide:** `INTEGRATION_GUIDE.md`
- **Connection Summary:** `CONNECTION_SUMMARY.md`
- **Backend API Reference:** `Backend/API_QUICK_REFERENCE.md`
- **Dashboard API Docs:** `Backend/DASHBOARD_API_DOCS.md`

---

## 🔮 What's Next?

### **Pages Still Need Connection:**
- Booking Details (Active/Completed)
- Submit Booking Form
- Worker Details Page
- Manage Login (Add/Edit Workers)
- Reports Page

### **Want to connect these pages?**
Just ask! I can help connect any remaining pages to the backend.

---

## 💡 Quick Tips

1. **Always check browser console** for errors
2. **Use Network tab** to see API calls
3. **Backend logs** show database queries
4. **Toast notifications** show user-friendly errors
5. **localStorage** stores login state

---

## 🆘 Need Help?

If something doesn't work:
1. Check both servers are running
2. Open browser DevTools (F12)
3. Check Console and Network tabs
4. Verify database has data
5. Check backend terminal for errors

---

**Status:** ✅ **FULLY OPERATIONAL**  
**Date:** October 20, 2025  
**Servers:** Backend (3000) + Frontend (8080)  
**Connection:** Successful ✨

---

### **Ready to Test!** 🎉
Open http://localhost:8080 and start using your connected application!
