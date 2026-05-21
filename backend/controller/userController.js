const { createUser, getUserByEmail, updateUser, updatePassword } = require("../model/userModel");

const addUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, city, password } = req.body;

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

    const user = await createUser(firstName, lastName, email, phone, city, password);

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

const updateProfile = async (req, res) => {
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

module.exports = { addUser, updateProfile };
