const Todo = require('../models/todoModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { filterObj } = require('./../utils/helpenFunctions');

// exports.aliasTopTodos = (req, res, next) => {
//   req.query.limit = '5';
//   req.query.sort = '-ratingsAverage,price';
//   req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
//   next();
// };
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
  const newTodo = await Todo.create({ ...req.body});
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

// exports.getTodoStats = catchAsync(async (req, res, next) => {
//   const stats = await Todo.aggregate([
//     {
//       $match: { ratingsAverage: { $gte: 4.5 }, status: { $ne: 'archived' } },
//     },
//     {
//       $group: {
//         _id: { $toUpper: '$difficulty' },
//         numTodos: { $sum: 1 },
//         numRatings: { $sum: '$ratingsQuantity' },
//         avgRating: { $avg: '$ratingsAverage' },
//         avgPrice: { $avg: '$price' },
//         minPrice: { $min: '$price' },
//         maxPrice: { $max: '$price' },
//       },
//     },
//     {
//       $sort: { avgPrice: 1 },
//     },
//   ]);
//   res.status(200).json({
//     status: 'success',
//     data: {
//       stats,
//     },
//   });
// });

// exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
//   const year = req.params.year * 1;
//   const plan = await Todo.aggregate([
//     {
//       $unwind: '$startDates', //make new document for each date in the startdates
//     },
//     {
//       $match: {
//         startDates: {
//           $gte: new Date(`${year}-01-01`),
//           $lte: new Date(`${year}-12-31`),
//         },
//       },
//     },
//     {
//       $group: {
//         _id: { $month: '$startDates' },
//         numTodosStarts: { $sum: 1 },
//         todos: {
//           $push: '$name',
//         },
//       },
//     },
//     {
//       $addFields: { month: '$_id' },
//     },
//     {
//       $project: {
//         _id: 0,
//       },
//     },
//     {
//       $sort: { numTodoStarts: -1 },
//     },
//     {
//       $limit: 6,
//     },
//   ]);
//   res.status(200).json({
//     status: 'success',
//     data: {
//       plan,
//     },
//   });
// });
