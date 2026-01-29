require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

async function run() {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.error('Usage: node scripts/checkLogin.js <email> <password>');
    process.exit(1);
  }

  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hmsdb';
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to', MONGO_URI);

  const user = await User.findOne({ $or: [{ email }, { Email: email }, { LoginName: email }] }).lean();
  if (!user) {
    console.log('No user found in usermasters for', email);
    // try fallback users collection
    const other = await mongoose.connection.collection('users').findOne({ email });
    if (!other) {
      console.log('No user found in users collection either.');
      process.exit(0);
    }
    console.log('Found in users collection:', {
      _id: other._id,
      email: other.email,
      hasPassword: !!(other.password || other.Password)
    });
    const stored = other.password || other.Password;
    if (stored) {
      const ok = await bcrypt.compare(password, stored);
      console.log('bcrypt.compare result:', ok);
    }
    process.exit(0);
  }

  const stored = user.password || user.Password;
  console.log('Found user in usermasters:', { _id: user._id, email: user.email || user.Email, hasPassword: !!stored });
  if (!stored) {
    console.log('No password field on user');
    process.exit(0);
  }
  const ok = await bcrypt.compare(password, stored);
  console.log('bcrypt.compare result:', ok);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
