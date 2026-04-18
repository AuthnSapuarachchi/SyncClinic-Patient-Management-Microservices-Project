import { useMemo, useState } from 'react';
import api from '../api/axiosConfig';

const defaultSystemMessage = {
  id: 'system-message',
  role: 'system',
  content:
    'SyncClinic AI is here to help you understand symptoms, suggest next steps, and guide you to the right care. This tool is informational only and not a medical diagnosis.',
};

const mockResponses = {
  'My throat is sore and I feel fatigued.': {
    possibleConditions: ['Common Cold', 'Viral Pharyngitis'],
    recommendedSpecialties: ['General Physician'],
    urgencyLevel: 'Low',
    generalAdvice:
      'Rest well, stay hydrated, and take warm fluids. If symptoms persist more than 3–5 days, consult a doctor.',
  },

  'I have chest pain and shortness of breath.': {
    possibleConditions: ['Angina', 'Respiratory Infection'],
    recommendedSpecialties: ['Cardiologist', 'Pulmonologist'],
    urgencyLevel: 'High',
    generalAdvice:
      'Seek immediate medical attention. Do not ignore these symptoms.',
  },
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
  const disclaimer =
    response.disclaimer ||
    'This response is informational only and should not replace professional medical care.';

  return `Possible conditions: ${conditions}
Recommended specialties: ${specialties}
Urgency level: ${urgency}
Advice: ${advice}
${disclaimer}`;
};

const extractSymptoms = (text) => {
  if (!text) return [];

  const items = text
    .split(/[;,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : [text.trim()];
};

export default function AIChatBot({
  patientAge = '30',
  patientGender = 'Other',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([defaultSystemMessage]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  // ⭐ NEW STATE (controls quick prompts visibility)
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);

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

    // ⭐ HIDE QUICK PROMPTS AFTER SELECTION
    setShowQuickPrompts(false);
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
      const matchKey = Object.keys(mockResponses).find((key) =>
        text.toLowerCase().includes(key.toLowerCase()),
      );

      if (matchKey) {
        const assistantText = buildAssistantContent(
          mockResponses[matchKey],
        );

        setTimeout(() => {
          setMessages((current) => [
            ...current,
            {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: assistantText,
            },
          ]);
          setIsSending(false);
        }, 800);

        return;
      }

      const requestBody = {
        age: patientAge || '30',
        gender: patientGender || 'Other',
        symptoms: extractSymptoms(text),
        additionalInfo: text,
      };

      const response = await api.post('/api/symptoms/check', requestBody);
      const assistantText = buildAssistantContent(response.data || {});

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: assistantText,
        },
      ]);
    } catch (submitError) {
      console.error('AI symptom check failed', submitError);

      const messageContent =
        submitError.response?.data?.message ||
        'Unable to reach the AI service. Please try again later.';

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

          {/* HEADER */}
          <div className="flex items-center justify-between rounded-t-3xl bg-slate-900/95 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">
                AI Symptom Assistant
              </p>
              <h2 className="mt-1 text-lg font-bold text-white">
                Symptom Chat
              </h2>
            </div>

            <div className="flex gap-2">
              {/* toggle quick prompts */}
              <button
                type="button"
                onClick={() => setShowQuickPrompts((prev) => !prev)}
                className="rounded-full bg-slate-800/80 px-3 py-2 text-xs text-slate-200 hover:bg-slate-700"
              >
                {showQuickPrompts ? 'Hide Prompts' : 'Show Prompts'}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-slate-800/80 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>

          {/* CHAT */}
          <div className="max-h-96 space-y-3 overflow-y-auto px-4 py-4 text-sm">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl px-4 py-3 ${
                  message.role === 'assistant'
                    ? 'bg-slate-900/90'
                    : 'bg-cyan-500/10'
                }`}
              >
                <p className="whitespace-pre-line break-words">
                  {message.content}
                </p>
              </div>
            ))}
          </div>

          {/* INPUT AREA */}
          <div className="border-t border-slate-800/70 bg-slate-900/95 px-4 py-4">

            {/* QUICK PROMPTS (conditionally hidden) */}
            {showQuickPrompts && (
              <div className="mb-3 flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleQuickPrompt(prompt)}
                    className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                rows="3"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Describe your symptoms..."
                className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
              />

              {error && <p className="text-xs text-rose-300">{error}</p>}

              <button
                type="submit"
                disabled={isSending}
                className="w-full rounded-full bg-cyan-500 py-2 text-sm font-semibold text-slate-950"
              >
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MAIN TOGGLE BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="mt-3 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950"
      >
        {isOpen ? 'Hide Symptom Bot' : 'Ask AI Assistant'}
      </button>
    </div>
  );
}