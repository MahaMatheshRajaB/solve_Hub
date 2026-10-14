import { useSolveHubStore } from '../../store/solveHubStore';
import { formatCount } from '../../utils/formatters';

export default function RightSidebar() {
  const { posts, communities, joinCommunity, setSelectedCommunity } = useSolveHubStore();

  // Compute trending topics from posts and communities
  const communityCounts = {};
  posts.forEach((p) => {
    communityCounts[p.c] = (communityCounts[p.c] || 0) + 1;
  });
  const totalPosts = posts.length || 1;

  // Rank top topics
  const trendingList = Object.entries(communityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // If few posts, backfill with top communities
  if (trendingList.length < 3) {
    communities.slice(0, 4).forEach((c) => {
      if (!communityCounts[c.n]) {
        trendingList.push([c.n, 1]);
      }
    });
  }

  // Suggested unjoined communities
  const suggestedCommunities = communities.filter((c) => !c.j).slice(0, 4);

  return (
    <aside className="w-[330px] flex-shrink-0 sticky top-[65px] self-start max-h-[calc(100vh-80px)] overflow-y-auto px-2 py-4 space-y-3.5">
      {/* Trending Topics Card */}
      <div className="bg-[#131314] border border-[#2a2a2d] rounded-xl p-4">
        <h3 className="text-base font-medium text-[#f2f2f2] mb-2">Trending Topics</h3>
        <div className="divide-y divide-[#2a2a2d]">
          {trendingList.map(([name, count], index) => {
            const pct = ((count / totalPosts) * 100).toFixed(1);
            return (
              <div
                key={name}
                onClick={() => setSelectedCommunity(name)}
                className="flex items-center gap-2.5 py-3 cursor-pointer group hover:opacity-90 transition-opacity"
              >
                <span className="text-xs text-[#8c8c93] w-5 font-mono">
                  {index + 1 < 10 ? `0${index + 1}` : index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#f2f2f2] group-hover:text-[#f4ef5a] transition-colors truncate">
                    {name}
                  </div>
                  <div className="text-[11px] text-[#8c8c93]">
                    {formatCount(count * 9000)} Posts
                  </div>
                </div>
                <span className="text-xs text-[#d0d0d5] font-mono">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested Community Card */}
      <div className="bg-[#131314] border border-[#2a2a2d] rounded-xl p-4">
        <h3 className="text-base font-medium text-[#f2f2f2] mb-3">Suggested Community</h3>
        <div className="space-y-3">
          {suggestedCommunities.map((c) => (
            <div key={c.id || c.n} className="flex items-center gap-2.5">
              <div className="w-[30px] h-[30px] rounded-[10px] bg-[#1b1b1d] flex items-center justify-center text-sm flex-shrink-0">
                {c.i}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#f2f2f2] truncate">{c.n}</div>
                <div className="text-[11px] text-[#8c8c93] truncate">{c.d}</div>
              </div>
              <button
                onClick={() => joinCommunity(c.n)}
                className="bg-white hover:bg-gray-100 text-black text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-150 flex-shrink-0 shadow-sm active:scale-95"
              >
                Join
              </button>
            </div>
          ))}
          {suggestedCommunities.length === 0 && (
            <div className="text-xs text-[#8c8c93] py-2 text-center">
              You joined all communities 🎉
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
