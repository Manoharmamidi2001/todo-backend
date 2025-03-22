import express from "express";
import { createTodo, getTodos, updateTodo, deleteTodo } from "../controllers/todo.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// ✅ Admin can create tasks for users
router.post("/", protect, adminOnly, createTodo);

// ✅ Users can only get their own tasks (Admins can get all tasks)
router.get("/", protect, getTodos);

// ✅ Admin can update any task, Users can only update their own tasks
router.put("/:id", protect, updateTodo);

// ✅ Admin can delete any task
router.delete("/:id", protect, adminOnly, deleteTodo);

export default router;