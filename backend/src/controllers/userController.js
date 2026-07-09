import { createUser, getUserByEmail, updateUser, updatePassword, comparePassword } from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const addUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, city, password, role } = req.body;

    if (!firstName || !lastName || !email || !phone || !city || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (phone.length !== 10 || isNaN(phone)) {
      return res.status(400).json({
        message: "Phone number must be exactly 10 digits",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const validRole = role === 'technician' ? 'technician' : 'user';
    const user = await createUser(firstName, lastName, email, phone, city, password, validRole);

    return res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        city: user.city,
      },
    });

  } catch (e) {
    if (e.code === "23505") {
      return res.status(400).json({
        message: "Email already exists",
      });
    }
    res.status(500).json({
      message: "Something went wrong",
      error: e.message,
    });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, city, newPassword } = req.body;

    if (!firstName || !lastName || !email || !phone || !city) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (phone.length !== 10 || isNaN(phone)) {
      return res.status(400).json({
        message: "Phone number must be exactly 10 digits",
      });
    }

    const user = await updateUser(id, firstName, lastName, email, phone, city);

    if (newPassword) {
      if (newPassword.length < 8) {
        return res.status(400).json({
          message: "Password must be at least 8 characters",
        });
      }
      await updatePassword(id, newPassword);
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        city: user.city,
      },
    });

  } catch (e) {
    if (e.code === "23505") {
      return res.status(400).json({
        message: "Email already exists",
      });
    }
    res.status(500).json({
      message: "Something went wrong",
      error: e.message,
    });
  }
};
