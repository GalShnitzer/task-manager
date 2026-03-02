const express = require('express');
const todoController = require('../controllers/todoController');

const router = express.Router();

// router.route('/todo-stats').get(todoController.getTodoStats);

// router.route('/monthly-plan/:year').get(todoController.getMonthlyPlan);

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

router.patch('/:id/recover', todoController.recoverTodo);
router.delete('/:id/permanent', todoController.deleteTodoPermanent);

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
  .delete(todoController.deleteTodo);

module.exports = router;
