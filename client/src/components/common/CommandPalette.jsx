import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ACTIONS = [
  { id: 'dashboard', label: 'Go to dashboard', icon: 'home', shortcut: 'G', type: 'nav' },
  { id: 'new-project', label: 'New project', icon: 'folder', shortcut: 'N', type: 'action' },
];

function IconSVG({ name, className }) {
  const paths = {
    plus: 'M12 4v16m8-8H4',
    home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    folder: 'M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
    kanban: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7',
    check: 'M5 13l4 4L19 7',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={paths[name] || paths.check} />
    </svg>
  );
}

function ResultItem({ item, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
    >
      <div className={`w-7 h-7 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'border-indigo-200 bg-indigo-100' : 'border-gray-100 bg-gray-50'}`}
        style={item.color ? { background: item.color + '22', borderColor: item.color + '55' } : {}}>
        {item.color
          ? <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
          : <IconSVG name={item.icon} className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
        }
      </div>
      <span className={`text-sm flex-1 truncate ${isSelected ? 'text-indigo-700 font-medium' : 'text-gray-700'}`}>{item.label}</span>
      {item.sub && <span className="text-xs text-gray-400 flex-shrink-0">{item.sub}</span>}
      {item.shortcut && <kbd className="text-xs text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 flex-shrink-0">{item.shortcut}</kbd>}
    </div>
  );
}

export default function CommandPalette({ projects = [], tasks = [], onClose, onNewProject, onAddTask }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const q = query.toLowerCase().trim();

  const createItem = q ? [{ id: '__create__', label: `Create task "${query}"`, icon: 'plus', type: 'create' }] : [];
  const actionItems = ACTIONS.filter(a => !q || a.label.toLowerCase().includes(q));
  const projectItems = projects.filter(p => !q || p.title.toLowerCase().includes(q)).slice(0, 4)
    .map(p => ({ id: p._id, label: p.title, icon: 'kanban', type: 'project', color: p.color, data: p }));
  const taskItems = tasks.filter(t => q && t.title.toLowerCase().includes(q)).slice(0, 5)
    .map(t => ({ id: t._id, label: t.title, icon: 'check', type: 'task', sub: t.status === 'inprogress' ? 'In Progress' : t.status === 'done' ? 'Done' : 'To Do', data: t }));

  const allItems = [...createItem, ...actionItems, ...projectItems, ...taskItems];

  useEffect(() => { setSelected(0); }, [query]);

  useEffect(() => {
    const el = listRef.current?.children[selected];
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  const handleSelect = (item) => {
    if (!item) return;
    if (item.type === 'create') {
      if (onAddTask) onAddTask(query);
      else toast('Open a project board to add tasks');
      onClose();
    } else if (item.type === 'project') {
      navigate(`/project/${item.id}`);
      onClose();
    } else if (item.type === 'task') {
      navigate(`/project/${item.data.project}`);
      onClose();
    } else if (item.id === 'dashboard') {
      navigate('/dashboard');
      onClose();
    } else if (item.id === 'new-project') {
      onNewProject?.();
      onClose();
    } else {
      onClose();
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, allItems.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); handleSelect(allItems[selected]); }
    else if (e.key === 'Escape') onClose();
  };

  const groups = [
    { label: 'Create', items: createItem },
    { label: 'Actions', items: actionItems },
    { label: 'Projects', items: projectItems },
    { label: 'Tasks', items: taskItems },
  ].filter(g => g.items.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl overflow-hidden border border-gray-200"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)' }}>

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          <IconSVG name="search" className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search tasks, projects, or type to create..."
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-300 hover:text-gray-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <kbd className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 flex-shrink-0">esc</kbd>
        </div>

        {/* Results list */}
        <div ref={listRef} className="overflow-y-auto" style={{ maxHeight: '360px' }}>
          {allItems.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400">No results</div>
          )}
          {groups.map(group => (
            <div key={group.label}>
              <p className="text-xs text-gray-400 px-4 pt-3 pb-1 uppercase tracking-wider font-medium">{group.label}</p>
              {group.items.map(item => {
                const idx = allItems.findIndex(i => i.id === item.id);
                return (
                  <ResultItem
                    key={item.id}
                    item={item}
                    isSelected={idx === selected}
                    onClick={() => handleSelect(item)}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer hints */}
        <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-5 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <kbd className="bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5">↑</kbd>
            <kbd className="bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5">↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5">↵</kbd>
            select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5">esc</kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}