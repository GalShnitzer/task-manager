const express = require('express');
const todoController = require('../controllers/todoController');
const authController = require('../controllers/authController');

const router = express.Router();

// router.route('/todo-stats').get(todoController.getTodoStats);

// router.route('/monthly-plan/:year').get(todoController.getMonthlyPlan);

router.use(authController.protect);

router.get(
  '/archived',
  todoController.addStatusToQuery('archived'),
  todoController.getMyTodos,
);

router.get(
  '/due-this-week',
  todoController.dueThisWeek,
  todoController.getMyTodos,
);

router
  .route('/')
  .get(
    todoController.addStatusToQuery({ $ne: 'archived' }),
    todoController.getMyTodos,
  )
  .post(todoController.createTodo);
router
  .route('/:id')
  .get(todoController.getTodo)
  .patch(todoController.updateTodo)
  .patch('/recover', todoController.recoverTodo)
  .delete(todoController.deleteTodo)
  .delete('/permanent', todoController.deleteTodoPermanent);

module.exports = router;
