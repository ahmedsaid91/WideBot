# JSON Server Setup Guide

## ✅ Successfully Switched to JSON Server!

The application now uses **json-server** as the backend API instead of local mock data.

## 🚀 Quick Start

### **Step 1: Start JSON Server**

Open a terminal and run:

```bash
npm run api
```

This will:
- Start json-server on `http://localhost:3000`
- Watch `db.json` for changes
- Provide REST API endpoints

You should see:
```
Resources
http://localhost:3000/users

Home
http://localhost:3000
```

### **Step 2: Start Angular Dev Server**

In a **separate terminal**, run:

```bash
npm start
```

This will start the Angular app on `http://localhost:4200`

### **Step 3: Login and Test**

1. Navigate to `http://localhost:4200`
2. Login with:
   - **Admin**: `admin` / `admin123`
   - **User**: `user` / `user123`
3. Test CRUD operations!

## 📡 API Endpoints

JSON Server provides full REST API:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get single user |
| POST | `/users` | Create new user |
| PUT | `/users/:id` | Update user |
| PATCH | `/users/:id` | Partial update |
| DELETE | `/users/:id` | Delete user |

## 📊 Sample Data

The `db.json` file contains sample users. You can edit it directly while json-server is running, and changes will be reflected immediately!

## 🔄 Features Working

All features now work with the backend API:

✅ **CRUD Operations**
- ✅ Create user → `POST /users`
- ✅ Read users → `GET /users`
- ✅ Update user → `PUT /users/:id`
- ✅ Delete user → `DELETE /users/:id`
- ✅ Undo delete → `POST /users` (recreates user)

✅ **Reactive State Management**
- ✅ BehaviorSubject updates on API responses
- ✅ All components automatically refresh
- ✅ Optimistic UI updates

✅ **Error Handling**
- ✅ Rollback on API failures
- ✅ User-friendly error messages
- ✅ Network error handling

## 🛠 Troubleshooting

### **Issue: "Connection refused" or API errors**

**Solution**: Make sure json-server is running!
```bash
npm run api
```

### **Issue: CORS errors**

JSON Server has CORS enabled by default, but if you encounter issues:

1. Install `cors` package (already included)
2. json-server automatically handles CORS

### **Issue: Port already in use**

If port 3000 is occupied:

```bash
# Use a different port
json-server --watch db.json --port 3001
```

Then update `src/app/core/user.service.ts`:
```typescript
private readonly API_URL = 'http://localhost:3001/users';
```

### **Issue: Data resets on restart**

This is normal! `db.json` is file-based. Changes persist in the file, but if you modify `db.json` directly and restart, those changes will be there.

To preserve data across sessions:
- ✅ Don't edit `db.json` manually while server is running
- ✅ All CRUD operations automatically save to `db.json`
- ✅ Backup `db.json` if needed

## 📝 DB.json Structure

```json
{
  "users": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin",
      "status": "active",
      "department": "IT",
      "joinDate": "2020-01-01",
      ...
    }
  ]
}
```

## 🔧 Advanced Configuration

### **Add Delays (Simulate Real Network)**

```bash
json-server --watch db.json --port 3000 --delay 1000
```

This adds 1 second delay to all requests.

### **Enable Custom Routes**

Create `routes.json`:
```json
{
  "/api/*": "/$1"
}
```

Run with:
```bash
json-server --watch db.json --routes routes.json
```

### **Add Middleware**

Create `middleware.js`:
```javascript
module.exports = (req, res, next) => {
  console.log('Request:', req.method, req.url);
  next();
};
```

Run with:
```bash
json-server --watch db.json --middlewares middleware.js
```

## 🔄 Switch Back to Local Data

If you want to switch back to local mock data:

1. Open `src/app/core/user.service.ts`
2. Uncomment the local mock data section (lines ~46-211)
3. Comment out the API calls in each method
4. See `LOCAL_DATA_SETUP.md` for details

## 📦 What Changed

### **Updated Files**

1. **`src/app/core/user.service.ts`**
   - ✅ Enabled all backend API calls
   - ✅ Commented out local mock data
   - ✅ All methods now use HttpClient

2. **No other files changed!**
   - Components work the same
   - State management unchanged
   - RxJS patterns intact

## 🎯 Testing Tips

### **Test Create**
1. Click "Add User" in admin dashboard
2. Fill the form and submit
3. Check `db.json` - new user should be there!

### **Test Update**
1. Click "Edit" on any user
2. Modify data and save
3. Check `db.json` - changes persisted!

### **Test Delete**
1. Click "Delete" on any user
2. User removed from list
3. Check `db.json` - user is gone!

### **Test Undo**
1. Delete a user
2. Click "Undo" in the toast
3. User is recreated via API
4. Check `db.json` - user is back!

### **Monitor API Calls**

Open browser DevTools → Network tab:
- See all API requests
- Check request/response data
- Debug API issues

## 🚀 Development Workflow

### **Option 1: Two Terminals (Recommended)**

**Terminal 1:**
```bash
npm run api
```

**Terminal 2:**
```bash
npm start
```

### **Option 2: Background Process (Windows)**

**PowerShell:**
```powershell
Start-Process npm -ArgumentList "run api"
Start-Process npm -ArgumentList "start"
```

### **Option 3: Concurrent (Unix/Mac)**

```bash
npm run dev
```

*(Note: The `dev` script in `package.json` may need `concurrently` package)*

## 📚 JSON Server Documentation

For more features, see the official docs:
- [JSON Server GitHub](https://github.com/typicode/json-server)
- [Documentation](https://github.com/typicode/json-server/blob/master/README.md)

## ✅ Summary

🎉 **You're now using json-server as your backend!**

- ✅ Full REST API at `http://localhost:3000`
- ✅ All CRUD operations working
- ✅ Data persists in `db.json`
- ✅ Reactive state management with RxJS
- ✅ Optimistic UI updates
- ✅ Error handling and rollback

**Happy coding!** 🚀

