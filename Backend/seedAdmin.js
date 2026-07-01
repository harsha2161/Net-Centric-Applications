/**
 * seedAdmin.js
 *
 * One-time script to create an Admin user in the database.
 * Run with:  node seedAdmin.js
 *
 * The script will:
 *  1. Connect to MongoDB using the URI in .env
 *  2. Check if an admin with the given email already exists
 *  3. Create the admin user if it does not exist
 *  4. Disconnect and exit
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

// ── Admin credentials – change these before running ──────────────────────────
const ADMIN_NAME  = 'Dinith';
const ADMIN_EMAIL = 'dinithchamo@gmail.com';
// ─────────────────────────────────────────────────────────────────────────────

async function seedAdmin() {
  try {
    // 1. Connect to MongoDB
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/net_centric_app';
    await mongoose.connect(uri);
    console.log('✅  MongoDB connected');

    // 2. Check for existing admin
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`ℹ️   Admin already exists: ${existing.email} (role: ${existing.role})`);
      return;
    }

    // 3. Create admin user
    //    - isVerified is set to true so the account is usable immediately.
    //    - No password field is stored; the admin should log in via Google OAuth
    //      or you can add a password hash here if you add a password field later.
    const admin = await User.create({
      name:       ADMIN_NAME,
      email:      ADMIN_EMAIL,
      role:       'Admin',
      isVerified: true,
      profilePicture: '',
    });

    console.log('🎉  Admin user created successfully!');
    console.log(`    Name  : ${admin.name}`);
    console.log(`    Email : ${admin.email}`);
    console.log(`    Role  : ${admin.role}`);
    console.log(`    ID    : ${admin._id}`);

  } catch (err) {
    console.error('❌  Error seeding admin:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌  MongoDB disconnected. Done.');
    process.exit(0);
  }
}

seedAdmin();
