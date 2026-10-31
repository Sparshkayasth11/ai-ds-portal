import { useEffect, useRef, useState } from "react";
import "./AiAssistant.css";

const SYSTEM_INSTRUCTION = `You are AI-DS Assistant, a helpful guide for the JNCT Bhopal CSE-AI & Data Science Department portal. Help students find and understand portal features, including syllabus and learning resources, timetables and schedules, notices and announcements, and placement and career information. Give clear, concise directions. Do not claim to know current portal content unless it is provided in the conversation.`;
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

function BotIcon({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="8" width="16" height="12" rx="4" />
      <path d="M12 4v4M9 13h.01M15 13h.01M9 17h6M2 12v4M22 12v4" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="m18 6-12 12M6 6l12 12" />
    </svg>
  );
}

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hi! I’m your AI-DS Assistant. Ask me about syllabus, timetables, notices, or placements.",
      isWelcome: true,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  async function handleSubmit(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage = { role: "user", text };
    const conversation = [...messages, userMessage];
    setMessages(conversation);
    setInput("");
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error(
          "Gemini is not configured. Set VITE_GEMINI_API_KEY in your environment."
        );
      }

      const response = await fetch(
        `${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: SYSTEM_INSTRUCTION }],
            },
            contents: conversation
              .filter(
                (message) =>
                  !message.isWelcome &&
                  !message.isError &&
                  message.apiEligible !== false
              )
              .map(({ role, text: messageText }) => ({
                role,
                parts: [{ text: messageText }],
              })),
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error?.message || `Gemini request failed (${response.status}).`
        );
      }

      const reply = data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .filter(Boolean)
        .join("\n");

      if (!reply) {
        throw new Error("Gemini returned an empty response. Please try again.");
      }

      setMessages((current) => [...current, { role: "model", text: reply }]);
    } catch (error) {
      setMessages((current) => [
        ...current.map((message) =>
          message === userMessage ? { ...message, apiEligible: false } : message
        ),
        {
          role: "model",
          text:
            error instanceof Error
              ? error.message
              : "Sorry, I couldn’t get a response. Please try again.",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="ai-assistant">
      {isOpen && (
        <section
          className="ai-assistant__panel"
          aria-label="AI-DS Assistant chat"
          aria-live="polite"
        >
          <header className="ai-assistant__header">
            <span className="ai-assistant__avatar">
              <BotIcon />
            </span>
            <span className="ai-assistant__heading">
              <strong>AI-DS Assistant</strong>
              <small>JNCT Bhopal · CSE-AI &amp; Data Science</small>
            </span>
            <button
              className="ai-assistant__close"
              type="button"
              aria-label="Close assistant"
              onClick={() => setIsOpen(false)}
            >
              <CloseIcon />
            </button>
          </header>

          <div className="ai-assistant__messages" aria-label="Chat history">
            {messages.map((message, index) => (
              <div
                className={`ai-assistant__message ai-assistant__message--${message.role}${
                  message.isError ? " ai-assistant__message--error" : ""
                }`}
                key={`${index}-${message.role}`}
              >
                {message.text}
              </div>
            ))}
            {isLoading && (
              <div
                className="ai-assistant__message ai-assistant__message--model ai-assistant__typing"
                role="status"
                aria-label="Assistant is responding"
              >
                <span />
                <span />
                <span />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="ai-assistant__form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about your department..."
              aria-label="Message the AI-DS Assistant"
              autoComplete="off"
              disabled={isLoading}
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={isLoading || !input.trim()}
            >
              <SendIcon />
            </button>
          </form>
        </section>
      )}

      <button
        className="ai-assistant__toggle"
        type="button"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close AI-DS Assistant" : "Open AI-DS Assistant"}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <CloseIcon /> : <BotIcon />}
        <span>AI-DS Assistant</span>
      </button>
    </div>
  );
}
