# Frontend-Backend Integration Guide

## 🎯 Overview
The frontend (React + TypeScript) is now connected to the backend (Node.js + Express + PostgreSQL).

## 🔧 Setup & Configuration

### Backend Setup
1. **Navigate to Backend directory:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Database:**
   - Ensure PostgreSQL is running
   - Update database credentials in `src/config/db.js`
   - Create required tables using schema in `Db Query/db.txt`

4. **Start Backend Server:**
   ```bash
   npm run dev    # Development mode with nodemon
   # OR
   npm start      # Production mode
   ```
   - Server runs on: `http://localhost:3000`

### Frontend Setup
1. **Navigate to Frontend directory:**
   ```bash
   cd Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start Frontend Development Server:**
   ```bash
   npm run dev
   ```
   - Frontend runs on: `http://localhost:5173`

## 📡 API Integration

### API Service
All API calls are centralized in `Frontend/src/services/api.ts`:

```typescript
import { adminAPI, workerAPI, bookingAPI, analyticsAPI } from '@/services/api';
```

### Available APIs

#### 1. Admin APIs
```typescript
adminAPI.login(username, password)
adminAPI.register(adminData)
adminAPI.getAllAdmins()
adminAPI.getAdminById(id)
adminAPI.updateAdmin(id, data)
adminAPI.updatePassword(id, data)
adminAPI.deleteAdmin(id)
```

#### 2. Worker APIs
```typescript
workerAPI.getAllWorkers()
workerAPI.getWorkerById(id)
workerAPI.createWorker(workerData)
workerAPI.updateWorker(id, data)
workerAPI.updateWorkerPassword(id, data)
workerAPI.deleteWorker(id)
```

#### 3. Booking APIs
```typescript
bookingAPI.getAllBookings()
bookingAPI.getBookingById(id)
bookingAPI.createBooking(bookingData)
bookingAPI.updateBooking(id, data)
bookingAPI.deleteBooking(id)
bookingAPI.getWorkerBookings(workerId)
```

#### 4. Analytics/Dashboard APIs
```typescript
analyticsAPI.getDashboardStats()
analyticsAPI.getMonthlyRevenue({ year, months })
analyticsAPI.getDailyRevenue({ month, year })
analyticsAPI.getTopWorkers({ limit, month, year })
analyticsAPI.getRecentBookings({ limit, status })
analyticsAPI.getPaymentAnalytics({ month, year })
```

## 🔄 Updated Components

### 1. Dashboard (`Frontend/src/pages/Dashboard.tsx`)
**Changes:**
- ✅ Fetches real-time dashboard statistics
- ✅ Displays revenue, bookings, completed count from backend
- ✅ Shows monthly revenue chart with real data
- ✅ Lists recent bookings from database
- ✅ Dynamic category breakdown (Sitting vs Sleeper)
- ✅ Loading states and error handling

**API Calls:**
```typescript
analyticsAPI.getDashboardStats()
analyticsAPI.getMonthlyRevenue({ months: 6 })
analyticsAPI.getRecentBookings({ limit: 10 })
```

### 2. Login (`Frontend/src/pages/Login.tsx`)
**Changes:**
- ✅ Uses real admin authentication API
- ✅ Stores admin details in localStorage
- ✅ Shows toast notifications for success/error
- ✅ Proper error handling

**API Calls:**
```typescript
adminAPI.login(username, password)
```

### 3. Worker List (`Frontend/src/pages/WorkerList.tsx`)
**Changes:**
- ✅ Fetches workers from database
- ✅ Displays real worker data (name, ID, phone, etc.)
- ✅ Shows joining date from created_at
- ✅ Active/Inactive status from is_active field
- ✅ Loading states

**API Calls:**
```typescript
workerAPI.getAllWorkers()
```

## 🔐 CORS Configuration
Backend is configured to accept requests from frontend:
```javascript
cors({
  origin: "http://localhost:5173",
  credentials: true,
})
```

## 📝 Environment Variables

### Backend (.env - Create if not exists)
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=railway_booking
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

### Frontend (vite.config.ts - Already configured)
```typescript
server: {
  port: 5173
}
```

## 🧪 Testing the Integration

### 1. Start Both Servers
```bash
# Terminal 1 - Backend
cd Backend
npm run dev

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

### 2. Test Login
- Navigate to `http://localhost:5173`
- Login with admin credentials from your database
- Should redirect to dashboard

### 3. Test Dashboard
- Dashboard should load real statistics
- Check browser console for any API errors
- Verify data matches database

### 4. Test Worker List
- Navigate to `/workerlist`
- Should display workers from database
- Click on a worker to view details

## 🐛 Troubleshooting

### CORS Errors
If you see CORS errors:
1. Ensure backend is running on port 3000
2. Check `src/app.js` CORS configuration
3. Frontend should be on port 5173

### Database Connection Issues
```bash
# Check PostgreSQL is running
# Windows:
Get-Service -Name postgresql*

# Verify database exists and tables are created
```

### API 500 Errors
- Check backend console for error logs
- Verify database tables exist
- Check database connection in `src/config/db.js`

### Token/Auth Issues
- Clear localStorage in browser DevTools
- Re-login to get fresh authentication

## 📊 Database Schema Required

Ensure these tables exist:
- `admin_accounts` - Admin users
- `worker_accounts` - Worker accounts
- `bookings` - Booking records
- Additional tables as per your schema

## 🎨 Next Steps

### To Complete Integration:
1. ✅ **Dashboard** - Connected
2. ✅ **Login** - Connected
3. ✅ **Worker List** - Connected
4. ⏳ **Booking Details** - Need to connect
5. ⏳ **Submit Booking** - Need to connect
6. ⏳ **Worker Details** - Need to connect
7. ⏳ **Manage Login** - Need to connect
8. ⏳ **Add Login** - Need to connect
9. ⏳ **Report** - Need to connect

### Recommended:
- Add proper TypeScript interfaces for API responses
- Implement JWT token-based authentication
- Add API response caching with React Query
- Implement loading skeletons instead of simple text
- Add retry logic for failed API calls

## 📚 Documentation
- Backend API Docs: `Backend/API_QUICK_REFERENCE.md`
- Dashboard API Docs: `Backend/DASHBOARD_API_DOCS.md`
- Dashboard Implementation: `Backend/DASHBOARD_IMPLEMENTATION.md`

## 🚀 Production Deployment

### Backend
- Set up environment variables
- Use production database
- Enable HTTPS
- Set proper CORS origins

### Frontend
```bash
npm run build
```
- Build creates optimized production bundle
- Update API_BASE_URL in `api.ts` to production URL

---

**Last Updated:** October 20, 2025
**Status:** ✅ Core Integration Complete
