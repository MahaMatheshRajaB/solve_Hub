import { useState } from 'react';

export default function LivePreviewModal({ isOpen, onClose, title, type, srcDoc, url }) {
  const [viewMode, setViewMode] = useState('desktop'); // 'desktop' | 'mobile'
  const [iframeKey, setIframeKey] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 animate-fade-in">
      <div className="bg-[#131314] border border-[#2a2a2d] rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2d] bg-[#0a0a0b]">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-base">🌐</span>
            <span className="font-semibold text-sm text-[#f2f2f2] truncate max-w-xs md:max-w-md">
              {title || 'Live Preview'}
            </span>
            <span className="text-[11px] bg-[#1b1b1d] border border-[#2a2a2d] text-[#8c8c93] px-2 py-0.5 rounded-full font-mono">
              sandboxed
            </span>
          </div>

          {/* Desktop / Mobile toggles & Actions */}
          <div className="flex items-center gap-2">
            <div className="flex bg-[#1b1b1d] border border-[#2a2a2d] rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setViewMode('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                  viewMode === 'desktop'
                    ? 'bg-[#f4ef5a] text-black font-semibold'
                    : 'text-[#8c8c93] hover:text-white'
                }`}
              >
                <span>🖥️</span>
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                  viewMode === 'mobile'
                    ? 'bg-[#f4ef5a] text-black font-semibold'
                    : 'text-[#8c8c93] hover:text-white'
                }`}
              >
                <span>📱</span>
                <span className="hidden sm:inline">Mobile (375px)</span>
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={() => setIframeKey((k) => k + 1)}
              className="p-1.5 text-[#8c8c93] hover:text-white rounded-lg hover:bg-[#1b1b1d] transition-colors"
              title="Rerun preview"
            >
              🔄
            </button>

            {/* External link if url is provided */}
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-[#1b1b1d] hover:bg-[#252528] border border-[#2a2a2d] text-[#f2f2f2] px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                title="Open in new tab"
              >
                <span>↗</span>
                <span className="hidden md:inline">Open in tab</span>
              </a>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 text-[#8c8c93] hover:text-white rounded-lg hover:bg-[#1b1b1d] transition-colors ml-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Notice for external URLs that might block iframes */}
        {url && (
          <div className="bg-[#1b1b1d] text-[#8c8c93] text-xs px-4 py-1.5 border-b border-[#2a2a2d] flex items-center justify-between">
            <span>
              Previewing: <span className="text-[#f4ef5a] font-mono">{url}</span>
            </span>
            <span className="text-[11px] text-[#8c8c93]">
              If page is blocked by origin CSP/headers, use "Open in tab"
            </span>
          </div>
        )}

        {/* Preview Frame Area */}
        <div className="flex-1 bg-[#050505] p-3 flex items-center justify-center overflow-auto">
          <div
            className={`transition-all duration-200 bg-white shadow-2xl flex flex-col ${
              viewMode === 'desktop'
                ? 'w-full h-full rounded-xl overflow-hidden'
                : 'w-[375px] h-[667px] rounded-[36px] border-[6px] border-[#2a2a2d] overflow-hidden'
            }`}
          >
            {srcDoc ? (
              <iframe
                key={iframeKey}
                title="Live Sandboxed Preview"
                srcDoc={srcDoc}
                sandbox="allow-scripts"
                className="w-full h-full border-none bg-white"
              />
            ) : url ? (
              <iframe
                key={iframeKey}
                title="Live Sandboxed Website Preview"
                src={url}
                sandbox="allow-scripts allow-forms allow-same-origin"
                className="w-full h-full border-none bg-white"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                No preview content available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
