require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Task = require("./models/Task");
const User = require("./models/User");
const auth = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());

/* ---------------- MONGODB CONNECTION ---------------- */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

/* ---------------- HOME ROUTE ---------------- */

app.get("/", (req, res) => {
  res.send("Backend is running successfully");
});

/* ---------------- SIGNUP ---------------- */

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

/* ---------------- LOGIN ---------------- */

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email or Password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Email or Password",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

/* ---------------- CREATE TASK ---------------- */

app.post("/tasks", auth, async (req, res) => {
  try {
    const {
      title,
      dueDate,
      priority,
      category
    } = req.body;

    const task = await Task.create({
      title,
      dueDate,
      priority,
      category,
      user: req.user.id,
    });

    res.json(task);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

/* ---------------- READ TASKS ---------------- */

app.get("/tasks", auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user.id,
    });

    res.json(tasks);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

/* ---------------- UPDATE TASK ---------------- */

app.put("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      req.body,
      { new: true }
    );

    res.json(task);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

/* ---------------- DELETE TASK ---------------- */

app.delete("/tasks/:id", auth, async (req, res) => {
  try {
    await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    res.json({
      message: "Task deleted",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

/* ---------------- SERVER ---------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
