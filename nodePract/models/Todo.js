import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      unique: true,
      minLength: [3, "Title must be at least 3 characters"],
      maxLength: [100, "Title cannot exceed 100 characters"]
    },

    description: {
      type: String,
      trim: true,
      maxLength: 500
    },

    completed: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "done"],
      default: "pending"
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },

    dueDate: {
      type: Date
    }
  },
  {
    timestamps: true,
  }
);


const Todo =mongoose.model("Todo", todoSchema)
export default Todo;
