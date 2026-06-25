import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { fetchProject, fetchTasksByProject, createTask, updateTask, deleteTask } from '../api';
import TaskCard from '../components/board/TaskCard';
import TaskModal from '../components/board/TaskModal';
import KanbanColumn from '../components/board/KanbanColumn';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'bg-gray-100' },
  { id: 'inprogress', label: 'In Progress', color: 'bg-blue-50' },
  { id: 'done', label: 'Done', color: 'bg-green-50' },
];

export default function BoardPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: proj }, { data: taskData }] = await Promise.all([
          fetchProject(id),
          fetchTasksByProject(id),
        ]);
        setProject(proj);
        setTasks(taskData);
      } catch {
        toast.error('Failed to load board');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status);

  const handleDragStart = (event) => {
    setActiveTask(tasks.find((t) => t._id === event.active.id));
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const draggedTask = tasks.find((t) => t._id === active.id);
    const newStatus = over.id; // column id

    if (!COLUMNS.find((c) => c.id === newStatus)) return; // dropped on a task, not a column
    if (draggedTask.status === newStatus) return;

    // Optimistic update
    setTasks(tasks.map((t) => (t._id === draggedTask._id ? { ...t, status: newStatus } : t)));

    try {
      await updateTask(draggedTask._id, { status: newStatus });
    } catch {
      toast.error('Failed to update task');
      setTasks(tasks); // revert
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        const { data } = await updateTask(editingTask._id, taskData);
        setTasks(tasks.map((t) => (t._id === data._id ? data : t)));
        toast.success('Task updated');
      } else {
        const { data } = await createTask({ ...taskData, projectId: id });
        setTasks([...tasks, data]);
        toast.success('Task created');
      }
      setShowModal(false);
      setEditingTask(null);
    } catch {
      toast.error('Failed to save task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((t) => t._id !== taskId));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">|</span>
          <div
            className="w-6 h-6 rounded"
            style={{ backgroundColor: project?.color }}
          />
          <span className="font-semibold text-gray-800">{project?.title}</span>
        </div>
        <button
          onClick={() => { setEditingTask(null); setShowModal(true); }}
          className="btn-primary text-sm"
        >
          + Add Task
        </button>
      </nav>

      {/* Kanban Board */}
      <div className="p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={getTasksByStatus(col.id)}
                onEdit={openEdit}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} isDragging />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task Modal */}
      {showModal && (
        <TaskModal
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
}
