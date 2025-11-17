import React, { useState } from 'react';

export default function SubmitIssue() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    // we'll call backend in Part 2; for now show a placeholder
    setTimeout(() => {
      setResult({
        department: 'Municipal Corporation',
        category: 'Pothole',
        urgency: 'Medium',
        draft: 'Please fix the pothole on XYZ road...'
      });
      setLoading(false);
    }, 700);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Submit an issue</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe your civic problem in simple words..."
          rows={6}
          style={{ width: '100%' }}
        />
        <br />
        <button type="submit" disabled={!text || loading} style={{ marginTop: 10 }}>
          {loading ? 'Processing...' : 'Analyze & Triage'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>AI Triage Result (placeholder)</h3>
          <p><strong>Department:</strong> {result.department}</p>
          <p><strong>Category:</strong> {result.category}</p>
          <p><strong>Urgency:</strong> {result.urgency}</p>
          <p><strong>Draft:</strong><br/>{result.draft}</p>
        </div>
      )}
    </div>
  );
}
