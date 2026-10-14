import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';
import { useSolveHubStore } from '../../store/solveHubStore';
import { formatCount } from '../../utils/formatters';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'html', label: 'HTML/CSS' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
  { id: 'sql', label: 'SQL' },
  { id: 'other', label: 'Other' },
];

const ALLOWED_EXTENSIONS = ['.zip', '.html', '.css', '.js', '.py', '.ipynb', '.txt', '.md', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];

export default function SolutionReplyForm({ postId, postTitle, onPreviewRequest }) {
  const { currentUser, addComment } = useSolveHubStore();
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'code' | 'project' | 'website'

  // Text state
  const [textAnswer, setTextAnswer] = useState('');

  // Code state
  const [codeSnippet, setCodeSnippet] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [codeExplanation, setCodeExplanation] = useState('');

  // Project upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileDataUrl, setFileDataUrl] = useState(null);
  const [extractedHtml, setExtractedHtml] = useState(null);
  const [projectExplanation, setProjectExplanation] = useState('');

  // Website state
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [websiteExplanation, setWebsiteExplanation] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // File Dropzone logic
  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('File exceeds 10MB limit or has an invalid type.');
      return;
    }
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10 MB maximum limit.');
      return;
    }

    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error(`Disallowed file type (${ext}). Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return;
    }

    setUploadedFile(file);

    // Read file as Data URL for downloading
    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // If zip, attempt to find index.html for live sandboxed preview
    if (ext === '.zip') {
      try {
        const zip = new JSZip();
        const loadedZip = await zip.loadAsync(file);
        let foundIndex = null;
        loadedZip.forEach((relativePath, zipEntry) => {
          if (relativePath.toLowerCase().endsWith('index.html')) {
            foundIndex = zipEntry;
          }
        });
        if (foundIndex) {
          const content = await foundIndex.async('text');
          setExtractedHtml(content);
          toast.success('Found index.html in zip! Live preview available.');
        }
      } catch (err) {
        console.warn('Zip inspection error:', err);
      }
    } else if (ext === '.html') {
      const textReader = new FileReader();
      textReader.onload = () => setExtractedHtml(textReader.result);
      textReader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const getLineNumbers = (code) => {
    const lines = (code || '').split('\n').length;
    return Array.from({ length: Math.max(lines, 4) }, (_, i) => i + 1).join('\n');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (activeTab === 'text') {
        if (!textAnswer.trim()) {
          toast.error('Please write your solution answer');
          setSubmitting(false);
          return;
        }
        addComment(postId, {
          type: 'text',
          txt: textAnswer.trim(),
          author: currentUser.name,
        });
        setTextAnswer('');
      } else if (activeTab === 'code') {
        if (!codeSnippet.trim()) {
          toast.error('Please provide code snippet');
          setSubmitting(false);
          return;
        }
        addComment(postId, {
          type: 'code',
          code: codeSnippet.trim(),
          language: selectedLanguage,
          explanation: codeExplanation.trim(),
          txt: codeExplanation.trim() || `Code solution in ${selectedLanguage}`,
          author: currentUser.name,
        });
        setCodeSnippet('');
        setCodeExplanation('');
      } else if (activeTab === 'project') {
        if (!uploadedFile) {
          toast.error('Please attach a project file or .zip');
          setSubmitting(false);
          return;
        }
        addComment(postId, {
          type: 'project',
          fileName: uploadedFile.name,
          fileSize: uploadedFile.size,
          fileUrl: fileDataUrl,
          fileData: fileDataUrl,
          extractedHtml: extractedHtml,
          explanation: projectExplanation.trim(),
          txt: projectExplanation.trim() || `Uploaded project: ${uploadedFile.name}`,
          author: currentUser.name,
        });
        setUploadedFile(null);
        setFileDataUrl(null);
        setExtractedHtml(null);
        setProjectExplanation('');
      } else if (activeTab === 'website') {
        if (!websiteUrl.trim() && !repoUrl.trim()) {
          toast.error('Please provide a deployed website URL or GitHub repository URL');
          setSubmitting(false);
          return;
        }
        let cleanUrl = websiteUrl.trim();
        if (cleanUrl && !/^https?:\/\//i.test(cleanUrl)) {
          cleanUrl = 'https://' + cleanUrl;
        }
        let cleanRepo = repoUrl.trim();
        if (cleanRepo && !/^https?:\/\//i.test(cleanRepo)) {
          cleanRepo = 'https://' + cleanRepo;
        }

        addComment(postId, {
          type: 'website',
          websiteUrl: cleanUrl,
          repoUrl: cleanRepo,
          explanation: websiteExplanation.trim(),
          txt: websiteExplanation.trim() || `Deployed website solution: ${cleanUrl || cleanRepo}`,
          author: currentUser.name,
        });
        setWebsiteUrl('');
        setRepoUrl('');
        setWebsiteExplanation('');
      }

      toast.success('Solution submitted successfully! 🚀');
    } catch (err) {
      toast.error('Failed to submit solution');
    } finally {
      setSubmitting(false);
    }
  };

  const getFavicon = (url) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  return (
    <div className="bg-[#1b1b1d] border border-[#2a2a2d] rounded-xl p-3.5 mt-3 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2d]">
        <span className="text-xs font-semibold text-[#f2f2f2]">Submit a Solution</span>

        {/* 4 Solution Type Tabs */}
        <div className="flex bg-[#131314] border border-[#2a2a2d] rounded-lg p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
              activeTab === 'text'
                ? 'bg-[#f4ef5a] text-black font-semibold'
                : 'text-[#8c8c93] hover:text-white'
            }`}
          >
            <span>📝</span>
            <span className="hidden sm:inline">Text</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
              activeTab === 'code'
                ? 'bg-[#f4ef5a] text-black font-semibold'
                : 'text-[#8c8c93] hover:text-white'
            }`}
          >
            <span>💻</span>
            <span className="hidden sm:inline">Code</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('project')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
              activeTab === 'project'
                ? 'bg-[#f4ef5a] text-black font-semibold'
                : 'text-[#8c8c93] hover:text-white'
            }`}
          >
            <span>📦</span>
            <span className="hidden sm:inline">Project</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('website')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
              activeTab === 'website'
                ? 'bg-[#f4ef5a] text-black font-semibold'
                : 'text-[#8c8c93] hover:text-white'
            }`}
          >
            <span>🌐</span>
            <span className="hidden sm:inline">Website</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* TAB 1: TEXT ANSWER */}
        {activeTab === 'text' && (
          <div className="space-y-2">
            <textarea
              rows={3}
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Write your detailed explanation or answer..."
              className="w-full bg-[#131314] border border-[#2a2a2d] rounded-xl p-3 text-xs md:text-sm text-[#f2f2f2] placeholder-[#8c8c93] outline-none focus:border-[#f4ef5a] resize-none"
            />
          </div>
        )}

        {/* TAB 2: CODE SNIPPET */}
        {activeTab === 'code' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-[#8c8c93] font-medium">Select Language:</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-[#131314] border border-[#2a2a2d] text-xs text-[#f2f2f2] rounded-lg px-2.5 py-1 outline-none focus:border-[#f4ef5a]"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Code Editor Box with Line Numbers */}
            <div className="bg-[#0e0e10] border border-[#2a2a2d] rounded-xl flex overflow-hidden font-mono text-xs shadow-inner">
              <div className="bg-[#131314] text-[#5c5c63] py-2.5 px-2 select-none text-right border-r border-[#2a2a2d] leading-5 whitespace-pre">
                {getLineNumbers(codeSnippet)}
              </div>
              <textarea
                rows={6}
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                placeholder={`// Paste your ${selectedLanguage} solution here...`}
                className="flex-1 bg-transparent text-[#38bdf8] p-2.5 leading-5 outline-none resize-none overflow-x-auto whitespace-pre font-mono"
              />
            </div>

            {/* Live Preview Button for HTML/CSS/JS */}
            {(selectedLanguage === 'html' || selectedLanguage === 'javascript') && codeSnippet.trim() && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    onPreviewRequest?.({
                      title: `Code Preview (${selectedLanguage})`,
                      srcDoc: selectedLanguage === 'html'
                        ? codeSnippet
                        : `<!DOCTYPE html><html><body><script>${codeSnippet}<\/script><h3>JavaScript executed successfully. Check console or DOM output.</h3></body></html>`,
                    })
                  }
                  className="text-xs text-black bg-[#f4ef5a] hover:bg-[#e6e14e] font-semibold px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <span>▶</span>
                  <span>Test Run in Sandbox</span>
                </button>
              </div>
            )}

            {/* Explanation field */}
            <input
              type="text"
              value={codeExplanation}
              onChange={(e) => setCodeExplanation(e.target.value)}
              placeholder="Short explanation of how this code solves the problem..."
              className="w-full bg-[#131314] border border-[#2a2a2d] rounded-xl px-3 py-2 text-xs text-[#f2f2f2] placeholder-[#8c8c93] outline-none focus:border-[#f4ef5a]"
            />
          </div>
        )}

        {/* TAB 3: UPLOAD PROJECT */}
        {activeTab === 'project' && (
          <div className="space-y-2.5">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-[#f4ef5a] bg-[#f4ef5a]/10'
                  : uploadedFile
                  ? 'border-[#3ddc84] bg-[#12351f]/20'
                  : 'border-[#2a2a2d] hover:border-gray-500 bg-[#131314]'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-2xl mb-1">📦</div>
              {uploadedFile ? (
                <div>
                  <p className="text-xs font-semibold text-[#3ddc84] truncate">{uploadedFile.name}</p>
                  <p className="text-[11px] text-[#8c8c93]">
                    {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to submit
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-medium text-[#f2f2f2]">
                    Drag & drop .zip or project files here, or click to browse
                  </p>
                  <p className="text-[11px] text-[#8c8c93] mt-1">
                    Max 10 MB. Allowed: .zip, .html, .css, .js, .py, .ipynb, .txt, .md, images
                  </p>
                </div>
              )}
            </div>

            {/* Test Run button if zip contains index.html */}
            {extractedHtml && (
              <div className="flex items-center justify-between bg-[#131314] border border-[#2a2a2d] p-2.5 rounded-xl text-xs">
                <span className="text-[#3ddc84] font-medium flex items-center gap-1.5">
                  <span>✔</span>
                  <span>Static website detected in project</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onPreviewRequest?.({
                      title: `Live Preview: ${uploadedFile?.name}`,
                      srcDoc: extractedHtml,
                    })
                  }
                  className="bg-[#f4ef5a] hover:bg-[#e6e14e] text-black font-semibold px-3 py-1 rounded-lg text-xs transition-colors flex items-center gap-1"
                >
                  <span>▶</span>
                  <span>Live Preview</span>
                </button>
              </div>
            )}

            <input
              type="text"
              value={projectExplanation}
              onChange={(e) => setProjectExplanation(e.target.value)}
              placeholder="What does this project do and how does it fix the issue?"
              className="w-full bg-[#131314] border border-[#2a2a2d] rounded-xl px-3 py-2 text-xs text-[#f2f2f2] placeholder-[#8c8c93] outline-none focus:border-[#f4ef5a]"
            />
          </div>
        )}

        {/* TAB 4: WEBSITE LINK */}
        {activeTab === 'website' && (
          <div className="space-y-2.5">
            <div>
              <label className="block text-xs text-[#8c8c93] mb-1">
                Deployed Website URL (Vercel, Netlify, GitHub Pages, etc.):
              </label>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://my-solution.vercel.app"
                className="w-full bg-[#131314] border border-[#2a2a2d] rounded-xl px-3 py-2 text-xs text-[#f2f2f2] placeholder-[#8c8c93] outline-none focus:border-[#f4ef5a]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#8c8c93] mb-1">GitHub Repository Link (optional):</label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/project"
                className="w-full bg-[#131314] border border-[#2a2a2d] rounded-xl px-3 py-2 text-xs text-[#f2f2f2] placeholder-[#8c8c93] outline-none focus:border-[#f4ef5a]"
              />
            </div>

            {/* Live Website Preview Card */}
            {websiteUrl.trim() && (
              <div className="bg-[#131314] border border-[#2a2a2d] rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {getFavicon(websiteUrl) && (
                    <img
                      src={getFavicon(websiteUrl)}
                      alt="favicon"
                      className="w-4 h-4 rounded flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#f2f2f2] truncate">{websiteUrl}</p>
                    <p className="text-[10px] text-[#8c8c93]">Ready to preview in sandboxed iframe</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onPreviewRequest?.({
                      title: websiteUrl,
                      url: websiteUrl,
                    })
                  }
                  className="bg-[#f4ef5a] hover:bg-[#e6e14e] text-black font-semibold text-xs px-3 py-1 rounded-lg transition-colors flex items-center gap-1 flex-shrink-0"
                >
                  <span>🌐</span>
                  <span>Live Preview</span>
                </button>
              </div>
            )}

            <input
              type="text"
              value={websiteExplanation}
              onChange={(e) => setWebsiteExplanation(e.target.value)}
              placeholder="Notes on testing or interacting with the deployed demo..."
              className="w-full bg-[#131314] border border-[#2a2a2d] rounded-xl px-3 py-2 text-xs text-[#f2f2f2] placeholder-[#8c8c93] outline-none focus:border-[#f4ef5a]"
            />
          </div>
        )}

        {/* Submit Button Row */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-[#8c8c93]">
            Replying as <strong className="text-white">{currentUser.name}</strong>
          </span>
          <button
            type="submit"
            disabled={submitting}
            className="bg-white hover:bg-gray-100 text-black text-xs font-semibold px-4 py-1.5 rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Post Solution'}
          </button>
        </div>
      </form>
    </div>
  );
}
