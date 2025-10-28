# 🔐 LOGIN CREDENTIALS - ANSWER

## 📧 What You Need to Know

### **The login system uses:**
- ✅ **Email Address** (NOT username)
- ✅ **Password**

### **These credentials come from your DATABASE**
The system authenticates against the `admin_accounts` table in your PostgreSQL database.

---

## ⚡ Quick Answer

### **YOU DON'T HAVE DEFAULT CREDENTIALS YET**

You need to create an admin account first! Here's how:

---

## 🚀 Option 1: Use the Auto-Setup Script (EASIEST)

### **Step 1: Run the script**
```powershell
cd Backend
node create-admin.js
```

### **Step 2: It will create:**
- **Email:** `admin@railway.com`
- **Password:** `admin123`

### **Step 3: Login**
1. Open http://localhost:8080
2. Enter:
   - Email: `admin@railway.com`
   - Password: `admin123`
3. Click "Log in"

---

## 🛠️ Option 2: Create via API

### **Use this cURL command:**
```powershell
curl -X POST http://localhost:3000/api/admin/register `
  -H "Content-Type: application/json" `
  -d '{
    "full_name": "Your Name",
    "email": "youremail@example.com",
    "mobile_number": "1234567890",
    "password": "yourpassword"
  }'
```

### **Then login with:**
- Email: `youremail@example.com`
- Password: `yourpassword`

---

## 📊 Option 3: Check Existing Admins

Maybe you already have an admin in the database?

### **Check with SQL:**
```sql
SELECT admin_id, full_name, email, role 
FROM admin_accounts;
```

This will show any existing admin accounts.

---

## ✅ RECOMMENDED: Use the Auto-Setup

### **Run this NOW:**

```powershell
# Make sure you're in the Backend directory
cd e:\Internship\INTERN\Railway\Main\Backend

# Run the setup script
node create-admin.js
```

### **This will automatically create:**

**Login Credentials:**
- **Email:** `admin@railway.com`
- **Password:** `admin123`
- **Admin ID:** `ADM001`
- **Full Name:** Railway Admin

---

## 🎯 Complete Login Flow

### **1. Create Admin** (first time only)
```powershell
cd Backend
node create-admin.js
```

### **2. Start Servers**

**Terminal 1 - Backend:**
```powershell
cd Backend
npm start
```

**Terminal 2 - Frontend:**
```powershell
cd Frontend
npm run dev
```

### **3. Login**
- **Go to:** http://localhost:8080
- **Email:** `admin@railway.com`
- **Password:** `admin123`
- **Click:** Log in button

### **4. Success!**
You'll be redirected to the dashboard.

---

## 🔍 Verify Database Connection

Before creating admin, make sure your database is set up:

### **Check `Backend/src/config/db.js`:**
```javascript
const pool = new Pool({
  host: "localhost",      // Your PostgreSQL host
  port: 5432,            // Your PostgreSQL port
  database: "your_db",   // Your database name
  user: "your_user",     // Your database user
  password: "your_pass", // Your database password
});
```

---

## ⚠️ Important Notes

### **Password Security:**
- Passwords are hashed with bcrypt
- You cannot see plain passwords in the database
- Always use the password you set during creation

### **Email Requirements:**
- Must be unique in the database
- Used for login authentication
- Case-sensitive

### **If Login Fails:**
1. Check backend terminal for errors
2. Verify database connection
3. Ensure admin exists in database
4. Check browser console (F12)

---

## 📝 Summary

### **To Login You Need:**
1. ✅ PostgreSQL database running
2. ✅ `admin_accounts` table exists
3. ✅ At least one admin account created
4. ✅ Backend server running (port 3000)
5. ✅ Frontend server running (port 8080)

### **Create Admin:**
```powershell
cd Backend
node create-admin.js
```

### **Login With:**
- **Email:** `admin@railway.com`
- **Password:** `admin123`

### **Login URL:**
http://localhost:8080

---

## 🆘 Still Need Help?

Run this to create your admin:
```powershell
cd e:\Internship\INTERN\Railway\Main\Backend
node create-admin.js
```

Then login at http://localhost:8080 with the credentials shown!

---

**Updated:** October 20, 2025  
**Status:** Ready to create admin and login! 🎉
