import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { fetchProjects, createProject, deleteProject } from '../api';
import CommandPalette from '../components/common/CommandPalette';
import useCommandPalette from '../hooks/useCommandPalette';

const PROJECT_COLORS = ['#534AB7', '#1D9E75', '#D85A30', '#378ADD', '#D4537E', '#BA7517'];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', color: PROJECT_COLORS[0] });
  const { open: cmdOpen, setOpen: setCmdOpen } = useCommandPalette();

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      const { data } = await fetchProjects();
      setProjects(data);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await createProject(form);
      setProjects([data, ...projects]);
      setShowModal(false);
      setForm({ title: '', description: '', color: PROJECT_COLORS[0] });
      toast.success('Project created!');
    } catch { toast.error('Failed to create project'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await deleteProject(id);
      setProjects(projects.filter((p) => p._id !== id));
      toast.success('Project deleted');
    } catch { toast.error('Failed to delete project'); }
  };

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-full z-10">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-600" />
            <span className="text-lg font-medium text-indigo-600">TaskFlow</span>
          </div>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          <p className="text-xs text-gray-400 px-5 mb-2 uppercase tracking-wide">Menu</p>
          <div className="flex items-center gap-2 px-5 py-2 text-sm text-indigo-600 bg-indigo-50 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            Dashboard
          </div>
          <p className="text-xs text-gray-400 px-5 mt-5 mb-2 uppercase tracking-wide">Projects</p>
          {projects.map(p => (
            <Link key={p._id} to={`/project/${p._id}`}
              className="flex items-center gap-2 px-5 py-2 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
              <span className="truncate">{p.title}</span>
            </Link>
          ))}
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2 text-sm text-gray-400 hover:text-gray-600 w-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
            New project
          </button>
        </nav>
        <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600 flex-shrink-0">
            {initials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button onClick={logout} title="Logout" className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" /></svg>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-56 flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-xl font-medium text-gray-800">My Projects</h1>
            <p className="text-sm text-gray-400 mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Command palette trigger */}
            <button onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 text-sm px-3 py-2 rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Search
              <kbd className="text-xs bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-400">⌘K</kbd>
            </button>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Project
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-36 bg-white rounded-xl border border-gray-100 animate-pulse" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <p className="text-gray-500 font-medium">No projects yet</p>
            <p className="text-sm text-gray-400 mt-1">Click "New Project" to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project._id} className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all p-5 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-medium text-base"
                    style={{ background: project.color }}>
                    {project.title[0].toUpperCase()}
                  </div>
                  <button onClick={() => handleDelete(project._id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-lg leading-none">×</button>
                </div>
                <Link to={`/project/${project._id}`}>
                  <h3 className="font-medium text-gray-800 hover:text-indigo-600 transition-colors">{project.title}</h3>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2 leading-relaxed">{project.description || 'No description'}</p>
                </Link>
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="w-full bg-gray-100 rounded-full h-1">
                    <div className="h-1 rounded-full" style={{ width: '40%', background: project.color }} />
                  </div>
                  <Link to={`/project/${project._id}`}
                    className="ml-4 text-xs font-medium text-indigo-500 hover:text-indigo-700 whitespace-nowrap transition-colors">
                    Open →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Command Palette */}
      {cmdOpen && (
        <CommandPalette
          projects={projects}
          tasks={[]}
          onClose={() => setCmdOpen(false)}
          onNewProject={() => setShowModal(true)}
        />
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-medium text-gray-800">New Project</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-300 hover:text-gray-500 text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Title</label>
                <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value }) } required placeholder="Project name" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Description</label>
                <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What is this project about?" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Color</label>
                <div className="flex gap-2">
                  {PROJECT_COLORS.map(color => (
                    <button key={color} type="button" onClick={() => setForm({ ...form, color })}
                      className="w-7 h-7 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
                      style={{ background: color, outline: form.color === color ? `3px solid ${color}` : 'none', outlineOffset: '2px' }}>
                      {form.color === color && <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">Create project</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium py-2 rounded-lg transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}