// MOCK MODE: this demo generates local sample replies and makes no API calls.
// For real AI, set USE_MOCK to false and implement POST /api/chat on your server.
// Keep the provider API key on that server; never put it in this file.
const USE_MOCK = true;
const BACKEND_ENDPOINT = '/api/chat';

const form = document.querySelector('#chat-form');
const input = document.querySelector('#message-input');
const sendButton = document.querySelector('#send-button');
const messages = document.querySelector('#messages');
const errorBox = document.querySelector('#error');

function addMessage(text, sender) {
  const article = document.createElement('article');
  article.className = `message ${sender === 'user' ? 'user-message' : 'assistant-message'}`;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.setAttribute('aria-hidden', 'true');
  avatar.textContent = sender === 'user' ? 'You' : '✦';

  const content = document.createElement('div');
  content.className = 'message-content';
  const meta = document.createElement('div');
  meta.className = 'message-meta';
  const name = document.createElement('strong');
  name.textContent = sender === 'user' ? 'You' : 'Assistant';
  const time = document.createElement('time');
  time.textContent = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date());
  meta.append(name, time);

  const paragraph = document.createElement('p');
  paragraph.textContent = text; // textContent keeps user and assistant text safe from HTML injection.
  content.append(meta, paragraph);
  article.append(avatar, content);
  messages.append(article);
  messages.scrollTop = messages.scrollHeight;
  return article;
}

function showTyping() {
  const article = document.createElement('article');
  article.className = 'message assistant-message';
  article.setAttribute('aria-label', 'Assistant is typing');
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.setAttribute('aria-hidden', 'true');
  avatar.textContent = '✦';
  const content = document.createElement('div');
  content.className = 'message-content';
  const meta = document.createElement('div');
  meta.className = 'message-meta';
  const name = document.createElement('strong');
  name.textContent = 'Assistant';
  meta.append(name);
  const dots = document.createElement('p');
  dots.className = 'typing-dots';
  dots.setAttribute('aria-label', 'Typing');
  dots.innerHTML = '<span></span><span></span><span></span>';
  content.append(meta, dots);
  article.append(avatar, content);
  messages.append(article);
  messages.scrollTop = messages.scrollHeight;
  return article;
}

function mockReply(prompt) {
  const normalized = prompt.trim().toLowerCase();
  if (/^(hi|hello|hey)\b/.test(normalized)) return 'Hello! What would you like to talk about?';
  if (normalized.includes('help')) return 'I can answer simple questions in this demo. A real AI reply needs a secure backend connected to an AI provider.';
  return `That’s an interesting question: “${prompt.trim()}”\n\nThis is a sample reply because mock mode is on. Connect a backend to get real AI responses.`;
}

async function getReply(prompt) {
  if (USE_MOCK) {
    await new Promise((resolve) => window.setTimeout(resolve, 750));
    return mockReply(prompt);
  }

  const response = await fetch(BACKEND_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: prompt }),
  });
  if (!response.ok) throw new Error(`The chat service returned an error (${response.status}).`);
  const data = await response.json();
  if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('The chat service returned an empty reply.');
  return data.reply;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const prompt = input.value.trim();
  if (!prompt || sendButton.disabled) return;

  errorBox.hidden = true;
  errorBox.textContent = '';
  addMessage(prompt, 'user');
  input.value = '';
  input.style.height = 'auto';
  sendButton.disabled = true;
  input.disabled = true;
  const typing = showTyping();

  try {
    const reply = await getReply(prompt);
    typing.remove();
    addMessage(reply, 'assistant');
  } catch (error) {
    typing.remove();
    errorBox.textContent = error instanceof TypeError
      ? 'Could not reach the chat service. Check your connection and try again.'
      : (error.message || 'Something went wrong. Please try again.');
    errorBox.hidden = false;
  } finally {
    sendButton.disabled = false;
    input.disabled = false;
    input.focus();
  }
});

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
});
