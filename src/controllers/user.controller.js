import User from "../models/auth.user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Generate JWT Token (Includes Role)
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ✅ Register User (Allows Role Assignment)
export const postUser = async (req, res) => {
    const { fullname, email, password, role } = req.body;

    try {
        if (!fullname || !email || !password) {
            return res.status(400).json({ message: "Please enter all required fields!" });
        }

        const existUser = await User.findOne({ email });
        if (existUser) {
            return res.status(400).json({ message: "Email already exists!" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            fullname,
            email,
            password: hashedPassword,
            role: role || "user" // Default role is 'user'
        });

        await newUser.save();

        // Generate JWT Token with Role
        const token = generateToken(newUser._id, newUser.role);

        res.status(201).json({
            message: "User registered successfully!",
            user: { fullname, email, role: newUser.role, token }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Login User (Includes Role in Token)
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Please enter email and password!" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        // Generate JWT Token with Role
        const token = generateToken(user._id, user.role);

        res.status(200).json({
            message: "Login successful!",
            user: { fullname: user.fullname, email: user.email, role: user.role, token }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ✅ Update User (Admin or Self-Update)
export const updateUser = async (req, res) => {
    const { fullname, email, password, role } = req.body;
    const userId = req.params.id;

    try {
        // Find user
        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found!" });

        // Only admin can update any user; users can only update themselves
        if (req.user.role !== "admin" && req.user.id !== userId) {
            return res.status(403).json({ message: "Access denied!" });
        }

        // Update user details
        user.fullname = fullname || user.fullname;
        user.email = email || user.email;

        // Hash new password if provided
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        // Admin can update role, users cannot change their role
        if (req.user.role === "admin" && role) {
            user.role = role;
        }

        await user.save();

        res.status(200).json({ message: "User updated successfully!", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Delete User (Admin Only)
export const deleteUser = async (req, res) => {
    const userId = req.params.id;

    try {
        // Find user
        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found!" });

        // Only admin can delete users
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied!" });
        }

        await user.deleteOne();

        res.status(200).json({ message: "User deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const forAdmin = async (req, res) => {
    try {
        // Fetch users excluding those with role "admin"
        const users = await User.find({ role: { $ne: "admin" } }).select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};