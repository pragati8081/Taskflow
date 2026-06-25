const express = require('express');
const router = express.Router();
const { getTasksByProject, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/project/:projectId', getTasksByProject);
router.post('/', createTask);
router.route('/:id').put(updateTask).delete(deleteTask);

module.exports = router;
