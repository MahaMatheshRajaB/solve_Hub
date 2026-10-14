import { useState, useRef, useEffect } from 'react';
import { useSolveHubStore } from '../../store/solveHubStore';
import { aiChat } from '../../lib/gemini';

export default function SolveAiChat() {
  const { isAiChatOpen, toggleAiChat } = useSolveHubStore();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Solve AI. Ask me anything or tap ✨ on a post to get a step-by-step solution.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isAiChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiChatOpen]);

  if (!isAiChatOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    const userMessage = { role: 'user', content: query };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await aiChat(updatedMessages);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.reply || 'No response generated.' },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Network error connecting to Gemini API. Ensure server is running on port 3001.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="chat"
      className="fixed right-4 md:right-6 top-[68px] w-[350px] max-w-[calc(100vw-32px)] h-[480px] bg-[#131314] border border-[#2a2a2d] rounded-[14px] shadow-2xl flex flex-col z-50 animate-slide-up overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2d] bg-[#131314]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#f4ef5a] text-black font-bold text-xs flex items-center justify-center">
            ✨
          </div>
          <span className="font-semibold text-sm text-[#f2f2f2]">Solve AI</span>
          <span className="text-[10px] bg-[#1b1b1d] text-[#8c8c93] px-2 py-0.5 rounded-full border border-[#2a2a2d]">
            gemini-2.0-flash
          </span>
        </div>
        <button
          onClick={() => toggleAiChat(false)}
          className="text-[#8c8c93] hover:text-white p-1 text-sm rounded transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              className={`p-2.5 rounded-[12px] text-xs md:text-sm leading-relaxed max-w-[88%] whitespace-pre-wrap ${
                isUser
                  ? 'bg-[#f4ef5a] text-black ml-auto font-medium rounded-tr-xs'
                  : 'bg-[#1b1b1d] text-[#f2f2f2] mr-auto border border-[#2a2a2d] rounded-tl-xs'
              }`}
            >
              {m.content}
            </div>
          );
        })}
        {loading && (
          <div className="bg-[#1b1b1d] text-[#8c8c93] border border-[#2a2a2d] p-2.5 rounded-[12px] text-xs max-w-[80px] flex items-center justify-center gap-1 animate-pulse">
            <span>●</span>
            <span>●</span>
            <span>●</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-[#2a2a2d] bg-[#131314]">
        <input
          id="ci"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Solve AI..."
          className="flex-1 bg-[#1b1b1d] border border-[#2a2a2d] rounded-xl px-3 py-2 text-xs text-[#f2f2f2] placeholder-[#8c8c93] outline-none focus:border-[#f4ef5a]"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-white hover:bg-gray-100 text-black text-xs font-semibold px-3 py-2 rounded-xl transition-all disabled:opacity-40"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
