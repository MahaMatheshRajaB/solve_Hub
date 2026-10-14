import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { INITIAL_COMMUNITIES, INITIAL_POSTS } from '../data/seedData';
import { aiSolve } from '../lib/gemini';

export const useSolveHubStore = create(
  persist(
    (set, get) => ({
      currentUser: {
        name: 'Eugene Barkley',
        handle: '@eugenebarkley',
        email: 'eugene@example.com',
      },
      communities: INITIAL_COMMUNITIES,
      posts: INITIAL_POSTS,
      activeView: 'home', // 'home' | 'comms' | 'explore' | 'trending' | 'saved' | 'profile'
      selectedCommunity: null,
      searchQuery: '',
      isAiChatOpen: false,
      viewingUser: null,

      setCurrentUser: (user) => set({ currentUser: user }),
      setActiveView: (view) => set({ activeView: view, selectedCommunity: null }),
      setSelectedCommunity: (comm) => set({ selectedCommunity: comm, activeView: 'home' }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      toggleAiChat: (open) => set((s) => ({ isAiChatOpen: typeof open === 'boolean' ? open : !s.isAiChatOpen })),
      viewUserProfile: (userName) => set({ activeView: 'profile', viewingUser: userName || get().currentUser.name }),

      joinCommunity: (name) =>
        set((state) => ({
          communities: state.communities.map((c) =>
            c.n === name ? { ...c, j: !c.j, m: c.j ? c.m - 1 : c.m + 1 } : c
          ),
        })),

      createCommunity: ({ name, icon, desc }) =>
        set((state) => ({
          communities: [
            ...state.communities,
            {
              id: 'c_' + Date.now(),
              n: name,
              i: icon || '✨',
              m: 1,
              j: true,
              d: desc || `Community created by ${state.currentUser.name}`,
            },
          ],
        })),

      addPost: ({ title, body, community, tags = [], img = null, kind = 'Problem' }) => {
        const { currentUser } = get();
        const extractedTags = [
          ...new Set([
            ...tags,
            ...(title + ' ' + body).match(/#\w+/g)?.map((t) => t.slice(1)) || [],
          ]),
        ];

        const newPost = {
          id: 'p_' + Date.now(),
          a: currentUser.name,
          t: Date.now(),
          c: community || 'Programming',
          kind: kind || 'Problem',
          title,
          body,
          tags: extractedTags,
          up: 0,
          dn: 0,
          views: 1,
          votes: {},
          saves: [],
          img,
          cm: [],
        };

        set((state) => ({ posts: [newPost, ...state.posts] }));
        return newPost;
      },

      deletePost: (id) =>
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== id),
        })),

      votePost: (id, direction) => {
        const { currentUser } = get();
        const u = currentUser.name;

        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id !== id) return p;
            const currentVote = p.votes?.[u] || 0;
            let up = p.up;
            let dn = p.dn;
            const newVotes = { ...p.votes };

            if (currentVote === 1) up--;
            if (currentVote === -1) dn--;

            if (currentVote === direction) {
              delete newVotes[u];
            } else {
              newVotes[u] = direction;
              if (direction === 1) up++;
              if (direction === -1) dn++;
            }

            return { ...p, up: Math.max(0, up), dn: Math.max(0, dn), votes: newVotes };
          }),
        }));
      },

      toggleSavePost: (id) => {
        const { currentUser } = get();
        const u = currentUser.name;

        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id !== id) return p;
            const isSaved = p.saves?.includes(u);
            const saves = isSaved ? p.saves.filter((x) => x !== u) : [...(p.saves || []), u];
            return { ...p, saves };
          }),
        }));
      },

      incrementViews: (id) =>
        set((state) => ({
          posts: state.posts.map((p) => (p.id === id ? { ...p, views: (p.views || 0) + 1 } : p)),
        })),

      addComment: (postId, payload) => {
        const { currentUser } = get();
        const textContent = payload.text || payload.txt || payload.explanation || '';
        const newComment = {
          id: 'cm_' + Date.now(),
          a: payload.author || currentUser.name,
          t: Date.now(),
          type: payload.type || 'text',
          txt: textContent,
          code: payload.code || null,
          language: payload.language || null,
          explanation: payload.explanation || null,
          fileName: payload.fileName || null,
          fileSize: payload.fileSize || null,
          fileUrl: payload.fileUrl || null,
          fileData: payload.fileData || null,
          extractedHtml: payload.extractedHtml || null,
          websiteUrl: payload.websiteUrl || null,
          repoUrl: payload.repoUrl || null,
          help: false,
          ai: !!payload.isAi,
          upvotes: 0,
        };

        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id !== postId) return p;
            return { ...p, cm: [...(p.cm || []), newComment] };
          }),
        }));
        return newComment;
      },

      toggleHelpful: (postId, commentId) =>
        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id !== postId) return p;
            const updatedComments = p.cm.map((c) =>
              c.id === commentId ? { ...c, help: !c.help } : c
            );
            return { ...p, cm: updatedComments };
          }),
        })),

      askAiSolution: async (postId) => {
        const post = get().posts.find((p) => p.id === postId);
        if (!post) return;

        const res = await aiSolve(post.body || post.title, post.c, post.title);
        get().addComment(postId, {
          type: 'text',
          text: res.solution,
          author: 'Solve AI',
          isAi: true,
        });
      },

      resetToSeed: () =>
        set({
          communities: INITIAL_COMMUNITIES,
          posts: INITIAL_POSTS,
        }),
    }),
    {
      name: 'solvehub_storage_v3',
      partialize: (state) => ({
        currentUser: state.currentUser,
        communities: state.communities,
        posts: state.posts,
      }),
    }
  )
);
