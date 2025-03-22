import express from "express";
import { postUser, loginUser, updateUser, deleteUser, forAdmin } from "../controllers/user.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", postUser); // Register User
router.post("/login", loginUser);   // Login User


// ✅ Update User (Admin or Self)
router.put("/:id", protect, updateUser);

// ✅ Delete User (Admin Only)
router.delete("/:id", protect, adminOnly, deleteUser);

// ✅ Protected Route (Requires Auth)
router.get("/profile", protect, (req, res) => {
    res.json({ message: "Protected Profile Data", user: req.user });
});

// ✅ Admin-Only Route (Example: Get All Users)
router.get("/admin/users", protect, adminOnly, forAdmin);

export default router;
