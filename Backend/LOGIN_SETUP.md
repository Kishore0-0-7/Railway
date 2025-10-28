# 🔐 Login Credentials Setup Guide

## ⚠️ IMPORTANT: How to Login

### **Login uses EMAIL and PASSWORD**
The login page now correctly uses:
- **Email Address** (not username)
- **Password**

---

## 🗄️ Database Setup Required

You need to have an admin account in your `admin_accounts` table.

### **Option 1: Create Admin via Database (Direct)**

Connect to your PostgreSQL database and run:

```sql
-- Example: Insert an admin manually (with plain text - NOT RECOMMENDED for production)
-- Note: The backend uses bcrypt for password hashing

INSERT INTO admin_accounts (
  admin_id, 
  full_name, 
  email, 
  mobile_number, 
  password_hash,
  role
) VALUES (
  'ADM001',
  'Admin User',
  'admin@example.com',
  '1234567890',
  '$2b$10$YourHashedPasswordHere',  -- You need to generate this
  'Admin'
);
```

---

### **Option 2: Create Admin via API (Recommended)**

Use the backend API to create an admin with proper password hashing:

#### **Using cURL (PowerShell):**
```powershell
curl -X POST http://localhost:3000/api/admin/register `
  -H "Content-Type: application/json" `
  -d '{
    "full_name": "Admin User",
    "email": "admin@example.com",
    "mobile_number": "1234567890",
    "password": "admin123"
  }'
```

#### **Using Postman or Thunder Client:**
- **Method:** POST
- **URL:** `http://localhost:3000/api/admin/register`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "full_name": "Admin User",
  "email": "admin@example.com",
  "mobile_number": "1234567890",
  "password": "admin123"
}
```

---

### **Option 3: Generate Password Hash**

If you want to insert directly into the database, generate a bcrypt hash first:

#### **Using Node.js:**

Create a file `generate-hash.js` in your Backend folder:

```javascript
const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'admin123'; // Your desired password
  const hash = await bcrypt.hash(password, 10);
  console.log('Password Hash:', hash);
}

generateHash();
```

Run it:
```powershell
cd Backend
node generate-hash.js
```

Copy the hash and use it in your SQL INSERT statement.

---

## 🎯 Example Test Account

After creating an admin account using **Option 2**, you can login with:

- **Email:** `admin@example.com`
- **Password:** `admin123`

---

## 📝 To Login:

1. **Start Backend:**
   ```powershell
   cd Backend
   npm start
   ```

2. **Start Frontend:**
   ```powershell
   cd Frontend
   npm run dev
   ```

3. **Open Browser:** http://localhost:8080

4. **Enter Credentials:**
   - Email: `admin@example.com` (or your email from database)
   - Password: `admin123` (or your password)

---

## 🔍 Check if Admin Exists

Run this SQL query in your database:

```sql
SELECT admin_id, full_name, email, role, created_at 
FROM admin_accounts;
```

This will show all admin accounts in your database.

---

## ⚠️ Common Issues

### **"Invalid email or password"**
**Solutions:**
1. Check if admin exists in database
2. Verify email is correct (case-sensitive)
3. Ensure password was created with bcrypt
4. Try creating a new admin via API

### **"Admin with this email already exists"**
**Solution:**
- Email is already in use
- Use a different email OR
- Delete the existing admin first

### **Database Connection Error**
**Solution:**
- Check PostgreSQL is running
- Verify database credentials in `Backend/src/config/db.js`
- Ensure database and tables exist

---

## 🗃️ Required Database Table Structure

Your `admin_accounts` table should have:

```sql
CREATE TABLE admin_accounts (
    admin_id VARCHAR(10) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mobile_number VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Quick Setup Script

Create this file as `Backend/setup-admin.js`:

```javascript
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

// Update with your database credentials
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'your_database_name',
  user: 'your_username',
  password: 'your_password',
});

async function createFirstAdmin() {
  try {
    const email = 'admin@example.com';
    const password = 'admin123';
    const fullName = 'Admin User';
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Insert admin
    const query = `
      INSERT INTO admin_accounts (
        admin_id, full_name, email, password_hash, role
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING admin_id, full_name, email, role;
    `;
    
    const result = await pool.query(query, [
      'ADM001',
      fullName,
      email,
      passwordHash,
      'Admin'
    ]);
    
    console.log('✅ Admin created successfully!');
    console.log('Login with:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Admin Details:', result.rows[0]);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createFirstAdmin();
```

Run it:
```powershell
cd Backend
node setup-admin.js
```

---

## 📋 Summary

### **To Create First Admin:**
1. Use the API endpoint: `POST /api/admin/register`
2. Or run the setup script above
3. Or insert directly into database with bcrypt hash

### **To Login:**
- **URL:** http://localhost:8080
- **Email:** Your admin email from database
- **Password:** Your admin password

### **Default Test Credentials (if you used the examples):**
- **Email:** `admin@example.com`
- **Password:** `admin123`

---

## 🆘 Still Having Issues?

1. **Check Backend Logs:** Look at the terminal where backend is running
2. **Check Database:** Verify admin exists in `admin_accounts` table
3. **Test API Directly:** Use curl/Postman to test the login endpoint
4. **Browser Console:** Check for error messages (F12 → Console tab)

---

**Updated:** October 20, 2025  
**Login Method:** Email + Password  
**Password Hashing:** bcrypt with 10 salt rounds
