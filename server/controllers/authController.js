import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * Generate JWT token (string)
 */
const genToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

/**
 * Cookie options for httpOnly token cookie
 */
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // only send over HTTPS in prod
  sameSite: "lax", // prevents some CSRF; change to 'strict' if desired
  // maxAge in ms — set to 7 days by default (matches common JWT expiry)
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// =======================
// SIGNUP
// =======================
export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already used" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({ email, passwordHash });

    // create token and set cookie
    const token = genToken(user._id);
    res.cookie("token", token, cookieOptions);

    // return user (do not return token in body for httpOnly flow)
    return res.json({
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

// =======================
// LOGIN
// =======================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    // create token and set cookie
    const token = genToken(user._1d ?? user._id); // tolerate _1d typo fallback
    // ensure token is created from correct id field
    const userId = user._id ?? user.id;
    const realToken = genToken(userId);

    res.cookie("token", realToken, cookieOptions);

    return res.json({
      user: { id: userId, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// =======================
// LOGOUT
// =======================
export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return res.json({ message: "Logged out" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Logout failed", error: error.message });
  }
};

// =======================
// GET CURRENT USER (me)
// Protect this route with your `protect` middleware (which sets req.user)
// =======================
export const me = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findById(req.user).select("_id email");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user: { id: user._id, email: user.email } });
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
};
