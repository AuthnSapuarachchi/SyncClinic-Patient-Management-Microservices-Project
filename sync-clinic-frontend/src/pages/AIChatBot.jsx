import { useMemo, useState } from 'react';
import api from '../api/axiosConfig';

const defaultSystemMessage = {
  id: 'system-message',
  role: 'system',
  content:
    'SyncClinic AI is here to help you understand symptoms, suggest next steps, and guide you to the right care. This tool is informational only and not a medical diagnosis.',
};

const normalizeResponseValue = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(', ');
  }
  return value || '-';
};

const buildAssistantContent = (response) => {
  const conditions = normalizeResponseValue(response.possibleConditions);
  const specialties = normalizeResponseValue(response.recommendedSpecialties);
  const advice = response.generalAdvice || response.advice || '-';
  const urgency = response.urgencyLevel || '-';
  const disclaimer = response.disclaimer || 'This response is informational only and should not replace professional medical care.';

  return `Possible conditions: ${conditions}\nRecommended specialties: ${specialties}\nUrgency level: ${urgency}\nAdvice: ${advice}\n${disclaimer}`;
};

const extractSymptoms = (text) => {
  if (!text) {
    return [];
  }

  const items = text
    .split(/[;,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : [text.trim()];
};

export default function AIChatBot({ patientAge = '30', patientGender = 'Other' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([defaultSystemMessage]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const quickPrompts = useMemo(
    () => [
      'I have a fever and headache for two days.',
      'My throat is sore and I feel fatigued.',
      'I have stomach pain after eating.',
    ],
    [],
  );

  const handleQuickPrompt = (prompt) => {
    setDraft(prompt);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const text = draft.trim();

    if (!text) {
      setError('Please enter your symptoms or question before sending.');
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft('');
    setError('');
    setIsSending(true);

    try {
      const requestBody = {
        age: patientAge || '30',
        gender: patientGender || 'Other',
        symptoms: extractSymptoms(text),
        additionalInfo: text,
      };

      const response = await api.post('/api/symptoms/check', requestBody);
      const assistantText = buildAssistantContent(response.data || {});

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: assistantText,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (submitError) {
      console.error('AI symptom check failed', submitError);
      const messageContent = submitError.response?.data?.message || 'Unable to reach the AI service. Please try again later.';
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          content: `Error: ${messageContent}`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end text-slate-100">
      {isOpen && (
        <div className="w-full max-w-md rounded-3xl border border-cyan-500/20 bg-slate-950/95 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
          <div className="flex items-center justify-between rounded-t-3xl bg-slate-900/95 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">AI Symptom Assistant</p>
              <h2 className="mt-1 text-lg font-bold text-white">Symptom Chat</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-slate-800/80 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
              aria-label="Close chat"
            >
              Close
            </button>
          </div>

          <div className="max-h-96 space-y-3 overflow-y-auto px-4 py-4 text-sm leading-6 text-slate-100">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl px-4 py-3 ${message.role === 'assistant' ? 'bg-slate-900/90 text-slate-100' : 'bg-cyan-500/10 text-slate-200'}`}
              >
                <p className="whitespace-pre-line break-words">{message.content}</p>
              </div>
            ))}
          </div>

          <div className="rounded-b-3xl border-t border-slate-800/70 bg-slate-900/95 px-4 py-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleQuickPrompt(prompt)}
                  className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-200 transition hover:border-cyan-400 hover:bg-cyan-500/15"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-400" htmlFor="ai-chat-input">
                Ask the assistant
              </label>
              <textarea
                id="ai-chat-input"
                rows="3"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Describe your symptoms in plain language..."
                className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20"
              />
              {error && <p className="text-xs text-rose-300">{error}</p>}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">Age: {patientAge || '30'} • Gender: {patientGender || 'Other'}</p>
                <button
                  type="submit"
                  disabled={isSending}
                  className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/60"
                >
                  {isSending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:bg-cyan-400"
        aria-label="Toggle AI symptom chat"
      >
        <span>{isOpen ? 'Hide Symptom Bot' : 'Ask AI Assistant'}</span>
      </button>
    </div>
  );
}
