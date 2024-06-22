const bcrypt = require('bcrypt');
const Admin = require('../AdminModel/Admin');

const createAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin instance with hashed password
    const newAdmin = new Admin({
      username,
      password: hashedPassword,
    });

    // Save admin to the database
    await newAdmin.save();

    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createAdmin };
