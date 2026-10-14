import { useState } from 'react';
import { useSolveHubStore } from '../../store/solveHubStore';
import { formatCount } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function LeftSidebar() {
  const {
    activeView,
    setActiveView,
    selectedCommunity,
    setSelectedCommunity,
    communities,
    createCommunity,
  } = useSolveHubStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommIcon, setNewCommIcon] = useState('✨');
  const [newCommDesc, setNewCommDesc] = useState('');

  const joinedCommunities = communities.filter((c) => c.j);

  const navItems = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'comms', icon: '👥', label: 'Communities' },
    { id: 'explore', icon: '🧭', label: 'Explore' },
    { id: 'trending', icon: '📈', label: 'Trending' },
    { id: 'saved', icon: '🔖', label: 'Saved' },
  ];

  const handleNavClick = (id) => {
    setActiveView(id);
  };

  const handleCommunityClick = (commName) => {
    if (selectedCommunity === commName) {
      setSelectedCommunity(null);
    } else {
      setSelectedCommunity(commName);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newCommName.trim()) {
      toast.error('Community name is required');
      return;
    }
    createCommunity({
      name: newCommName.trim(),
      icon: newCommIcon.trim() || '✨',
      desc: newCommDesc.trim(),
    });
    toast.success(`Community "${newCommName}" created! 🎉`);
    setNewCommName('');
    setNewCommDesc('');
    setShowCreateModal(false);
  };

  const handleSettings = () => {
    const currentKey = localStorage.getItem('sh_key') || '';
    const newKey = prompt('Paste your Gemini API key (free at aistudio.google.com):', currentKey);
    if (newKey !== null) {
      localStorage.setItem('sh_key', newKey.trim());
      toast.success('Gemini key saved to local storage!');
    }
  };

  return (
    <aside className="w-[240px] flex-shrink-0 sticky top-[65px] self-start max-h-[calc(100vh-80px)] overflow-y-auto px-2 py-4">
      {/* General Section */}
      <div className="mb-6">
        <h4 className="text-[15px] font-semibold text-[#f2f2f2] px-3 mb-3">General</h4>
        <nav className="space-y-1">
          {navItems.map(({ id, icon, label }) => {
            const isActive = activeView === id && !selectedCommunity;
            return (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                id={`nav-${id}`}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm text-left transition-all duration-150 ${
                  isActive
                    ? 'bg-[#f4ef5a] text-black font-semibold shadow-sm'
                    : 'text-[#d1d5db] hover:bg-[#1b1b1d] hover:text-white'
                }`}
              >
                <span className="text-base">{icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Your Community Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-3 mb-3">
          <h4 className="text-[15px] font-semibold text-[#f2f2f2]">Your Community</h4>
          <button
            onClick={() => setShowCreateModal(true)}
            id="create-community-plus-btn"
            className="w-6 h-6 flex items-center justify-center text-lg text-[#8c8c93] hover:text-[#f4ef5a] hover:bg-[#1b1b1d] rounded transition-colors"
            title="Create Community"
          >
            +
          </button>
        </div>

        <div className="space-y-1">
          {joinedCommunities.map((c) => {
            const isSelected = selectedCommunity === c.n;
            return (
              <button
                key={c.id || c.n}
                onClick={() => handleCommunityClick(c.n)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-left transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#1b1b1d] border border-[#2a2a2d] text-white'
                    : 'hover:bg-[#1b1b1d] text-[#d1d5db]'
                }`}
              >
                <div className="w-[34px] h-[34px] rounded-[10px] bg-[#1b1b1d] flex items-center justify-center text-base flex-shrink-0">
                  {c.i}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate text-[#f2f2f2]">{c.n}</div>
                  <div className="text-[11px] text-[#8c8c93] truncate">{formatCount(c.m)} Members</div>
                </div>
              </button>
            );
          })}
          {joinedCommunities.length === 0 && (
            <div className="px-3 py-2 text-xs text-[#8c8c93]">No communities joined yet.</div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="pt-4 border-t border-[#2a2a2d]/80 space-y-1">
        <button
          onClick={() => toast('SolveHub: post problems, get solutions, or ask Solve AI.', { icon: '🛟' })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm text-[#8c8c93] hover:text-white hover:bg-[#1b1b1d] transition-colors"
        >
          <span>🛟</span>
          <span>Help Center</span>
        </button>
        <button
          onClick={handleSettings}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm text-[#8c8c93] hover:text-white hover:bg-[#1b1b1d] transition-colors"
        >
          <span>⚙️</span>
          <span>Settings (AI key)</span>
        </button>
      </div>

      {/* Modal to Create New Community */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#131314] border border-[#2a2a2d] rounded-2xl w-full max-w-sm p-5 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Community</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs text-[#8c8c93] mb-1">Community Name</label>
                <input
                  type="text"
                  value={newCommName}
                  onChange={(e) => setNewCommName(e.target.value)}
                  placeholder="e.g. Next.js Developers"
                  className="w-full bg-[#1b1b1d] border border-[#2a2a2d] rounded-xl px-3 py-2 text-sm text-white placeholder-[#8c8c93] outline-none focus:border-[#f4ef5a]"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-[#8c8c93] mb-1">Emoji Icon</label>
                <input
                  type="text"
                  value={newCommIcon}
                  onChange={(e) => setNewCommIcon(e.target.value)}
                  placeholder="e.g. ⚡, 🚀, 💻"
                  className="w-full bg-[#1b1b1d] border border-[#2a2a2d] rounded-xl px-3 py-2 text-sm text-white placeholder-[#8c8c93] outline-none focus:border-[#f4ef5a]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8c8c93] mb-1">Description</label>
                <input
                  type="text"
                  value={newCommDesc}
                  onChange={(e) => setNewCommDesc(e.target.value)}
                  placeholder="What is this community about?"
                  className="w-full bg-[#1b1b1d] border border-[#2a2a2d] rounded-xl px-3 py-2 text-sm text-white placeholder-[#8c8c93] outline-none focus:border-[#f4ef5a]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 text-xs text-[#8c8c93] hover:text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f4ef5a] text-black font-semibold text-xs rounded-xl hover:bg-[#e6e14e] transition-colors"
                >
                  Create Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
