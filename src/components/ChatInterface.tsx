"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface WorkoutCategory {
  id: string;
  name: string;
  icon: string;
  prompt: string;
}

const WORKOUT_CATEGORIES: WorkoutCategory[] = [
  { id: "strength", name: "Strength", icon: "💪", prompt: "Create a strength training workout for me" },
  { id: "cardio", name: "Cardio", icon: "🏃", prompt: "Create a cardio workout plan" },
  { id: "flexibility", name: "Flexibility", icon: "🧘", prompt: "Create a stretching and flexibility routine" },
  { id: "hiit", name: "HIIT", icon: "⚡", prompt: "Create a high-intensity interval training workout" },
  { id: "recovery", name: "Recovery", icon: "🧊", prompt: "What recovery exercises should I do today?" },
];

const QUICK_PROMPTS = [
  { text: "5-minute warm-up routine", icon: "🔥" },
  { text: "Full body workout no equipment", icon: "🏠" },
  { text: "Post-workout stretches", icon: "🙆" },
  { text: "How to improve my squat form?", icon: "🏋️" },
  { text: "Weekly workout schedule for beginners", icon: "📅" },
  { text: "Best exercises for back pain", icon: "🩺" },
];

const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "/api/chat";

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [userGoal, setUserGoal] = useState<string>("");
  const [fitnessLevel, setFitnessLevel] = useState<string>("beginner");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || isLoading) return;

    const contextPrefix = userGoal
      ? `[User Goal: ${userGoal}] [Fitness Level: ${fitnessLevel}] `
      : `[Fitness Level: ${fitnessLevel}] `;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: contextPrefix + text,
          messages: [...messages, userMessage],
          userGoal,
          fitnessLevel
        }),
      });

      const data = await response.json();
      const reply = data.output || data.reply || data.response || data;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: typeof reply === 'string' ? reply : JSON.stringify(reply) },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Atsiprašau, įvyko klaida. Bandykite dar kartą.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    sendMessage(prompt);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-72' : 'w-0'} transition-all duration-300 bg-gray-800 overflow-hidden`}>
        <div className="p-4 h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center text-xl">
              🏋️
            </div>
            <div>
              <h1 className="text-white font-bold">AI Fitness</h1>
              <p className="text-gray-400 text-xs">Treneris</p>
            </div>
          </div>

          {/* User Settings */}
          <div className="mb-6 p-3 bg-gray-700/50 rounded-lg">
            <label className="text-gray-400 text-xs block mb-2">Tavo tikslas</label>
            <input
              type="text"
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value)}
              placeholder="pvz., numesti 5kg"
              className="w-full bg-gray-700 text-white text-sm rounded-lg p-2 border-none focus:ring-2 focus:ring-green-500"
            />
            <label className="text-gray-400 text-xs block mb-2 mt-3">Lygis</label>
            <select
              value={fitnessLevel}
              onChange={(e) => setFitnessLevel(e.target.value)}
              className="w-full bg-gray-700 text-white text-sm rounded-lg p-2 border-none focus:ring-2 focus:ring-green-500"
            >
              <option value="beginner">Pradedantysis</option>
              <option value="intermediate">Vidutinis</option>
              <option value="advanced">Pažengęs</option>
            </select>
          </div>

          {/* Workout Categories */}
          <div className="mb-6">
            <h3 className="text-gray-400 text-xs uppercase mb-3">Treniruočių tipai</h3>
            <div className="space-y-2">
              {WORKOUT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleQuickPrompt(cat.prompt)}
                  className="w-full flex items-center gap-3 p-2 text-gray-300 hover:bg-gray-700 rounded-lg transition text-left"
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-sm">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex-1">
            <h3 className="text-gray-400 text-xs uppercase mb-3">Greiti veiksmai</h3>
            <div className="space-y-1">
              {QUICK_PROMPTS.slice(0, 4).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickPrompt(prompt.text)}
                  className="w-full text-left text-xs text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded transition truncate"
                >
                  {prompt.icon} {prompt.text}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Chat */}
          <button
            onClick={clearChat}
            className="mt-auto p-2 text-gray-400 hover:text-red-400 text-sm flex items-center gap-2"
          >
            🗑️ Išvalyti pokalbį
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 p-4 flex items-center gap-4">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-gray-400 hover:text-white p-2"
          >
            ☰
          </button>
          <div className="flex-1">
            <h2 className="text-white font-semibold">AI Fitness Treneris</h2>
            <p className="text-gray-400 text-sm">Tavo asmeninis treniruočių pagalbininkas</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-green-500 text-sm">Online</span>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-4">💪</div>
              <h2 className="text-2xl font-bold text-white mb-2">Sveiki atvykę!</h2>
              <p className="text-gray-400 mb-8 max-w-md">
                Aš esu tavo AI fitness treneris. Paklausk manęs apie treniruotes,
                pratimus, mitybą ar bet ką, kas susiję su fizine sveikata.
              </p>

              {/* Quick Prompts Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickPrompt(prompt.text)}
                    className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-left transition border border-gray-700 hover:border-green-500"
                  >
                    <span className="text-2xl block mb-2">{prompt.icon}</span>
                    <span className="text-sm text-gray-300">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex items-start gap-3 max-w-[80%]`}>
                {message.role === "assistant" && (
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                    🏋️
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-green-500 to-blue-500 text-white"
                      : "bg-gray-800 text-gray-100 border border-gray-700"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                    👤
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-sm">
                  🏋️
                </div>
                <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Klausk apie treniruotes, pratimus ar mitybą..."
              className="flex-1 p-4 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              Siųsti
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
