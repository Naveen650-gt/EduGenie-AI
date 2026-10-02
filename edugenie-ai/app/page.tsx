'use client';

import React, { useState, useEffect } from 'react';

type TaskType = 'qa' | 'explain' | 'quiz' | 'summarize' | 'learn';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

interface QuizData {
  questions: QuizQuestion[];
}

const TASK_CONFIGS: Record<TaskType, {
  name: string;
  icon: string;
  label: string;
  placeholder: string;
  subtitle: string;
  presets: string[];
}> = {
  qa: {
    name: 'Smart Q&A',
    icon: '❓',
    label: 'Student Question',
    placeholder: 'e.g., Why is DNA double-stranded? What is the Doppler Effect?',
    subtitle: 'AI answer with explanations and key insights',
    presets: [
      'What is quantum entanglement and how does it work?',
      'How does Newton’s Third Law apply to rocket propulsion?',
      'What is the difference between mitosis and meiosis?'
    ]
  },
  explain: {
    name: 'Explain Topic',
    icon: '💡',
    label: 'Concept to Explain',
    placeholder: 'e.g., Transformer Neural Networks, Microservices, Game Theory...',
    subtitle: 'Structured beginner-friendly breakdown with examples',
    presets: [
      'Generative AI & Transformer Models',
      'Blockchain Consensus Mechanisms',
      'Theory of Relativity in Simple Terms'
    ]
  },
  quiz: {
    name: 'Quiz Master',
    icon: '🎯',
    label: 'Passage or Topic for Quiz',
    placeholder: 'Paste notes or type a subject to generate practice questions...',
    subtitle: 'Interactive self-assessment multiple-choice quiz',
    presets: [
      'The water cycle includes evaporation, condensation, precipitation, and collection.',
      'Mitochondria produce ATP through cellular respiration using glucose and oxygen.'
    ]
  },
  summarize: {
    name: 'Summarize',
    icon: '📝',
    label: 'Text to Summarize',
    placeholder: 'Paste long lecture notes or research text for key revision points...',
    subtitle: 'High-yield study summary & key takeaways',
    presets: [
      'Photosynthesis is the biochemical process by which green plants transform light energy into chemical energy.',
      'Machine learning is a branch of artificial intelligence and computer science focused on learning from data.'
    ]
  },
  learn: {
    name: 'Roadmap',
    icon: '🗺️',
    label: 'Skill or Topic for Roadmap',
    placeholder: 'e.g., Python for Data Science, Full-Stack Web Development...',
    subtitle: 'Phased study roadmap with projects and milestones',
    presets: [
      'Full-Stack Web Development with React & FastAPI',
      'Deep Learning & Natural Language Processing',
      'Cybersecurity & Ethical Hacking'
    ]
  }
};

export default function HomePage() {
  const [activeTask, setActiveTask] = useState<TaskType>('qa');
  const [inputVal, setInputVal] = useState('');
  const [level, setLevel] = useState('beginner');
  const [quizCount, setQuizCount] = useState(5);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Speech
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Check health on load
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setBackendOnline(true);
        } else {
          setBackendOnline(false);
        }
      } catch {
        setBackendOnline(false);
      }
    }
    checkHealth();
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleGenerate = async () => {
    if (!inputVal.trim()) {
      alert('Please enter a question or topic.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResultData(null);
    setQuizSubmitted(false);
    setSelectedAnswers({});
    setQuizScore(null);
    stopSpeech();

    let endpoint = `/api/${activeTask}`;
    let body: any = {};

    if (activeTask === 'qa') {
      body = { question: inputVal.trim() };
    } else if (activeTask === 'explain' || activeTask === 'summarize') {
      body = { text: inputVal.trim() };
    } else if (activeTask === 'quiz') {
      body = { text: inputVal.trim(), num_questions: Number(quizCount) };
    } else if (activeTask === 'learn') {
      body = { topic: inputVal.trim(), level };
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.detail || data.message || 'Failed to generate response.');
      }

      setResultData(data.result);
      showToast('Generated successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  // Speech TTS
  const stopSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      stopSpeech();
      return;
    }

    let text = '';
    if (typeof resultData === 'string') {
      text = resultData.replace(/[#*`_]/g, '');
    } else if (resultData && resultData.questions) {
      text = resultData.questions.map((q: QuizQuestion, i: number) => `Question ${i + 1}: ${q.question}`).join('. ');
    }

    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = () => {
    if (!resultData) return;
    const text = typeof resultData === 'string' ? resultData : JSON.stringify(resultData, null, 2);
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  };

  const handleDownload = () => {
    if (!resultData) return;
    const isQuiz = typeof resultData === 'object' && resultData.questions;
    const filename = isQuiz ? `EduGenie-Quiz-${Date.now()}.json` : `EduGenie-${activeTask}-${Date.now()}.md`;
    const content = isQuiz ? JSON.stringify(resultData, null, 2) : resultData;
    const blob = new Blob([content], { type: isQuiz ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Saved as ${filename}`);
  };

  // Evaluate Quiz
  const handleEvaluateQuiz = () => {
    if (!resultData || !resultData.questions) return;
    let score = 0;
    const questions: QuizQuestion[] = resultData.questions;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    showToast(`Quiz Scored: ${score} / ${questions.length}`);
  };

  const currentConfig = TASK_CONFIGS[activeTask];

  return (
    <div className="min-h-screen flex flex-col">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="nav-inner">
          <div className="brand-wrap">
            <div className="brand-icon-box">✨</div>
            <span className="brand-logo-text">EduGenie<span style={{ color: 'var(--accent)' }}>.AI</span></span>
            <span className="brand-react-badge">Next.js 15 & Gemini</span>
          </div>

          <div className="nav-right">
            <div className={`status-pill ${backendOnline ? 'online' : 'offline'}`}>
              <div className="pulse-dot" />
              <span>{backendOnline ? 'FastAPI Online' : 'Backend Offline'}</span>
            </div>

            <button type="button" onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Theme">
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero-box">
        <div className="hero-pill">
          ⚡ AI-Powered Educational Learning Assistant
        </div>
        <h1 className="hero-heading">
          Master Any Subject with <span className="gradient-title">Gemini AI Studio</span>
        </h1>
        <p className="hero-desc">
          Instant concept explanations, interactive practice quizzes, personalized learning paths, and revision summaries powered by Google Gemini 3.5.
        </p>
      </section>

      {/* MAIN CONTAINER */}
      <main className="app-container">
        <div className="studio-grid">
          
          {/* STUDIO PANEL */}
          <div className="glass-card">
            <div className="card-top">
              <div className="top-left">
                <div className="card-icon">💡</div>
                <div>
                  <h2 className="card-title">Learning Studio</h2>
                  <p className="card-subtitle">{currentConfig.subtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setInputVal(''); setResultData(null); stopSpeech(); }}
                className="preset-btn"
              >
                Reset
              </button>
            </div>

            {/* Task Tabs */}
            <div className="tabs-row">
              {(Object.keys(TASK_CONFIGS) as TaskType[]).map((key) => {
                const cfg = TASK_CONFIGS[key];
                return (
                  <button
                    key={key}
                    type="button"
                    className={`tab-pill ${activeTask === key ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTask(key);
                      stopSpeech();
                    }}
                  >
                    <span>{cfg.icon}</span>
                    <span>{cfg.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Presets */}
            <div className="presets-wrap">
              <div className="preset-title">✨ Quick Prompts:</div>
              <div className="preset-chip-list">
                {currentConfig.presets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="preset-btn"
                    onClick={() => setInputVal(preset)}
                  >
                    {preset.length > 40 ? preset.slice(0, 40) + '...' : preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="form-stack">
              {activeTask === 'learn' && (
                <div className="input-group">
                  <label className="group-label">🎯 Target Mastery Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="custom-select"
                  >
                    <option value="beginner">🌱 Beginner (Foundational Concepts)</option>
                    <option value="intermediate">🚀 Intermediate (Hands-on Projects)</option>
                    <option value="advanced">🔥 Advanced (Deep Architecture & Performance)</option>
                  </select>
                </div>
              )}

              {activeTask === 'quiz' && (
                <div className="input-group">
                  <label className="group-label">🔢 Number of Questions</label>
                  <select
                    value={quizCount}
                    onChange={(e) => setQuizCount(Number(e.target.value))}
                    className="custom-select"
                  >
                    <option value={3}>3 Questions (Quick Sprint)</option>
                    <option value={5}>5 Questions (Standard Practice)</option>
                    <option value={8}>8 Questions (Comprehensive Test)</option>
                  </select>
                </div>
              )}

              <div className="input-group">
                <div className="label-between">
                  <label className="group-label">{currentConfig.label}</label>
                  <span className="counter-text">{inputVal.length} chars</span>
                </div>
                <textarea
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={currentConfig.placeholder}
                  className="custom-textarea"
                  rows={5}
                />
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="btn-generate"
              >
                <span>✨</span>
                <span>{loading ? 'Consulting Gemini AI...' : 'Generate with Gemini'}</span>
              </button>

              {loading && (
                <div className="status-bar loading">
                  <div className="spinner-spin" />
                  <span>EduGenie is generating educational content...</span>
                </div>
              )}

              {errorMsg && (
                <div className="status-bar error">
                  <span>⚠️ {errorMsg}</span>
                </div>
              )}
            </div>
          </div>

          {/* OUTPUT PANEL */}
          <div className="glass-card">
            <div className="card-top">
              <div className="top-left">
                <div className="card-icon">🎓</div>
                <div>
                  <h2 className="card-title">EduGenie Insights</h2>
                  <p className="card-subtitle">AI response & self-assessment</p>
                </div>
              </div>

              <div className="action-btns-group">
                <button
                  type="button"
                  onClick={handleSpeech}
                  disabled={!resultData}
                  className={`btn-icon-act ${isSpeaking ? 'speaking' : ''}`}
                  title={isSpeaking ? 'Stop Audio' : 'Listen'}
                >
                  {isSpeaking ? '⏹️' : '🔊'}
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!resultData}
                  className="btn-icon-act"
                  title="Copy"
                >
                  📋
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!resultData}
                  className="btn-icon-act"
                  title="Download File"
                >
                  💾
                </button>
              </div>
            </div>

            <div className="output-body">
              {!resultData ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-subtle)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔮</div>
                  <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Ready to Assist</h3>
                  <p style={{ maxWidth: '380px', margin: '0 auto', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    Select a learning mode, enter your prompt or passage, and generate AI answers, quizzes, or structured roadmaps.
                  </p>
                </div>
              ) : activeTask === 'quiz' && resultData.questions ? (
                <div>
                  {quizSubmitted && quizScore !== null && (
                    <div className="quiz-score-header">
                      <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>
                        {quizScore} / {resultData.questions.length}
                      </div>
                      <p style={{ marginTop: '0.25rem' }}>
                        {quizScore / resultData.questions.length >= 0.8
                          ? '🎉 Outstanding mastery!'
                          : quizScore / resultData.questions.length >= 0.5
                          ? '👍 Good attempt! Review the explanations below.'
                          : '📚 Keep practicing! Read the review points below.'}
                      </p>
                    </div>
                  )}

                  {resultData.questions.map((q: QuizQuestion, qIdx: number) => (
                    <div key={qIdx} className="react-quiz-card">
                      <div className="react-quiz-title">
                        <span style={{ color: 'var(--primary-light)' }}>Q{qIdx + 1}.</span>
                        <span>{q.question}</span>
                      </div>
                      <div className="react-quiz-options">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedAnswers[qIdx] === opt;
                          let btnClass = 'react-quiz-option';
                          if (isSelected) btnClass += ' selected';
                          if (quizSubmitted) {
                            btnClass += ' disabled';
                            if (opt === q.answer) btnClass += ' correct';
                            if (isSelected && opt !== q.answer) btnClass += ' incorrect';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              disabled={quizSubmitted}
                              className={btnClass}
                              onClick={() => {
                                setSelectedAnswers((prev) => ({
                                  ...prev,
                                  [qIdx]: opt,
                                }));
                              }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && q.explanation && (
                        <div className="react-quiz-explanation">
                          <strong>💡 Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}

                  {!quizSubmitted && (
                    <button
                      type="button"
                      onClick={handleEvaluateQuiz}
                      className="btn-generate"
                      style={{ marginTop: '1rem' }}
                    >
                      🏆 Submit & Score Quiz
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>
                  {typeof resultData === 'string' ? resultData : JSON.stringify(resultData, null, 2)}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {toastMsg && <div className="toast-msg">✨ {toastMsg}</div>}

      <footer className="react-footer">
        <p>EduGenie AI • Next.js React 19 Frontend & FastAPI Gemini Backend • 2026</p>
      </footer>
    </div>
  );
}