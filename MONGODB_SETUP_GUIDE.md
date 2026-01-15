# How to Switch to MongoDB (If You Want)

## ⚠️ Important Note

**This requires code changes!** If you want the easiest path, stick with PostgreSQL (already set up).

---

## 🎯 Why Switch to MongoDB?

- You prefer NoSQL
- You want to use MongoDB Atlas (free cloud MongoDB)
- You're more familiar with MongoDB

---

## 📋 Step-by-Step: Switch to MongoDB

### Step 1: Create MongoDB Atlas Account

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up (free)
3. Create a **Free Cluster** (M0 - Free tier)
4. Choose a region close to you
5. Wait for cluster to be created (2-3 minutes)

### Step 2: Set Up Database Access

1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `student-gateway-user`
5. Password: Generate a secure password (save it!)
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### Step 3: Set Up Network Access

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for now)
   - Or add specific IPs later for security
4. Click **"Confirm"**

### Step 4: Get Connection String

1. Go to **Clusters** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**
5. Version: **5.5 or later**
6. Copy the connection string
   - Looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
7. Replace `<username>` and `<password>` with your database user credentials

### Step 5: Install Mongoose

```bash
cd backend
npm install @nestjs/mongoose mongoose
npm install --save-dev @types/mongoose
```

### Step 6: Update Code

I'll need to help you convert:
- TypeORM entities → Mongoose schemas
- TypeORM repositories → Mongoose models
- Update all services

**This is a significant change!** Let me know if you want to proceed.

---

## 🔄 Code Changes Needed

### Current (TypeORM):
```typescript
// user.entity.ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ unique: true })
  email: string;
}
```

### New (Mongoose):
```typescript
// user.schema.ts
@Schema()
export class User {
  _id: string;
  
  @Prop({ unique: true })
  email: string;
}
```

**All entities need to be converted!**

---

## ⚙️ Environment Variables

After switching, you'll need:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/student_gateway?retryWrites=true&w=majority
```

---

## ⏱️ Time Estimate

- **MongoDB Atlas setup**: 5 minutes
- **Code conversion**: 30-60 minutes
- **Testing**: 15-30 minutes

**Total: ~1-2 hours**

---

## 💡 Recommendation

**Unless you specifically need MongoDB**, I recommend:
- ✅ **Stick with PostgreSQL** (already working)
- ✅ **Use Fly.io** (free PostgreSQL included)
- ✅ **Deploy in 5 minutes**

**Switch to MongoDB only if:**
- You have a specific reason
- You're more comfortable with MongoDB
- You need MongoDB-specific features

---

## 🆘 Need Help?

If you want to switch to MongoDB, tell me and I'll:
1. Convert all entities to Mongoose schemas
2. Update all services
3. Update app.module.ts
4. Test everything

But remember: **PostgreSQL is already working and free!** 🚀
