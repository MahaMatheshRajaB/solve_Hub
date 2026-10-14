async function test() {
  try {
    const h = await fetch('http://localhost:3001/health').then((r) => r.json());
    console.log('Health:', h);

    const rev = await fetch('http://localhost:3001/api/ai/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'import polars as pl\npl.scan_csv("data.csv")',
        language: 'python',
        title: 'Slow pandas',
      }),
    }).then((r) => r.json());
    console.log('Review:', rev.review ? 'SUCCESS' : 'FAIL');

    const fix = await fetch('http://localhost:3001/api/ai/fix-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'df.read_csv()',
        language: 'python',
        problem: 'Syntax error',
      }),
    }).then((r) => r.json());
    console.log('Fix:', fix.fixedCode ? 'SUCCESS' : 'FAIL');

    const val = await fetch('http://localhost:3001/api/validate-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'my-project.zip', fileSize: 500000 }),
    }).then((r) => r.json());
    console.log('Validate:', val.valid ? 'SUCCESS' : 'FAIL');
  } catch (err) {
    console.error('Test error:', err);
  }
}

test();
