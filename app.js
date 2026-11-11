const root = document.documentElement;
const savedTheme = localStorage.getItem('portal-theme');
if (savedTheme) root.setAttribute('data-theme', savedTheme);

function toggleTheme() {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  if (next === 'light') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', next);
  localStorage.setItem('portal-theme', next);
}

document.querySelectorAll('[data-theme-toggle]').forEach((button) => button.addEventListener('click', toggleTheme));
document.querySelectorAll('[data-menu-toggle]').forEach((button) => button.addEventListener('click', () => document.querySelector('.nav-links')?.classList.toggle('open')));

document.querySelectorAll('[data-job-search]').forEach((form) => form.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = form.querySelector('[name="q"]')?.value || '';
  window.location.href = `/jobs${query ? `?q=${encodeURIComponent(query)}` : ''}`;
}));

const jobSearch = document.querySelector('[data-filter-jobs]');
if (jobSearch) {
  const cards = [...document.querySelectorAll('[data-job-card]')];
  const filter = () => {
    const q = (document.querySelector('[name="job-q"]')?.value || '').toLowerCase();
    const state = document.querySelector('[name="state"]')?.value || '';
    const qualification = document.querySelector('[name="qualification"]')?.value || '';
    const department = document.querySelector('[name="department"]')?.value || '';
    cards.forEach((card) => {
      const text = card.innerText.toLowerCase();
      const matches = text.includes(q) && (!state || card.dataset.state === state) && (!qualification || card.dataset.qualification === qualification) && (!department || card.dataset.department === department);
      card.classList.toggle('hidden', !matches);
    });
  };
  jobSearch.addEventListener('input', filter);
  jobSearch.querySelectorAll('select').forEach((select) => select.addEventListener('change', filter));
  const query = new URLSearchParams(location.search).get('q');
  if (query) {
    document.querySelector('[name="job-q"]').value = query;
    filter();
  }
}

const questions = [{
    q: 'Which part of the Indian Constitution deals with Fundamental Rights?',
    options: ['Part II', 'Part III', 'Part IV', 'Part V'],
    answer: 1
  },
  {
    q: 'The largest planet in our solar system is:',
    options: ['Earth', 'Saturn', 'Jupiter', 'Neptune'],
    answer: 2
  },
  {
    q: 'Who was the first President of India?',
    options: ['Dr. Rajendra Prasad', 'S. Radhakrishnan', 'Jawaharlal Nehru', 'C. Rajagopalachari'],
    answer: 0
  },
  {
    q: 'What is 15% of 240?',
    options: ['24', '30', '36', '40'],
    answer: 2
  },
  {
    q: 'The headquarters of the Reserve Bank of India is in:',
    options: ['New Delhi', 'Mumbai', 'Kolkata', 'Chennai'],
    answer: 1
  }
];
let currentQuestion = 0;
let answers = Array(questions.length).fill(null);
let secondsLeft = 300;
let timerId;

function renderQuestion() {
  const question = questions[currentQuestion];
  const title = document.querySelector('[data-question-title]');
  if (!title) return;
  title.textContent = question.q;
  document.querySelector('[data-question-count]').textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
  document.querySelector('[data-options]').innerHTML = question.options.map((option, index) => `<label class="option ${answers[currentQuestion] === index ? 'selected' : ''}"><input type="radio" name="answer" value="${index}" ${answers[currentQuestion] === index ? 'checked' : ''}> &nbsp; ${option}</label>`).join('');
  document.querySelectorAll('[data-options] input').forEach((input) => input.addEventListener('change', () => {
    answers[currentQuestion] = Number(input.value);
    renderQuestion();
  }));
  document.querySelector('[data-question-nav]').innerHTML = questions.map((_, index) => `<button class="${answers[index] !== null ? 'answered' : ''}" data-go-question="${index}">${index + 1}</button>`).join('');
  document.querySelectorAll('[data-go-question]').forEach((button) => button.addEventListener('click', () => {
    currentQuestion = Number(button.dataset.goQuestion);
    renderQuestion();
  }));
}

function finishTest() {
  clearInterval(timerId);
  const correct = answers.reduce((total, answer, index) => total + (answer === questions[index].answer ? 1 : 0), 0);
  const attempted = answers.filter((answer) => answer !== null).length;
  const history = JSON.parse(localStorage.getItem('mock-history') || '[]');
  history.unshift({
    title: 'General Studies — Quick Practice',
    score: correct,
    total: questions.length,
    date: new Date().toLocaleDateString('en-IN')
  });
  localStorage.setItem('mock-history', JSON.stringify(history.slice(0, 10)));
  const result = document.querySelector('[data-test-result]');
  if (result) {
    result.innerHTML = `<div class="card"><span class="eyebrow">Test submitted</span><h2>Your score: ${correct} / ${questions.length}</h2><p class="muted">You attempted ${attempted} questions. Correct: ${correct} · Incorrect: ${attempted - correct} · Unanswered: ${questions.length - attempted}</p><div class="notice">Review the explanations in your test history and keep practicing. Your result is saved on this device.</div><p><a class="btn" href="/mock-tests">Try another test</a></p></div>`;
  }
  document.querySelector('[data-test-area]')?.classList.add('hidden');
}
if (document.querySelector('[data-question-title]')) {
  renderQuestion();
  const timeDisplay = document.querySelector('[data-timer]');
  timerId = setInterval(() => {
    secondsLeft -= 1;
    if (timeDisplay) timeDisplay.textContent = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;
    if (secondsLeft <= 0) finishTest();
  }, 1000);
  document.querySelector('[data-next]')?.addEventListener('click', () => {
    currentQuestion = Math.min(currentQuestion + 1, questions.length - 1);
    renderQuestion();
  });
  document.querySelector('[data-previous]')?.addEventListener('click', () => {
    currentQuestion = Math.max(currentQuestion - 1, 0);
    renderQuestion();
  });
  document.querySelector('[data-submit]')?.addEventListener('click', finishTest);
}
const historyContainer = document.querySelector('[data-history]');
if (historyContainer) {
  const history = JSON.parse(localStorage.getItem('mock-history') || '[]');
  historyContainer.innerHTML = history.length ? history.map((item) => `<div class="list-item"><div><strong>${item.title}</strong><small>${item.date}</small></div><span class="pill green">${item.score}/${item.total}</span></div>`).join('') : '<p class="muted">Your completed mock tests will appear here.</p>';
}
const demoForms = document.querySelectorAll('[data-demo-form]');
demoForms.forEach((form) => form.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = form.querySelector('[data-form-message]');
  if (message) message.textContent = 'Thanks! This demo stores no personal data. Secure account features require the connected backend.';
}));
