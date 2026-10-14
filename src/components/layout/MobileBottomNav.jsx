import { useSolveHubStore } from '../../store/solveHubStore';

export default function MobileBottomNav() {
  const { activeView, setActiveView, selectedCommunity, setSelectedCommunity, toggleAiChat } =
    useSolveHubStore();

  const items = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'comms', icon: '👥', label: 'Communities' },
    { id: 'explore', icon: '🧭', label: 'Explore' },
    { id: 'saved', icon: '🔖', label: 'Saved' },
    { id: 'ai', icon: '✨', label: 'Solve AI' },
  ];

  const handleClick = (id) => {
    if (id === 'ai') {
      toggleAiChat(true);
    } else {
      setSelectedCommunity(null);
      setActiveView(id);
    }
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0b]/95 backdrop-blur-md border-t border-[#2a2a2d] flex items-center justify-around px-2 py-2">
      {items.map(({ id, icon, label }) => {
        const isActive = id === 'ai' ? false : activeView === id && !selectedCommunity;
        return (
          <button
            key={id}
            onClick={() => handleClick(id)}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg text-xs transition-colors ${
              isActive
                ? 'text-[#f4ef5a] font-semibold'
                : 'text-[#8c8c93] hover:text-[#f2f2f2]'
            }`}
          >
            <span className="text-lg leading-none">{icon}</span>
            <span className="text-[10px]">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
