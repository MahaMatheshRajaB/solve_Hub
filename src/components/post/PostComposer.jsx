import { useState, useRef } from 'react';
import { useSolveHubStore } from '../../store/solveHubStore';
import { getAvatarColor } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function PostComposer() {
  const { currentUser, communities, selectedCommunity, addPost } = useSolveHubStore();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [community, setCommunity] = useState(selectedCommunity || communities[0]?.n || 'Programming');
  const [imgPreview, setImgPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImgPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImgPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a title or problem summary');
      return;
    }

    addPost({
      title: title.trim(),
      body: body.trim(),
      community: community || selectedCommunity || 'Programming',
      img: imgPreview,
      kind: 'Problem',
    });

    setTitle('');
    setBody('');
    setImgPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.success('Problem posted to community! 🚀');
  };

  return (
    <div className="bg-[#131314] border border-[#2a2a2d] rounded-xl p-4 mb-4">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          {/* User Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black text-sm select-none flex-shrink-0"
            style={{ backgroundColor: getAvatarColor(currentUser.name) }}
          >
            {currentUser.name.charAt(0).toUpperCase()}
          </div>

          {/* Inputs */}
          <div className="flex-1 min-w-0">
            {/* Title / Main Question Input */}
            <input
              id="pt"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Share Something Today... (your problem)"
              className="w-full bg-transparent text-[#f2f2f2] placeholder-[#8c8c93] text-sm md:text-base font-medium py-1.5 outline-none border-none"
            />

            {/* Description textarea */}
            <textarea
              id="pb"
              rows={2}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe it. Use #tags"
              className="w-full bg-transparent text-[#d0d0d5] placeholder-[#8c8c93] text-xs md:text-sm py-1 outline-none border-none resize-none"
            />

            {/* Image Preview */}
            {imgPreview && (
              <div className="relative mt-2 max-w-sm rounded-xl overflow-hidden border border-[#2a2a2d]">
                <img
                  id="pv"
                  src={imgPreview}
                  alt="Upload preview"
                  className="max-h-48 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1 text-xs"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Chips bar */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2 border-t border-[#2a2a2d]/50">
              {/* Image upload button */}
              <label
                className="bg-[#1b1b1d] hover:bg-[#252528] border border-[#2a2a2d] rounded-md px-2.5 py-1 text-xs text-[#f2f2f2] cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <span>🖼</span>
                <span>Image</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </label>

              {/* Community Selector Chip */}
              <select
                id="pc"
                value={community}
                onChange={(e) => setCommunity(e.target.value)}
                className="bg-[#1b1b1d] border border-[#2a2a2d] rounded-md px-2.5 py-1 text-xs text-[#f2f2f2] outline-none cursor-pointer"
              >
                {communities.map((c) => (
                  <option key={c.id || c.n} value={c.n}>
                    {c.i} {c.n}
                  </option>
                ))}
              </select>

              {/* Submit button */}
              <button
                type="submit"
                id="submit-post-btn"
                className="ml-auto bg-white hover:bg-gray-100 text-black font-semibold rounded-lg px-3 py-1.5 text-xs transition-all flex items-center gap-1 shadow-sm active:scale-95"
              >
                <span>▶</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
