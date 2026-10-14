const H = Date.now();

export const INITIAL_COMMUNITIES = [
  { id: 'c1', n: 'Machine Learning', i: '🧠', m: 2800000, j: true, d: 'AI and ML help' },
  { id: 'c2', n: 'Programming', i: '💻', m: 2800000, j: true, d: 'Code & debugging' },
  { id: 'c3', n: 'Webdev', i: '🌐', m: 2800000, j: true, d: 'Web developers' },
  { id: 'c4', n: 'ReactJs', i: '⚛️', m: 2800000, j: true, d: 'React help' },
  { id: 'c5', n: 'Career', i: '💼', m: 1200000, j: false, d: 'Jobs & interviews' },
  { id: 'c6', n: 'Cyber Security', i: '🛡️', m: 890000, j: false, d: 'InfoSec professionals' },
  { id: 'c7', n: 'Startups', i: '🚀', m: 1200000, j: false, d: 'Entrepreneur peeps' },
  { id: 'c8', n: 'Linux Community', i: '🐧', m: 650000, j: false, d: 'Linux specialist' },
];

export const INITIAL_POSTS = [
  {
    id: 'p1',
    a: 'Marie Kirk',
    t: H - 14400000, // 4 hours ago
    c: 'Programming',
    kind: 'Problem',
    title: 'My pandas script is very slow on a 2GB CSV file',
    body: 'Reading the file takes forever and my laptop freezes. Is there a faster way to load and process large CSV files in Python?',
    tags: ['Python', 'Data', 'Productivity'],
    up: 3600,
    dn: 210,
    views: 3600,
    votes: {},
    saves: [],
    img: null,
    cm: [
      {
        id: 'cm1',
        a: 'Nam Soo-hee',
        t: H - 10000000,
        type: 'code',
        language: 'python',
        code: `import polars as pl\n\n# 10x faster than pandas read_csv\ndf = pl.scan_csv("data.csv")\nresult = df.filter(pl.col("status") == "active").collect()\nprint(result.head())`,
        explanation: 'Switching from Pandas to Polars with lazy scanning (scan_csv) drops memory footprint and loads 2GB files in under 3 seconds.',
        txt: 'Use Polars lazy scan to process large CSV in streaming chunks without memory freeze.',
        help: true,
        ai: false,
        upvotes: 42,
      },
      {
        id: 'cm2',
        a: 'Alex Chen',
        t: H - 8000000,
        type: 'text',
        txt: 'Alternatively, use chunksize=50000 in pandas read_csv and process in streaming batches to avoid RAM exhaustion.',
        help: false,
        ai: false,
        upvotes: 15,
      },
    ],
  },
  {
    id: 'p2',
    a: 'Nam Soo-hee',
    t: H - 14400000, // 4 hours ago
    c: 'Career',
    kind: 'Discussion',
    title: 'How do you prepare for your first AI/ML interview?',
    body: "I know the basics but freeze when explaining my projects. What's your best method: mock interviews, writing, or something else? #Career #Interview",
    tags: ['Career', 'Interview', 'Daily'],
    up: 1200,
    dn: 510,
    views: 1600,
    votes: {},
    saves: [],
    img: null,
    cm: [
      {
        id: 'cm3',
        a: 'Eugene Barkley',
        t: H - 7200000,
        type: 'website',
        websiteUrl: 'https://react.dev',
        repoUrl: 'https://github.com/facebook/react',
        explanation: 'I built this interactive technical interview flashcard simulator on Vercel to practice explaining machine learning architectures under timed conditions.',
        txt: 'Interactive mock interview simulator web app',
        help: true,
        ai: false,
        upvotes: 38,
      },
    ],
  },
  {
    id: 'p3',
    a: 'Eugene Barkley',
    t: H - 28800000, // 8 hours ago
    c: 'Machine Learning',
    kind: 'Problem',
    title: 'Model overfits after 10 epochs – how to fix?',
    body: 'Training accuracy is 99% but validation stuck at 71%. I already tried dropout. What else should I try?',
    tags: ['ML', 'Overfitting'],
    up: 850,
    dn: 40,
    views: 2100,
    votes: {},
    saves: [],
    img: null,
    cm: [
      {
        id: 'cm4',
        a: 'Marie Kirk',
        t: H - 5400000,
        type: 'project',
        fileName: 'regularization_benchmark.zip',
        fileSize: 2450000,
        fileUrl: '#',
        extractedHtml: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { background: #0a0a0b; color: #f2f2f2; font-family: system-ui, sans-serif; padding: 24px; text-align: center; }
    .card { background: #131314; border: 1px solid #2a2a2d; border-radius: 16px; padding: 20px; max-width: 420px; margin: 0 auto; }
    h2 { color: #f4ef5a; margin-top: 0; }
    .bar { background: #1b1b1d; height: 12px; border-radius: 6px; overflow: hidden; margin: 12px 0; }
    .fill { background: #3ddc84; height: 100%; width: 88%; }
    button { background: #f4ef5a; color: #000; font-weight: bold; border: none; padding: 10px 18px; border-radius: 20px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="card">
    <h2>🧪 Regularization Benchmark</h2>
    <p style="font-size: 13px; color: #8c8c93;">Live simulation of Early Stopping + Weight Decay on ResNet</p>
    <div style="display:flex; justify-content:space-between; font-size:12px;"><span>Val Accuracy</span><span>88.4%</span></div>
    <div class="bar"><div class="fill"></div></div>
    <button onclick="alert('Validation Loss dropped from 0.82 -> 0.31 with EarlyStopping(patience=3)')">Simulate Epoch 11</button>
  </div>
</body>
</html>`,
        explanation: 'Here is an open-source benchmark suite with early-stopping and weight decay configurations that solved my validation plateau.',
        txt: 'Project archive containing benchmark notebooks and live test visualizer.',
        help: false,
        ai: false,
        upvotes: 19,
      },
    ],
  },
];
