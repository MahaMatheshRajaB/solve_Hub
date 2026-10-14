import { useState } from 'react';
import { useSolveHubStore } from '../../store/solveHubStore';
import { formatCount, formatTimeAgo, getAvatarColor } from '../../utils/formatters';
import { aiFixCode } from '../../lib/gemini';
import SolutionCard from '../solution/SolutionCard';
import SolutionReplyForm from '../solution/SolutionReplyForm';
import LivePreviewModal from '../preview/LivePreviewModal';
import toast from 'react-hot-toast';

export default function PostItem({ post }) {
  const {
    currentUser,
    votePost,
    toggleSavePost,
    deletePost,
    toggleHelpful,
    askAiSolution,
    addComment,
    incrementViews,
    setSearchQuery,
    setActiveView,
    viewUserProfile,
  } = useSolveHubStore();

  const [isOpenComments, setIsOpenComments] = useState(false);
  const [askingAi, setAskingAi] = useState(false);
  const [fixingCode, setFixingCode] = useState(false);

  // Live preview modal state
  const [previewState, setPreviewState] = useState({
    isOpen: false,
    title: '',
    srcDoc: null,
    url: null,
  });

  const isSolved = post.cm?.some((c) => c.help);
  const myVote = post.votes?.[currentUser.name] || 0;
  const isSaved = post.saves?.includes(currentUser.name);
  const isAuthor = post.a === currentUser.name;
  const handle = '@' + post.a.toLowerCase().replace(/\s+/g, '');

  // Check if problem contains code block or code-like patterns
  const hasCodeInPost = post.body?.includes('```') || /def |function|import |class |SELECT |<html|console\./i.test(post.body || '');

  const handleToggleComments = () => {
    if (!isOpenComments) {
      incrementViews(post.id);
    }
    setIsOpenComments((prev) => !prev);
  };

  const handleAskAi = async () => {
    setAskingAi(true);
    setIsOpenComments(true);
    try {
      await askAiSolution(post.id);
      toast.success('Solve AI added a step-by-step solution! ✨');
    } catch (e) {
      toast.error('AI service unavailable');
    } finally {
      setAskingAi(false);
    }
  };

  const handleFixCodeWithAi = async () => {
    setFixingCode(true);
    setIsOpenComments(true);
    try {
      const res = await aiFixCode({
        code: post.body,
        language: post.c?.toLowerCase() || 'code',
        problem: post.title,
      });

      addComment(post.id, {
        type: 'code',
        code: res.fixedCode,
        language: post.c?.toLowerCase() || 'python',
        explanation: 'Here is the corrected and optimized code suggested by SolveBot to fix the issue:',
        txt: 'Corrected code solution by SolveBot',
        author: 'Solve AI',
        isAi: true,
      });

      toast.success('SolveBot posted a corrected code solution! 🤖');
    } catch (err) {
      toast.error('AI code fixing failed');
    } finally {
      setFixingCode(false);
    }
  };

  const handleTagClick = (tag) => {
    setSearchQuery('#' + tag);
    setActiveView('explore');
  };

  const openPreview = ({ title, srcDoc, url }) => {
    setPreviewState({
      isOpen: true,
      title: title || 'Live Preview',
      srcDoc: srcDoc || null,
      url: url || null,
    });
  };

  return (
    <>
      <article className="bg-[#131314] border border-[#2a2a2d] rounded-xl p-4 mb-3 transition-all duration-150 hover:border-[#353539]">
        {/* Top Meta info */}
        <div className="flex items-center gap-2 text-sm text-[#8c8c93] mb-3">
          <span className="text-[#f2f2f2] font-medium">{post.c}</span>
          <span>•</span>
          <span>{formatTimeAgo(post.t)}</span>
          <span
            className={`ml-1 text-xs px-2 py-0.5 rounded-[6px] font-medium ${
              isSolved
                ? 'bg-[#12351f] text-[#3ddc84] font-semibold'
                : 'bg-[#1b1b1d] text-[#d1d5db]'
            }`}
          >
            {isSolved ? '✔ Solved' : post.kind || 'Problem'}
          </span>
        </div>

        {/* Author info */}
        <div className="flex items-center gap-2.5 mb-3">
          <div
            onClick={() => viewUserProfile(post.a)}
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-black text-sm select-none flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: getAvatarColor(post.a) }}
            title="View Portfolio & Profile"
          >
            {post.a.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span
                onClick={() => viewUserProfile(post.a)}
                className="font-semibold text-sm text-[#f2f2f2] hover:text-[#f4ef5a] cursor-pointer transition-colors"
                title="View Portfolio & Profile"
              >
                {post.a}
              </span>
              <span className="text-[#3b9cff] text-xs font-bold" title="Verified Member">
                ✔
              </span>
            </div>
            <span className="text-[11px] text-[#8c8c93]">{handle}</span>
          </div>

          {/* Delete button for author */}
          {isAuthor && (
            <button
              onClick={() => {
                if (confirm('Delete this problem post?')) {
                  deletePost(post.id);
                  toast.success('Post deleted');
                }
              }}
              className="ml-auto text-[#8c8c93] hover:text-[#ff5252] p-1 text-sm rounded transition-colors"
              title="Delete post"
            >
              🗑
            </button>
          )}
        </div>

        {/* Tags chips */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {post.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="bg-[#2a2a2d] hover:bg-[#38383c] text-[#d1d5db] text-[11px] px-2 py-0.5 rounded-[5px] transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className="text-xl font-semibold text-[#f2f2f2] mb-2 leading-snug">{post.title}</h2>

        {/* Body text */}
        <div className="text-[#d0d0d5] text-sm leading-relaxed whitespace-pre-wrap mb-3 font-normal">
          {post.body}
        </div>

        {/* Optional attached image */}
        {post.img && (
          <div className="rounded-xl overflow-hidden border border-[#2a2a2d] my-3 max-h-80">
            <img src={post.img} alt="Post attachment" className="w-full object-cover max-h-80" />
          </div>
        )}

        {/* Footer action bar */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4 pt-3 mt-2 border-t border-[#2a2a2d]/60 text-xs text-[#8c8c93]">
          {/* Upvote */}
          <button
            onClick={() => votePost(post.id, 1)}
            className={`flex items-center gap-1 font-medium transition-colors ${
              myVote === 1 ? 'text-[#3ddc84] font-semibold' : 'hover:text-[#f2f2f2]'
            }`}
            title="Upvote"
          >
            <span>⬆</span>
            <span>{formatCount(post.up)}</span>
          </button>

          {/* Downvote */}
          <button
            onClick={() => votePost(post.id, -1)}
            className={`flex items-center gap-1 font-medium transition-colors ${
              myVote === -1 ? 'text-[#ff5252] font-semibold' : 'hover:text-[#f2f2f2]'
            }`}
            title="Downvote"
          >
            <span>⬇</span>
            <span>{formatCount(post.dn)}</span>
          </button>

          {/* Ask AI */}
          <button
            onClick={handleAskAi}
            disabled={askingAi}
            className="flex items-center gap-1 hover:text-[#f4ef5a] transition-colors disabled:opacity-50"
            title="Get instant step-by-step AI solution"
          >
            <span>✨</span>
            <span>{askingAi ? 'Thinking...' : 'Ask AI'}</span>
          </button>

          {/* Ask AI to fix my code (problem author or any code in post) */}
          {hasCodeInPost && (
            <button
              onClick={handleFixCodeWithAi}
              disabled={fixingCode}
              className="flex items-center gap-1 text-[#38bdf8] hover:text-[#7dd3fc] transition-colors disabled:opacity-50 font-medium"
              title="SolveBot will analyze the code in this problem and provide a corrected version"
            >
              <span>🛠️</span>
              <span>{fixingCode ? 'Fixing...' : 'Fix code with AI'}</span>
            </button>
          )}

          {/* Bookmark Save */}
          <button
            onClick={() => {
              toggleSavePost(post.id);
              toast(isSaved ? 'Removed from saved' : 'Saved to bookmarks', { icon: '🔖' });
            }}
            className={`flex items-center gap-1 hover:text-[#f2f2f2] transition-colors ${
              isSaved ? 'text-[#f4ef5a] font-medium' : ''
            }`}
          >
            <span>🔖</span>
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {/* View count */}
          <span className="ml-auto flex items-center gap-1">
            <span>👁</span>
            <span>{formatCount(post.views)}</span>
          </span>

          {/* Comments counter button */}
          <button
            onClick={handleToggleComments}
            className="flex items-center gap-1 hover:text-[#f2f2f2] transition-colors font-medium"
          >
            <span>💬</span>
            <span>{post.cm?.length || 0} Solutions</span>
          </button>
        </div>

        {/* Solutions Discussion Thread */}
        {isOpenComments && (
          <div className="mt-4 pt-3 border-t border-[#2a2a2d] space-y-3.5 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-[#8c8c93]">
              <span className="font-semibold text-white">Community Solutions ({post.cm?.length || 0})</span>
              <span>Mark helpful answers to solve the problem</span>
            </div>

            {/* List of Solution Cards */}
            {post.cm && post.cm.length > 0 ? (
              <div className="space-y-3">
                {post.cm.map((comment) => (
                  <SolutionCard
                    key={comment.id}
                    solution={comment}
                    post={post}
                    onPreviewRequest={openPreview}
                    onToggleHelpful={(commentId) => toggleHelpful(post.id, commentId)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#8c8c93] text-center py-3 bg-[#1b1b1d]/50 rounded-xl border border-[#2a2a2d]">
                No solutions yet. Submit a text answer, code snippet, project file, or website link below!
              </div>
            )}

            {/* Comprehensive Solution Reply Form */}
            <SolutionReplyForm
              postId={post.id}
              postTitle={post.title}
              onPreviewRequest={openPreview}
            />
          </div>
        )}
      </article>

      {/* Live Sandboxed Preview Modal */}
      <LivePreviewModal
        isOpen={previewState.isOpen}
        onClose={() => setPreviewState({ ...previewState, isOpen: false })}
        title={previewState.title}
        srcDoc={previewState.srcDoc}
        url={previewState.url}
      />
    </>
  );
}
