import { useState } from 'react';
import { useSolveHubStore } from '../../store/solveHubStore';
import { getAvatarColor } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function TopBar({ onOpenAuth }) {
  const {
    currentUser,
    searchQuery,
    setSearchQuery,
    setActiveView,
    toggleAiChat,
    setCurrentUser,
    viewUserProfile,
  } = useSolveHubStore();

  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim()) {
      setActiveView('explore');
    }
  };

  const handleUserClick = () => {
    setShowUserMenu((prev) => !prev);
  };

  const handleChangeName = () => {
    const newName = prompt('Enter your name:', currentUser.name)?.trim();
    if (newName) {
      setCurrentUser({
        ...currentUser,
        name: newName,
        handle: '@' + newName.toLowerCase().replace(/\s+/g, ''),
      });
      toast.success(`Name updated to ${newName}`);
    }
    setShowUserMenu(false);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-4 md:px-6 py-3 bg-[#0a0a0b] border-b border-[#2a2a2d]">
      {/* Brand Logo */}
      <div
        onClick={() => {
          setActiveView('home');
          setSearchQuery('');
        }}
        className="flex items-center gap-2 cursor-pointer select-none w-auto md:w-[220px] flex-shrink-0"
      >
        <div className="w-[30px] h-[30px] bg-[#f4ef5a] text-black font-bold text-lg rounded-lg flex items-center justify-center shadow-sm">
          S
        </div>
        <span className="text-xl md:text-2xl font-bold tracking-tight text-[#f2f2f2]">
          SolveHub
        </span>
      </div>

      {/* Centered Rounded Search Bar */}
      <div className="flex-1 max-w-[540px] mx-auto">
        <div className="flex items-center gap-2.5 px-4 py-2 md:py-2.5 bg-[#131314] border border-[#2a2a2d] rounded-full focus-within:border-[#f4ef5a] transition-all">
          <span className="text-sm text-[#8c8c93]">🔍</span>
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search problems, topics, solutions..."
            className="w-full bg-transparent text-[#f2f2f2] placeholder-[#8c8c93] text-sm outline-none border-none"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveView('home');
              }}
              className="text-xs text-[#8c8c93] hover:text-white px-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        {/* Solve AI Trigger Button */}
        <button
          onClick={() => toggleAiChat()}
          id="top-solve-ai-btn"
          className="bg-[#f4ef5a] hover:bg-[#e6e14e] text-black font-semibold text-xs md:text-sm px-3 md:px-4 py-2 md:py-2.5 rounded-full transition-all duration-150 flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          <span>✨</span>
          <span>Solve AI</span>
        </button>

        {/* Mail Icon */}
        <button
          onClick={() => toast('No new direct messages', { icon: '✉️' })}
          className="p-2 text-lg text-[#8c8c93] hover:text-[#f2f2f2] hover:bg-[#1b1b1d] rounded-lg transition-colors"
          title="Messages"
        >
          ✉️
        </button>

        {/* Bell Icon */}
        <button
          onClick={() => toast('You have no unread notifications', { icon: '🔔' })}
          id="bell"
          className="p-2 text-lg text-[#8c8c93] hover:text-[#f2f2f2] hover:bg-[#1b1b1d] rounded-lg transition-colors relative"
          title="Notifications"
        >
          🔔
        </button>

        {/* User Avatar & Name */}
        <div className="relative">
          <div
            onClick={handleUserClick}
            id="user-profile-menu-btn"
            className="flex items-center gap-2.5 cursor-pointer p-1 rounded-full hover:bg-[#1b1b1d] transition-colors"
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-black text-sm select-none shadow-sm flex-shrink-0"
              style={{ backgroundColor: getAvatarColor(currentUser.name) }}
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <span className="hidden lg:inline text-sm font-medium text-[#f2f2f2] max-w-[120px] truncate">
              {currentUser.name}
            </span>
          </div>

          {/* User popup dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#131314] border border-[#2a2a2d] rounded-xl shadow-2xl py-1.5 z-50 text-sm">
              <div className="px-3 py-2 border-b border-[#2a2a2d]">
                <p className="font-semibold text-[#f2f2f2] truncate">{currentUser.name}</p>
                <p className="text-xs text-[#8c8c93] truncate">{currentUser.handle}</p>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  viewUserProfile(currentUser.name);
                }}
                className="w-full text-left px-3 py-2 text-[#f2f2f2] hover:bg-[#1b1b1d] transition-colors flex items-center gap-2"
              >
                🏆 Portfolio & Profile
              </button>
              <button
                onClick={handleChangeName}
                className="w-full text-left px-3 py-2 text-[#f2f2f2] hover:bg-[#1b1b1d] transition-colors flex items-center gap-2"
              >
                ✏️ Change Name
              </button>
              {onOpenAuth && (
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenAuth();
                  }}
                  className="w-full text-left px-3 py-2 text-[#f4ef5a] hover:bg-[#1b1b1d] transition-colors flex items-center gap-2"
                >
                  🔐 Account / Login
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
