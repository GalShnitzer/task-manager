const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'todo must have a title'],
    unique: true,
    trim: true,
    maxlength: [40, 'A todo title must have less or equal than 40 characters'],
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    default: 'todo',
    enum: {
      values: ['todo', 'in-progress', 'done', 'archived'],
      message: 'Status is either: todo, in-progress, done, archived',
    },
  },

  priority: {
    type: String,
    default: 'low',
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Priority is either: low, medium, high, urgent',
    },
  },
  dueDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  updatedAt: Date,
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A todo must belong to a user'],
  },
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;
