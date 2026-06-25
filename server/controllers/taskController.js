const Task = require('../models/Task');
const Project = require('../models/Project');

// Helper: verify project belongs to user
const verifyProject = async (projectId, userId) => {
  return await Project.findOne({ _id: projectId, owner: userId });
};

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
const getTasksByProject = async (req, res) => {
  try {
    const project = await verifyProject(req.params.projectId, req.user._id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const tasks = await Task.find({ project: req.params.projectId }).sort({ order: 1, createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create task
// @route   POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, projectId } = req.body;

    const project = await verifyProject(projectId, req.user._id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      project: projectId,
      owner: req.user._id,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task (also handles status change for drag-and-drop)
// @route   PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasksByProject, createTask, updateTask, deleteTask };
