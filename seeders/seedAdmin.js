const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user');
const connectDB = require('../config/db');

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminExists = await User.findOne({ email: 'admin@gmail.com' });
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit();
    }

    const admin = new User({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: 'admin',
      role: 'admin',
    });

    await admin.save();
    console.log('Admin user created successfully');
    console.log(`Admin user details: \nName: ${admin.name} \nEmail: ${admin.email} \nPassword: 'admin'`);
    
    process.exit();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

seedAdmin();