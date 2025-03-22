import mongoose from "mongoose";
import Todo from "../models/todo.model.js";
import User from "../models/auth.user.model.js"; 

export const createTodo = async (req, res) => {
    const { title, description, priority, userId } = req.body;

    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied! Only admins can create tasks." });
        }

        // ✅ Validate userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId format!" });
        }

        // ✅ Check if the assigned user exists
        const assignedUser = await User.findById(userId);
        if (!assignedUser) {
            return res.status(404).json({ message: "Assigned user not found!" });
        }

        const newTodo = new Todo({
            user: userId, 
            title,
            description,
            priority,
        });

        const savedTodo = await newTodo.save();
        res.status(201).json(savedTodo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ✅ Get all Todos for logged-in user
export const getTodos = async (req, res) => {
    try {
        let todos;

        if (req.user.role === "admin") {
            // ✅ Admin can view all tasks
            todos = await Todo.find().populate("user", "fullname email");
        } else {
            // ✅ Users can view only their assigned tasks
            todos = await Todo.find({ user: req.user._id });
        }

        res.status(200).json(todos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTodo = async (req, res) => {
    const { title, description, priority, userId, completed } = req.body; // ✅ Accept `completed` field
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ message: "Task not found!" });
        }

        console.log("🔹 Update Request by:", req.user.role);

        // ✅ Admin can update any task (including reassigning users)
        if (req.user.role === "admin") {
            if (userId) {
                if (!mongoose.Types.ObjectId.isValid(userId)) {
                    return res.status(400).json({ message: "Invalid userId format!" });
                }

                const assignedUser = await User.findById(userId);
                if (!assignedUser) {
                    return res.status(404).json({ message: "Assigned user not found!" });
                }

                todo.user = userId;
            }
        } 
        // ✅ Normal users can only mark their assigned tasks as completed
        else if (todo.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this task!" });
        }

        // ✅ Allow only boolean values for `completed`
        if (typeof completed === "boolean") {
            todo.completed = completed;
        }

        todo.title = title || todo.title;
        todo.description = description || todo.description;
        todo.priority = priority || todo.priority;

        const updatedTodo = await todo.save();
        return res.status(200).json(updatedTodo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ✅ Delete a Todo
export const deleteTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ message: "Task not found!" });
        }

        console.log(`🔹 Delete Request by: ${req.user.role}, UserID: ${req.user._id}`);

        if (req.user.role === "admin" || todo.user.toString() === req.user._id.toString()) {
            await todo.deleteOne();
            return res.status(200).json({ message: "Task deleted successfully!" });
        }

        return res.status(403).json({ message: "Not authorized to delete this task!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

