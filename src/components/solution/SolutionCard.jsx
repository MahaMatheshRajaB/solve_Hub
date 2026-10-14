import { useState } from 'react';
import { useSolveHubStore } from '../../store/solveHubStore';
import { formatTimeAgo, formatCount, getAvatarColor } from '../../utils/formatters';
import { aiReviewSolution } from '../../lib/gemini';
import toast from 'react-hot-toast';

export default function SolutionCard({
  solution,
  post,
  onPreviewRequest,
  onToggleHelpful,
}) {
  const { currentUser, voteComment, viewUserProfile } = useSolveHubStore();
  const [copied, setCopied] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [aiReview, setAiReview] = useState(solution.aiReview || null);
  const [upvotes, setUpvotes] = useState(solution.upvotes || 0);
  const [hasVoted, setHasVoted] = useState(false);

  const isPostAuthor = post.a === currentUser.name;
  const isAi = solution.ai;

  const handleCopyCode = () => {
    if (!solution.code) return;
    navigator.clipboard.writeText(solution.code);
    setCopied(true);
    toast.success('Code copied to clipboard! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    if (!solution.fileData && !solution.fileUrl) {
      toast.error('File link not available');
      return;
    }
    const link = document.createElement('a');
    link.href = solution.fileData || solution.fileUrl;
    link.download = solution.fileName || 'project-solution.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloading ${solution.fileName || 'file'}... 📥`);
  };

  const handleReviewWithSolveBot = async () => {
    setReviewing(true);
    try {
      const res = await aiReviewSolution({
        code: solution.code || solution.txt,
        language: solution.language || 'code',
        title: post.title,
        explanation: solution.explanation || solution.txt,
      });
      setAiReview(res.review);
      toast.success('SolveBot code review generated! 🤖');
    } catch (e) {
      toast.error('AI code review unavailable');
    } finally {
      setReviewing(false);
    }
  };

  const handleVote = () => {
    if (hasVoted) {
      setUpvotes((v) => Math.max(0, v - 1));
      setHasVoted(false);
    } else {
      setUpvotes((v) => v + 1);
      setHasVoted(true);
      toast.success('Upvoted solution! ⬆');
    }
  };

  const handleReport = () => {
    const reason = prompt('Reason for reporting this solution (spam, malware, inappropriate):', 'Spam / Broken code');
    if (reason) {
      toast.success('Report submitted for moderator review. Thank you for keeping SolveHub safe! 🛡️');
    }
  };

  const getTypeBadge = () => {
    switch (solution.type) {
      case 'code':
        return (
          <span className="bg-[#1b1b1d] border border-[#38bdf8]/30 text-[#38bdf8] text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span>💻</span>
            <span>Code Snippet</span>
          </span>
        );
      case 'project':
        return (
          <span className="bg-[#1b1b1d] border border-[#a855f7]/30 text-[#c084fc] text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span>📦</span>
            <span>Project Upload</span>
          </span>
        );
      case 'website':
        return (
          <span className="bg-[#1b1b1d] border border-[#f4ef5a]/30 text-[#f4ef5a] text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span>🌐</span>
            <span>Website Demo</span>
          </span>
        );
      default:
        return (
          <span className="bg-[#1b1b1d] border border-[#2a2a2d] text-[#8c8c93] text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span>📝</span>
            <span>Text Answer</span>
          </span>
        );
    }
  };

  return (
    <div
      className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
        solution.help
          ? 'bg-[#12351f]/35 border-[#3ddc84]/50 shadow-sm'
          : isAi
          ? 'bg-[#1b1b1d] border-[#f4ef5a]/30'
          : 'bg-[#1b1b1d] border-[#2a2a2d] hover:border-[#353539]'
      }`}
    >
      {/* Header: Author, Badge, Time, Helpful status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs select-none flex-shrink-0 ${
              isAi ? 'bg-[#f4ef5a] text-black font-extrabold' : 'text-black'
            }`}
            style={!isAi ? { backgroundColor: getAvatarColor(solution.a) } : {}}
          >
            {isAi ? '✨' : solution.a?.charAt(0).toUpperCase()}
          </div>
          <span
            onClick={() => !isAi && viewUserProfile(solution.a)}
            className={`text-xs font-semibold truncate ${
              isAi ? 'text-[#f4ef5a]' : 'text-[#f2f2f2] cursor-pointer hover:underline hover:text-[#f4ef5a]'
            }`}
          >
            {solution.a}
          </span>
          {getTypeBadge()}
          <span className="text-[11px] text-[#8c8c93] whitespace-nowrap">
            {formatTimeAgo(solution.t)}
          </span>
        </div>

        {solution.help && (
          <span className="text-[11px] font-bold text-[#3ddc84] flex items-center gap-1 flex-shrink-0 bg-[#12351f] px-2 py-0.5 rounded-full">
            ✔ HELPFUL SOLUTION
          </span>
        )}
      </div>

      {/* Explanation text (if provided) */}
      {(solution.explanation || (solution.type === 'text' && solution.txt)) && (
        <p className="text-xs md:text-sm text-[#d0d0d5] leading-relaxed whitespace-pre-wrap">
          {solution.explanation || solution.txt}
        </p>
      )}

      {/* 💻 CODE SNIPPET DISPLAY */}
      {solution.type === 'code' && solution.code && (
        <div className="bg-[#0e0e10] border border-[#2a2a2d] rounded-xl overflow-hidden font-mono text-xs">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#131314] border-b border-[#2a2a2d] text-[11px]">
            <span className="text-[#38bdf8] font-bold uppercase">{solution.language || 'code'}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="text-[#8c8c93] hover:text-white px-2 py-0.5 rounded hover:bg-[#1b1b1d] transition-colors"
              >
                {copied ? '✔ Copied' : '📋 Copy'}
              </button>
              {(solution.language === 'html' || solution.language === 'javascript') && (
                <button
                  onClick={() =>
                    onPreviewRequest?.({
                      title: `Live Code Preview (${solution.language})`,
                      srcDoc:
                        solution.language === 'html'
                          ? solution.code
                          : `<!DOCTYPE html><html><body><script>${solution.code}<\/script><h3>JavaScript solution executed in sandbox.</h3></body></html>`,
                    })
                  }
                  className="text-black bg-[#f4ef5a] hover:bg-[#e6e14e] font-semibold px-2 py-0.5 rounded transition-colors flex items-center gap-1"
                >
                  <span>▶</span>
                  <span>Run / Preview</span>
                </button>
              )}
            </div>
          </div>
          <pre className="p-3 text-[#e2e8f0] overflow-x-auto whitespace-pre leading-5">
            <code>{solution.code}</code>
          </pre>
        </div>
      )}

      {/* 📦 PROJECT FILE DISPLAY */}
      {solution.type === 'project' && (
        <div className="bg-[#131314] border border-[#2a2a2d] rounded-xl p-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl">📦</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#f2f2f2] truncate">
                {solution.fileName || 'project-files.zip'}
              </p>
              <p className="text-[10px] text-[#8c8c93]">
                {solution.fileSize ? (solution.fileSize / (1024 * 1024)).toFixed(2) + ' MB' : 'Archive'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Run / Live preview if static website extracted */}
            {solution.extractedHtml && (
              <button
                onClick={() =>
                  onPreviewRequest?.({
                    title: `Live Preview: ${solution.fileName}`,
                    srcDoc: solution.extractedHtml,
                  })
                }
                className="bg-[#f4ef5a] hover:bg-[#e6e14e] text-black font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>▶</span>
                <span>Run / Live Preview</span>
              </button>
            )}

            {/* Download Button */}
            <button
              onClick={handleDownloadFile}
              className="bg-[#2a2a2d] hover:bg-[#38383c] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <span>📥</span>
              <span>Download</span>
            </button>
          </div>
        </div>
      )}

      {/* 🌐 WEBSITE LINK DISPLAY */}
      {solution.type === 'website' && (
        <div className="bg-[#131314] border border-[#2a2a2d] rounded-xl p-3 space-y-2">
          {solution.websiteUrl && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base">🌐</span>
                <div className="min-w-0">
                  <span className="text-[10px] text-[#8c8c93] block">Deployed Website:</span>
                  <a
                    href={solution.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#f4ef5a] hover:underline truncate block"
                  >
                    {solution.websiteUrl}
                  </a>
                </div>
              </div>

              <button
                onClick={() =>
                  onPreviewRequest?.({
                    title: solution.websiteUrl,
                    url: solution.websiteUrl,
                  })
                }
                className="bg-[#f4ef5a] hover:bg-[#e6e14e] text-black font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 flex-shrink-0"
              >
                <span>🌐</span>
                <span>Live Preview</span>
              </button>
            </div>
          )}

          {solution.repoUrl && (
            <div className="flex items-center gap-2 pt-1 border-t border-[#2a2a2d]/50 text-xs">
              <span className="text-[#8c8c93]">GitHub Repo:</span>
              <a
                href={solution.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#38bdf8] hover:underline truncate"
              >
                {solution.repoUrl}
              </a>
            </div>
          )}
        </div>
      )}

      {/* AI REVIEW DISPLAY BLOCK */}
      {aiReview && (
        <div className="bg-[#131314] border border-[#f4ef5a]/30 rounded-xl p-3 text-xs text-[#d0d0d5] space-y-1.5 animate-fade-in">
          <div className="flex items-center gap-1.5 text-[#f4ef5a] font-semibold text-xs">
            <span>🤖</span>
            <span>SolveBot Code Review:</span>
          </div>
          <div className="whitespace-pre-wrap leading-relaxed">{aiReview}</div>
        </div>
      )}

      {/* Card Action Row: Upvote, Review with SolveBot, Mark helpful, Report */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#2a2a2d]/60 text-xs text-[#8c8c93]">
        {/* Solution Upvote */}
        <button
          onClick={handleVote}
          className={`flex items-center gap-1 font-medium transition-colors ${
            hasVoted ? 'text-[#3ddc84] font-semibold' : 'hover:text-white'
          }`}
          title="Helpful vote"
        >
          <span>⬆</span>
          <span>{formatCount(upvotes)}</span>
        </button>

        {/* Review with SolveBot Button (for Code and Project solutions) */}
        {(solution.type === 'code' || solution.type === 'project') && (
          <button
            onClick={handleReviewWithSolveBot}
            disabled={reviewing}
            className="flex items-center gap-1 text-[#f4ef5a] hover:underline transition-colors disabled:opacity-50"
            title="Get AI analysis on security, bugs, and improvements"
          >
            <span>🤖</span>
            <span>{reviewing ? 'Analyzing...' : 'Review with SolveBot'}</span>
          </button>
        )}

        {/* Mark as helpful (Problem author action) */}
        {isPostAuthor && (
          <button
            onClick={() => onToggleHelpful?.(solution.id)}
            className={`flex items-center gap-1 font-medium transition-colors ${
              solution.help
                ? 'text-[#8c8c93] hover:text-[#ff5252]'
                : 'text-[#3ddc84] hover:underline'
            }`}
          >
            <span>✔</span>
            <span>{solution.help ? 'Unmark helpful' : 'Mark helpful'}</span>
          </button>
        )}

        {/* Report Button */}
        <button
          onClick={handleReport}
          className="ml-auto text-[#8c8c93] hover:text-[#ff5252] transition-colors"
          title="Report spam or broken code"
        >
          🛡️ Report
        </button>
      </div>
    </div>
  );
}
