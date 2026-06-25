import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

export default function KanbanColumn({ column, tasks, onEdit, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [hoveredTaskId, setHoveredTaskId] = useState(null);

  return (
    <div className="flex-shrink-0 w-72">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700 text-sm">{column.label}</h3>
        <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-[400px] rounded-xl p-3 transition-colors ${column.color} ${
          isOver ? 'ring-2 ring-primary-400 ring-offset-1' : ''
        }`}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                // isAnyHovered: true = this card is hovered, false = another card is hovered, null = nothing hovered
                isAnyHovered={
                  hoveredTaskId === null ? null : hoveredTaskId === task._id ? true : false
                }
                onMouseEnter={() => setHoveredTaskId(task._id)}
                onMouseLeave={() => setHoveredTaskId(null)}
              />
            ))}
          </div>
        </SortableContext>

        {tasks.length === 0 && (
          <p className="text-center text-gray-300 text-sm mt-8">Drop tasks here</p>
        )}
      </div>
    </div>
  );
}
