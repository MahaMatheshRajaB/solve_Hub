import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SEED_COMMUNITIES = [
  { id: 'c_ml', n: 'Machine Learning', i: '🧠', m: 2800000, j: true, d: 'AI and ML help' },
  { id: 'c_prog', n: 'Programming', i: '💻', m: 2800000, j: true, d: 'Code & debugging' },
  { id: 'c_web', n: 'Webdev', i: '🌐', m: 2800000, j: true, d: 'Web developers' },
  { id: 'c_react', n: 'ReactJs', i: '⚛️', m: 2800000, j: true, d: 'React help' },
  { id: 'c_career', n: 'Career', i: '💼', m: 1200000, j: false, d: 'Jobs & interviews' },
  { id: 'c_cyber', n: 'Cyber Security', i: '🛡️', m: 890000, j: false, d: 'InfoSec professionals' },
  { id: 'c_startups', n: 'Startups', i: '🚀', m: 1200000, j: false, d: 'Entrepreneur peeps' },
  { id: 'c_linux', n: 'Linux Community', i: '🐧', m: 650000, j: false, d: 'Linux specialist' },
];

const SEED_POSTS = [
  {
    id: 'p_1',
    authorName: 'Marie Kirk',
    category: 'Programming',
    title: 'My pandas script is very slow on a 2GB CSV file',
    text: 'Reading the file takes forever and my laptop freezes. Is there a faster way to load and process large CSV files in Python?',
    hashtags: ['python', 'data', 'productivity'],
    upvotes: 3600,
    downvotes: 210,
    views: 3600,
    solved: true,
  },
  {
    id: 'p_2',
    authorName: 'Nam Soo-hee',
    category: 'Career',
    title: 'How do you prepare for your first AI/ML interview?',
    text: "I know the basics but freeze when explaining my projects. What's your best method: mock interviews, writing, or something else? #Career #Interview",
    hashtags: ['career', 'interview', 'daily'],
    upvotes: 1200,
    downvotes: 510,
    views: 1600,
    solved: false,
  },
  {
    id: 'p_3',
    authorName: 'Eugene Barkley',
    category: 'Machine Learning',
    title: 'Model overfits after 10 epochs – how to fix?',
    text: 'Training accuracy is 99% but validation stuck at 71%. I already tried dropout. What else should I try?',
    hashtags: ['ml', 'overfitting'],
    upvotes: 850,
    downvotes: 40,
    views: 2100,
    solved: false,
  },
];

async function seed() {
  console.log('Seeding communities to Firestore...');
  for (const c of SEED_COMMUNITIES) {
    await setDoc(doc(db, 'communities', c.id), { ...c, createdAt: serverTimestamp() });
    console.log(`✓ Seeded community: ${c.n}`);
  }

  console.log('Seeding posts to Firestore...');
  for (const p of SEED_POSTS) {
    await setDoc(doc(db, 'posts', p.id), { ...p, createdAt: serverTimestamp() });
    console.log(`✓ Seeded post: ${p.title}`);
  }

  console.log('🎉 Seeding completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
