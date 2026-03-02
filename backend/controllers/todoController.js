const Todo = require('../models/todoModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { filterObj } = require('./../utils/helpenFunctions');

exports.dueThisWeek = (req, res, next) => {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  req.query.dueDate = { gte: today, lte: nextWeek };
  next();
};

exports.addStatusToQuery = (status) => (req, res, next) => {
  if (req.query.status === 'archived') {
    return next(
      new AppError('To see archived todos, use the /archived endpoint', 400),
    );
  }
  if (!req.query.status) {
    req.query.status = status;
  }
  next();
};

exports.getMyTodos = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Todo.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const todos = await features.query;
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: todos.length,
    data: {
      todos,
    },
  });
});

exports.getTodo = catchAsync(async (req, res, next) => {
  const todo = await Todo.findOne({
    _id: req.params.id,
    status: { $ne: 'archived' },
  });
  if (!todo) {
    return next(new AppError('No todo found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      todo,
    },
  });
});

exports.createTodo = catchAsync(async (req, res, next) => {
  const newTodo = await Todo.create({ ...req.body });
  res.status(201).json({
    status: 'success',
    data: {
      todo: newTodo,
    },
  });
});

const updateTodoByObj = (obj) =>
  catchAsync(async (req, res, next) => {
    const todo = await Todo.findByIdAndUpdate(
      { _id: req.params.id, status: { $ne: 'archived' } },
      { ...obj, updatedAt: Date.now() },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!todo) {
      return next(new AppError('No todo found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        todo,
      },
    });
  });

//TODO : fix the returned status code
exports.updateTodo = (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    'title',
    'description',
    'status',
    'priority',
    'dueDate',
  );
  return updateTodoByObj(filteredBody)(req, res, next);
};

//TODo: fix the returned status code
exports.deleteTodo = (req, res, next) =>
  updateTodoByObj({ status: 'archived' })(req, res, next);

exports.deleteTodoPermanent = catchAsync(async (req, res, next) => {
  const todo = await Todo.findOneAndDelete({
    _id: req.params.id,
  });
  if (!todo) {
    return next(new AppError('No todo found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.recoverTodo = catchAsync(async (req, res, next) => {
  const todo = await Todo.findByIdAndUpdate(
    { _id: req.params.id, status: 'archived' },
    { status: 'todo', updatedAt: Date.now() },
    {
      new: true,
      runValidators: true,
    },
  );
  if (!todo) {
    return next(new AppError('cant recover todo with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      todo,
    },
  });
});

exports.getTodoStats = catchAsync(async (req, res, next) => {
  const stats = await Todo.aggregate([
    {
      $match: { status: { $ne: 'archived' } },
    },
    {
      $facet: {
        totalStats: [
          {
            $group: {
              _id: null,
              totalTodos: { $sum: 1 },
              doneTodos: {
                $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
              },
              lowPriority: {
                $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] },
              },
              mediumPriority: {
                $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] },
              },
              highPriority: {
                $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] },
              },
              urgentPriority: {
                $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] },
              },
            },
          },
        ],
      },
    },
  ]);

  const result = stats[0].totalStats[0];

  // Calculate percentages
  const { totalTodos } = result;
  const percentageDone =
    totalTodos > 0 ? (result.doneTodos / totalTodos) * 100 : 0;

  // Priority percentages sum to 100%
  const percentageLow =
    totalTodos > 0 ? (result.lowPriority / totalTodos) * 100 : 0;
  const percentageMedium =
    totalTodos > 0 ? (result.mediumPriority / totalTodos) * 100 : 0;
  const percentageHigh =
    totalTodos > 0 ? (result.highPriority / totalTodos) * 100 : 0;
  const percentageUrgent =
    100 - (percentageLow + percentageMedium + percentageHigh);

  res.status(200).json({
    status: 'success',
    data: {
      todoStats: {
        totalTodos,
        completionStats: {
          doneTodos: result.doneTodos,
          percentageDone: percentageDone.toFixed(2),
        },
        priorityStats: {
          lowPriority: result.lowPriority,
          percentageLow: percentageLow.toFixed(2),
          mediumPriority: result.mediumPriority,
          percentageMedium: percentageMedium.toFixed(2),
          highPriority: result.highPriority,
          percentageHigh: percentageHigh.toFixed(2),
          urgentPriority: result.urgentPriority,
          percentageUrgent: percentageUrgent.toFixed(2),
        },
      },
    },
  });
});

exports.getTodosByMonth = catchAsync(async (req, res, next) => {
  const field = req.query.field || 'createdAt';

  if (!['dueDate', 'createdAt'].includes(field)) {
    return next(
      new AppError(
        'field parameter must be either "dueDate" or "createdAt"',
        400,
      ),
    );
  }

  const selectedYear = req.query.year
    ? parseInt(req.query.year)
    : new Date().getFullYear();

  const plan = await Todo.aggregate([
    {
      $match: {
        [field]: {
          $gte: new Date(`${selectedYear}-01-01T00:00:00.000Z`),
          $lt: new Date(`${selectedYear + 1}-01-01T00:00:00.000Z`),
        },
        status: { $ne: 'archived' },
      },
    },
    {
      $group: {
        _id: { $month: { date: `$${field}`, timezone: 'Asia/Jerusalem' } },
        numTodos: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const monthMap = {};
  plan.forEach((item) => {
    monthMap[item._id] = item.numTodos;
  });

  const completeMonths = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    numTodos: monthMap[i + 1] || 0,
  }));

  res.status(200).json({
    status: 'success',
    year: selectedYear,
    field,
    data: {
      monthlyTodos: completeMonths,
    },
  });
});
