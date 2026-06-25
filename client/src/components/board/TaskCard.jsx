import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const PRIORITY = {
  high: { label: 'high', cls: 'bg-red-50 text-red-600' },
  medium: { label: 'medium', cls: 'bg-amber-50 text-amber-600' },
  low: { label: 'low', cls: 'bg-green-50 text-green-600' },
};

const ACCENT = {
  todo: 'transparent',
  inprogress: '#534AB7',
  done: '#1D9E75',
};

export default function TaskCard({ task, onEdit, onDelete, isDragging }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSorting,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSorting ? 0.4 : 1,
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'done';

  const isDone = task.status === 'done';

  const p = PRIORITY[task.priority] || PRIORITY.medium;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });

  return (
    <div
      ref={setNodeRef}
      className={`bg-white rounded-lg border group transition-all ${
        isDragging
          ? 'shadow-lg rotate-1 border-indigo-200'
          : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
      } ${isDone ? 'opacity-60' : ''}`}
      style={{
        ...style,
        borderLeft:
          task.status !== 'todo'
            ? `3px solid ${ACCENT[task.status]}`
            : undefined,
        borderRadius:
          task.status !== 'todo'
            ? '0 8px 8px 0'
            : '8px',
      }}
    >
      <div className="p-3">
        <div className="flex items-start gap-2">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="mt-0.5 cursor-grab active:cursor-grabbing text-gray-200 hover:text-gray-400 transition-colors flex-shrink-0 text-base leading-none"
          >
            ⠿
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium leading-snug ${
                isDone
                  ? 'line-through text-gray-400'
                  : 'text-gray-800'
              }`}
            >
              {task.title}
            </p>

            {task.description && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.cls}`}
              >
                {p.label}
              </span>

              {task.dueDate && (
                <span
                  className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded-full ${
                    isOverdue
                      ? 'bg-red-50 text-red-500'
                      : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>

                  {formatDate(task.dueDate)}
                  {isOverdue ? ' !' : ''}
                </span>
              )}

              {isDone && (
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>

                  Done
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="text-gray-300 hover:text-indigo-500 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>

            <button
              onClick={() => onDelete(task._id)}
              className="text-gray-300 hover:text-red-400 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}