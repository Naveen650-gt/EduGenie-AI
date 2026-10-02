// EduGenie AI Advanced Application Engine
document.addEventListener('DOMContentLoaded', () => {
  let activeTask = 'qa';
  let currentRawResult = null;
  let isSpeaking = false;
  let synth = window.speechSynthesis || null;

  // DOM Elements
  const htmlDoc = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const historyToggle = document.getElementById('historyToggle');
  const historyDrawer = document.getElementById('historyDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const closeHistoryBtn = document.getElementById('closeHistoryBtn');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const historyList = document.getElementById('historyList');

  const tabBtns = document.querySelectorAll('.tab-btn');
  const levelGroup = document.getElementById('levelGroup');
  const levelSelect = document.getElementById('levelSelect');
  const quizCountGroup = document.getElementById('quizCountGroup');
  const quizCountSelect = document.getElementById('quizCountSelect');
  const inputLabel = document.getElementById('inputLabel');
  const inputText = document.getElementById('inputText');
  const charCount = document.getElementById('charCount');
  const presetsList = document.getElementById('presetsList');

  const submitBtn = document.getElementById('submitBtn');
  const submitBtnText = document.getElementById('submitBtnText');
  const clearBtn = document.getElementById('clearBtn');
  const statusBox = document.getElementById('statusBox');
  const statusMessage = document.getElementById('statusMessage');

  const resultContainer = document.getElementById('resultContainer');
  const outputSubtitle = document.getElementById('outputSubtitle');
  const copyBtn = document.getElementById('copyBtn');
  const speechBtn = document.getElementById('speechBtn');
  const speechIcon = document.getElementById('speechIcon');
  const downloadBtn = document.getElementById('downloadBtn');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');

  // Task Configurations
  const taskConfigs = {
    qa: {
      label: 'Student Question',
      placeholder: 'e.g., What causes solar eclipses? Why is water a universal solvent?',
      subtitle: 'AI answer with explanations and key insights',
      presets: [
        'What is quantum entanglement and how does it work?',
        'How does Newton’s Third Law apply to rocket propulsion?',
        'What is the difference between mitosis and meiosis?',
        'Why do stars twinkle but planets do not?'
      ]
    },
    explain: {
      label: 'Concept to Explain',
      placeholder: 'e.g., Blockchain, Convolutional Neural Networks, Keynesian Economics...',
      subtitle: 'Structured beginner-friendly breakdown with examples',
      presets: [
        'Generative AI & Transformer Models',
        'Blockchain Consensus Mechanisms',
        'Theory of Relativity in Simple Terms',
        'Photosynthesis Biochemical Stages'
      ]
    },
    quiz: {
      label: 'Passage or Topic for Quiz',
      placeholder: 'Paste notes, textbook text, or a topic name to generate multiple-choice questions...',
      subtitle: 'Interactive self-assessment multiple-choice quiz',
      presets: [
        'The water cycle includes evaporation, condensation, precipitation, and collection.',
        'Mitochondria produce ATP through cellular respiration using glucose and oxygen.',
        'Python is an interpreted, high-level, dynamically typed language created by Guido van Rossum.'
      ]
    },
    summarize: {
      label: 'Text to Summarize',
      placeholder: 'Paste long lecture notes, research paragraphs, or articles for revision summaries...',
      subtitle: 'High-yield study summary & key takeaways',
      presets: [
        'Photosynthesis is the biochemical process by which green plants and certain other organisms transform light energy into chemical energy. During photosynthesis in green plants, light energy is captured and used to convert water, carbon dioxide, and minerals into oxygen and energy-rich organic compounds.',
        'Machine learning is a branch of artificial intelligence and computer science which focuses on the use of data and algorithms to imitate the way that humans learn, gradually improving its accuracy.'
      ]
    },
    learn: {
      label: 'Skill or Topic for Roadmap',
      placeholder: 'e.g., Full-Stack Web Development, Data Science, Quantum Physics...',
      subtitle: 'Phased study roadmap with projects and milestones',
      presets: [
        'Full-Stack Web Development with React & FastAPI',
        'Deep Learning & Natural Language Processing',
        'Cybersecurity & Ethical Hacking',
        'Financial Modeling & Investment Analysis'
      ]
    }
  };

  // --------------------------------------------------------------------------
  // Theme Engine (Dark / Light)
  // --------------------------------------------------------------------------
  const savedTheme = localStorage.getItem('edugenie_theme') || 'dark';
  setTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = htmlDoc.getAttribute('data-theme') || 'dark';
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  });

  function setTheme(theme) {
    htmlDoc.setAttribute('data-theme', theme);
    themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    localStorage.setItem('edugenie_theme', theme);
  }

  // --------------------------------------------------------------------------
  // History Drawer & Local Storage
  // --------------------------------------------------------------------------
  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem('edugenie_history') || '[]');
    } catch {
      return [];
    }
  }

  function saveToHistory(task, prompt, result) {
    const history = getHistory();
    const newItem = {
      id: Date.now(),
      task: task,
      prompt: prompt,
      result: result,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    history.unshift(newItem);
    if (history.length > 20) history.pop();
    localStorage.setItem('edugenie_history', JSON.stringify(history));
    renderHistory();
  }

  function renderHistory() {
    const history = getHistory();
    if (history.length === 0) {
      historyList.innerHTML = '<div class="empty-history">No queries saved yet. Generate answers to build your study history.</div>';
      return;
    }

    historyList.innerHTML = '';
    history.forEach(item => {
      const card = document.createElement('div');
      card.className = 'history-item';
      card.innerHTML = `
        <div class="history-item-top">
          <span>${item.task.toUpperCase()}</span>
          <span>${item.date}</span>
        </div>
        <div class="history-item-prompt">${escapeHtml(item.prompt)}</div>
      `;
      card.addEventListener('click', () => {
        // Switch to task
        const pill = document.querySelector(`.tab-btn[data-task="${item.task}"]`);
        if (pill) pill.click();
        inputText.value = item.prompt;
        updateCharCount();
        displayResult(item.result, item.task);
        closeHistoryDrawer();
        showToast('Restored session from history!');
      });
      historyList.appendChild(card);
    });
  }

  function openHistoryDrawer() {
    renderHistory();
    historyDrawer.classList.add('open');
    drawerOverlay.classList.add('active');
  }

  function closeHistoryDrawer() {
    historyDrawer.classList.remove('open');
    drawerOverlay.classList.remove('active');
  }

  historyToggle.addEventListener('click', openHistoryDrawer);
  closeHistoryBtn.addEventListener('click', closeHistoryDrawer);
  drawerOverlay.addEventListener('click', closeHistoryDrawer);
  clearHistoryBtn.addEventListener('click', () => {
    localStorage.removeItem('edugenie_history');
    renderHistory();
    showToast('History cleared.');
  });

  // --------------------------------------------------------------------------
  // Presets & Task Switching
  // --------------------------------------------------------------------------
  function renderPresets() {
    const config = taskConfigs[activeTask];
    presetsList.innerHTML = '';
    config.presets.forEach(preset => {
      const chip = document.createElement('div');
      chip.className = 'preset-chip';
      chip.textContent = preset.length > 50 ? preset.substring(0, 50) + '...' : preset;
      chip.title = preset;
      chip.addEventListener('click', () => {
        inputText.value = preset;
        updateCharCount();
        inputText.focus();
      });
      presetsList.appendChild(chip);
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTask = btn.getAttribute('data-task');

      const config = taskConfigs[activeTask];
      inputLabel.textContent = config.label;
      inputText.placeholder = config.placeholder;
      outputSubtitle.textContent = config.subtitle;

      levelGroup.style.display = activeTask === 'learn' ? 'flex' : 'none';
      quizCountGroup.style.display = activeTask === 'quiz' ? 'flex' : 'none';

      renderPresets();
    });
  });

  function updateCharCount() {
    charCount.textContent = `${inputText.value.length} chars`;
  }
  inputText.addEventListener('input', updateCharCount);

  // Initial render
  renderPresets();

  // Reset/Clear Form
  clearBtn.addEventListener('click', () => {
    inputText.value = '';
    updateCharCount();
    stopSpeech();
    currentRawResult = null;
    copyBtn.disabled = true;
    speechBtn.disabled = true;
    downloadBtn.disabled = true;
    hideStatus();
    resultContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon-orbit"><span class="center-gem">✨</span></div>
        <h3 class="empty-title">EduGenie Workspace Ready</h3>
        <p class="empty-desc">
          Choose a task from the Studio, pick a prompt or write your own study question, and let Gemini AI curate personalized explanations and test materials.
        </p>
      </div>
    `;
  });

  // --------------------------------------------------------------------------
  // Markdown & Code Renderer
  // --------------------------------------------------------------------------
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function formatMarkdown(text) {
    if (!text) return '';
    let html = escapeHtml(text);

    // Code blocks
    html = html.replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `
        <div class="code-block-container">
          <button type="button" class="code-copy-btn" onclick="copyCodeBlock(this)">Copy Code</button>
          <pre><code>${code.trim()}</code></pre>
        </div>
      `;
    });

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold & Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Inline Code
    html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.08);padding:0.15rem 0.4rem;border-radius:4px;color:var(--accent-light);">$1</code>');

    // Lists
    html = html.replace(/^\s*[-*+]\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gms, '<ul>$1</ul>');

    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    return html.replace(/<p><\/p>/g, '').replace(/<p><ul/g, '<ul').replace(/<\/ul><\/p>/g, '</ul>');
  }

  window.copyCodeBlock = function(btn) {
    const pre = btn.parentElement.querySelector('pre');
    if (!pre) return;
    navigator.clipboard.writeText(pre.innerText).then(() => {
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy Code', 2000);
    });
  };

  // --------------------------------------------------------------------------
  // Interactive Quiz Experience
  // --------------------------------------------------------------------------
  function renderInteractiveQuiz(quizData) {
    if (!quizData || !quizData.questions || !Array.isArray(quizData.questions)) {
      resultContainer.innerHTML = `<div class="formatted-content">${formatMarkdown(JSON.stringify(quizData, null, 2))}</div>`;
      return;
    }

    const questions = quizData.questions;
    let html = `
      <div class="quiz-wrapper">
        <div id="quizScoreModal" style="display:none;" class="quiz-score-modal"></div>
        <div class="quiz-meta-bar">
          <span>🎯 Assessment Mode</span>
          <span class="quiz-score-live">${questions.length} Questions</span>
        </div>
    `;

    questions.forEach((q, idx) => {
      html += `
        <div class="quiz-card" data-index="${idx}">
          <div class="quiz-question-text">
            <span class="quiz-q-num">Q${idx + 1}.</span>
            <span>${escapeHtml(q.question)}</span>
          </div>
          <div class="quiz-options">
      `;

      q.options.forEach(opt => {
        html += `
          <button type="button" class="quiz-opt-btn" data-answer="${escapeHtml(q.answer)}" data-explanation="${escapeHtml(q.explanation || '')}" onclick="selectQuizAnswer(this)">
            <span>${escapeHtml(opt)}</span>
          </button>
        `;
      });

      html += `
          </div>
          <div class="quiz-explanation" style="display:none;"></div>
        </div>
      `;
    });

    html += `
        <div class="quiz-submit-banner">
          <button type="button" id="evaluateQuizBtn" class="btn-glow-primary" onclick="evaluateQuiz()">
            <span>🏆 Submit & Score Quiz</span>
          </button>
        </div>
      </div>
    `;

    resultContainer.innerHTML = html;
  }

  window.selectQuizAnswer = function(btn) {
    const card = btn.closest('.quiz-card');
    const options = card.querySelectorAll('.quiz-opt-btn');
    options.forEach(o => o.classList.remove('selected'));
    btn.classList.add('selected');
  };

  window.evaluateQuiz = function() {
    const cards = document.querySelectorAll('.quiz-card');
    let score = 0;
    let total = cards.length;

    cards.forEach(card => {
      const selectedBtn = card.querySelector('.quiz-opt-btn.selected');
      const allOptions = card.querySelectorAll('.quiz-opt-btn');
      const expBox = card.querySelector('.quiz-explanation');

      allOptions.forEach(opt => {
        const text = opt.querySelector('span').textContent.trim();
        const correctAnswer = opt.getAttribute('data-answer').trim();

        if (text === correctAnswer) {
          opt.classList.add('correct');
        }

        if (selectedBtn && opt === selectedBtn && text !== correctAnswer) {
          opt.classList.add('incorrect');
        }
        opt.classList.add('disabled');
      });

      if (selectedBtn) {
        const selectedText = selectedBtn.querySelector('span').textContent.trim();
        const correctAnswer = selectedBtn.getAttribute('data-answer').trim();
        if (selectedText === correctAnswer) {
          score++;
        }
        const exp = selectedBtn.getAttribute('data-explanation');
        if (exp) {
          expBox.innerHTML = `<strong>💡 Explanation:</strong> ${exp}`;
          expBox.style.display = 'block';
        }
      }
    });

    const modal = document.getElementById('quizScoreModal');
    const percentage = Math.round((score / total) * 100);
    modal.innerHTML = `
      <div class="score-num">${score} / ${total}</div>
      <p style="font-size: 1.05rem; margin-top:0.25rem;">
        ${percentage >= 80 ? '🎉 Excellent mastery!' : percentage >= 50 ? '👍 Good attempt! Review key concepts below.' : '📚 Keep practicing! Read the explanations below.'}
      </p>
    `;
    modal.style.display = 'block';
    modal.scrollIntoView({ behavior: 'smooth' });
    showToast(`Quiz completed! Score: ${score}/${total}`);
  };

  // --------------------------------------------------------------------------
  // Display Result Helper
  // --------------------------------------------------------------------------
  function displayResult(result, task) {
    currentRawResult = result;
    copyBtn.disabled = false;
    speechBtn.disabled = false;
    downloadBtn.disabled = false;

    if (task === 'quiz' && typeof result === 'object' && result.questions) {
      renderInteractiveQuiz(result);
    } else {
      const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
      resultContainer.innerHTML = `<div class="formatted-content">${formatMarkdown(text)}</div>`;
    }
  }

  // --------------------------------------------------------------------------
  // Audio Speech Synthesis (Text-to-Speech)
  // --------------------------------------------------------------------------
  function stopSpeech() {
    if (synth) {
      synth.cancel();
      isSpeaking = false;
      speechBtn.classList.remove('speaking');
      speechIcon.textContent = '🔊';
    }
  }

  speechBtn.addEventListener('click', () => {
    if (!synth) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      stopSpeech();
      return;
    }

    let textToSpeak = '';
    if (typeof currentRawResult === 'string') {
      textToSpeak = currentRawResult.replace(/[#*`_]/g, '');
    } else if (currentRawResult && currentRawResult.questions) {
      textToSpeak = currentRawResult.questions.map((q, i) => `Question ${i + 1}: ${q.question}`).join('. ');
    }

    if (!textToSpeak) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      isSpeaking = true;
      speechBtn.classList.add('speaking');
      speechIcon.textContent = '⏹️';
    };

    utterance.onend = () => {
      stopSpeech();
    };

    utterance.onerror = () => {
      stopSpeech();
    };

    synth.speak(utterance);
  });

  // --------------------------------------------------------------------------
  // Toast & Downloads
  // --------------------------------------------------------------------------
  function showToast(msg) {
    toastMsg.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
  }

  copyBtn.addEventListener('click', () => {
    if (!currentRawResult) return;
    const text = typeof currentRawResult === 'string' ? currentRawResult : JSON.stringify(currentRawResult, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied output to clipboard!');
    });
  });

  downloadBtn.addEventListener('click', () => {
    if (!currentRawResult) return;
    const isQuiz = typeof currentRawResult === 'object' && currentRawResult.questions;
    const filename = isQuiz ? `EduGenie-Quiz-${Date.now()}.json` : `EduGenie-${activeTask}-${Date.now()}.md`;
    const content = isQuiz ? JSON.stringify(currentRawResult, null, 2) : currentRawResult;
    const blob = new Blob([content], { type: isQuiz ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Saved as ${filename}`);
  });

  // --------------------------------------------------------------------------
  // Status Indicator Helpers
  // --------------------------------------------------------------------------
  function showLoading(msg) {
    statusBox.className = 'status-indicator loading';
    statusMessage.textContent = msg || 'EduGenie is generating content...';
    submitBtn.disabled = true;
    submitBtnText.textContent = 'Consulting Gemini AI...';
  }

  function showError(msg) {
    statusBox.className = 'status-indicator error';
    statusMessage.textContent = msg || 'An error occurred. Please try again.';
    submitBtn.disabled = false;
    submitBtnText.textContent = 'Generate with Gemini';
  }

  function hideStatus() {
    statusBox.className = 'status-indicator';
    submitBtn.disabled = false;
    submitBtnText.textContent = 'Generate with Gemini';
  }

  // --------------------------------------------------------------------------
  // Form Submission
  // --------------------------------------------------------------------------
  submitBtn.addEventListener('click', async () => {
    const value = inputText.value.trim();
    if (!value) {
      alert('Please enter a question, topic, or study text.');
      inputText.focus();
      return;
    }

    stopSpeech();
    showLoading('Generating insights with Gemini...');

    let endpoint = '';
    let bodyData = {};

    if (activeTask === 'qa') {
      endpoint = '/qa';
      bodyData = { question: value };
    } else if (activeTask === 'explain') {
      endpoint = '/explain';
      bodyData = { text: value };
    } else if (activeTask === 'quiz') {
      endpoint = '/quiz';
      const count = parseInt(quizCountSelect.value, 10) || 5;
      bodyData = { text: value, num_questions: count };
    } else if (activeTask === 'summarize') {
      endpoint = '/summarize';
      bodyData = { text: value };
    } else if (activeTask === 'learn') {
      endpoint = '/learn/recommendations';
      const level = levelSelect.value;
      bodyData = { topic: value, level: level };
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.detail || 'Failed to generate response from server.');
      }

      hideStatus();
      displayResult(data.result, activeTask);
      saveToHistory(activeTask, value, data.result);
      showToast('Generated successfully!');

    } catch (err) {
      showError(err.message || 'Network error occurred. Check backend server.');
    }
  });
});