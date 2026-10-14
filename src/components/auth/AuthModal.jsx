import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSolveHubStore } from '../../store/solveHubStore';
import toast from 'react-hot-toast';

export default function AuthModal({ isOpen, onClose }) {
  const { user, signIn, signUp, signInWithGoogle, logout } = useAuth();
  const { currentUser, setCurrentUser } = useSolveHubStore();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFirebaseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const cred = await signIn(email, password);
        setCurrentUser({
          name: cred.user.displayName || email.split('@')[0],
          handle: '@' + (cred.user.displayName || email.split('@')[0]).toLowerCase().replace(/\s+/g, ''),
          email: cred.user.email,
        });
        toast.success('Signed in successfully!');
        onClose();
      } else {
        if (!name.trim()) {
          toast.error('Name is required');
          setLoading(false);
          return;
        }
        await signUp(email, password, name);
        setCurrentUser({
          name: name.trim(),
          handle: '@' + name.trim().toLowerCase().replace(/\s+/g, ''),
          email,
        });
        toast.success('Account created! Welcome to SolveHub 🎉');
        onClose();
      }
    } catch (err) {
      toast.error(err.message.replace('Firebase: ', '').trim());
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const cred = await signInWithGoogle();
      setCurrentUser({
        name: cred.user.displayName || 'Google User',
        handle: '@' + (cred.user.displayName || 'user').toLowerCase().replace(/\s+/g, ''),
        email: cred.user.email,
      });
      toast.success('Signed in with Google!');
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickNameSwitch = (quickName) => {
    setCurrentUser({
      name: quickName,
      handle: '@' + quickName.toLowerCase().replace(/\s+/g, ''),
      email: `${quickName.toLowerCase().replace(/\s+/g, '')}@example.com`,
    });
    toast.success(`Switched active profile to ${quickName}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#131314] border border-[#2a2a2d] rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8c8c93] hover:text-white p-1 rounded-lg"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#f4ef5a] text-black font-bold text-base flex items-center justify-center">
            S
          </div>
          <h2 className="text-xl font-bold text-[#f2f2f2]">SolveHub Account</h2>
        </div>

        {/* Current profile info */}
        <div className="bg-[#1b1b1d] border border-[#2a2a2d] rounded-xl p-3 mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#8c8c93]">Active Profile</p>
            <p className="text-sm font-semibold text-[#f2f2f2]">{currentUser.name}</p>
            <p className="text-xs text-[#8c8c93]">{currentUser.handle}</p>
          </div>
          {user && (
            <button
              onClick={() => {
                logout();
                toast('Logged out of Firebase');
              }}
              className="text-xs bg-[#2a2a2d] hover:bg-red-900/40 text-red-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              Log out
            </button>
          )}
        </div>

        {/* Quick Demo Switcher */}
        <div className="mb-5">
          <p className="text-xs text-[#8c8c93] mb-2 font-medium">Quick Persona Switch</p>
          <div className="flex flex-wrap gap-2">
            {['Eugene Barkley', 'Marie Kirk', 'Nam Soo-hee'].map((person) => (
              <button
                key={person}
                onClick={() => handleQuickNameSwitch(person)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  currentUser.name === person
                    ? 'bg-[#f4ef5a] text-black font-semibold border-[#f4ef5a]'
                    : 'bg-[#1b1b1d] text-[#d1d5db] border-[#2a2a2d] hover:border-gray-500'
                }`}
              >
                {person}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-[#2a2a2d] pt-4">
          <h3 className="text-sm font-semibold text-[#f2f2f2] mb-3">
            {mode === 'login' ? 'Sign in with Firebase' : 'Create a Firebase Account'}
          </h3>

          <form onSubmit={handleFirebaseSubmit} className="space-y-3">
            {mode === 'signup' && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1b1b1d] border border-[#2a2a2d] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#8c8c93] outline-none focus:border-[#f4ef5a]"
              />
            )}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1b1b1d] border border-[#2a2a2d] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#8c8c93] outline-none focus:border-[#f4ef5a]"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1b1b1d] border border-[#2a2a2d] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#8c8c93] outline-none focus:border-[#f4ef5a]"
              required
              minLength={6}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f4ef5a] hover:bg-[#e6e14e] text-black font-semibold py-2.5 rounded-xl transition-all text-sm disabled:opacity-50"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full mt-2.5 bg-[#1b1b1d] hover:bg-[#252528] border border-[#2a2a2d] text-[#f2f2f2] font-medium py-2 rounded-xl transition-all text-xs flex items-center justify-center gap-2"
          >
            <span>🌐</span>
            <span>Sign in with Google</span>
          </button>

          <div className="text-center mt-3 text-xs text-[#8c8c93]">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-[#f4ef5a] hover:underline font-medium"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
