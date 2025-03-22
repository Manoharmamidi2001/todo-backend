import mongoose from "mongoose";

const todoSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // ✅ Reference to User model
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
    },
    {
        timestamps: true,
    }
);

const Todo = mongoose.model("Todo", todoSchema);

export default Todo;
