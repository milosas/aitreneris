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
  { id: "strength", name: "Jėga", icon: "💪", prompt: "Sukurk man jėgos treniruotę" },
  { id: "cardio", name: "Kardio", icon: "🏃", prompt: "Sukurk kardio treniruočių planą" },
  { id: "flexibility", name: "Lankstumas", icon: "🧘", prompt: "Sukurk tempimo ir lankstumo pratimų rutiną" },
  { id: "hiit", name: "HIIT", icon: "⚡", prompt: "Sukurk intensyvią intervalinę treniruotę" },
  { id: "recovery", name: "Atsigavimas", icon: "🧊", prompt: "Kokius atsigavimo pratimus turėčiau daryti šiandien?" },
];

const QUICK_PROMPTS = [
  { text: "5 minučių apšilimo rutina", icon: "🔥" },
  { text: "Viso kūno treniruotė be įrangos", icon: "🏠" },
  { text: "Tempimai po treniruotės", icon: "🙆" },
  { text: "Kaip pagerinti pritūpimo techniką?", icon: "🏋️" },
  { text: "Savaitės treniruočių planas pradedantiesiems", icon: "📅" },
  { text: "Pratimai nugaros skausmui sumažinti", icon: "🩺" },
];

const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "/api/chat";

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [userGoal, setUserGoal] = useState<string>("");
  const [fitnessLevel, setFitnessLevel] = useState<string>("pradedantysis");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Rodyti sidebar pagal ekrano dydį
  useEffect(() => {
    const checkScreenSize = () => {
      setShowSidebar(window.innerWidth >= 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Scroll tik kai yra žinučių (ne pirmą kartą atidarant)
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || isLoading) return;

    const contextPrefix = userGoal
      ? `[Vartotojo tikslas: ${userGoal}] [Fizinio pasirengimo lygis: ${fitnessLevel}] `
      : `[Fizinio pasirengimo lygis: ${fitnessLevel}] `;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Uždaryti sidebar mobile
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }

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

      const rawText = await response.text();

      if (!response.ok) {
        console.error("Webhook HTTP error:", response.status, response.statusText, rawText);
        throw new Error(
          `Webhook klaida (statusas ${response.status} ${response.statusText}): ${rawText || "tuščias atsakymas"}`
        );
      }

      let data: any;
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (e) {
        console.warn("Webhook negrąžino JSON, rodom žalią tekstą:", rawText);
        data = { output: rawText || "Webhook grąžino tuščią atsakymą." };
      }

      const reply = data.output || data.reply || data.response || data;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: typeof reply === 'string' ? reply : JSON.stringify(reply) },
      ]);
    } catch (error) {
      console.error("Chat klaida:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "nežinoma klaida";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Atsiprašau, įvyko klaida.\n\nTechninė informacija: ${errorMessage}`,
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

  // Uždaryti sidebar paspaudus ant main content (tik mobile)
  const handleMainContentClick = () => {
    if (window.innerWidth < 768 && showSidebar) {
      setShowSidebar(false);
    }
  };

  return (
    <div className="flex h-dvh bg-gray-900 overflow-hidden">
      {/* Šoninė juosta - be overlay, užsidaro tik per X arba paspaudus main content */}
      <div className={`
        fixed md:relative z-30 h-full
        ${showSidebar ? 'w-72 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'}
        transition-all duration-300 bg-gray-800 overflow-hidden
      `}>
        <div className="p-4 h-full flex flex-col w-72">
          {/* Header su uždarymo mygtuku */}
          <div className="flex items-center justify-between mb-6">
            {/* Logo - paspaudus refreshina */}
            <button
              onClick={handleRefresh}
              className="flex items-center gap-3 hover:opacity-80 transition text-left"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                🏋️
              </div>
              <div>
                <h1 className="text-white font-bold">AI Fitness</h1>
                <p className="text-gray-400 text-xs">Treneris</p>
              </div>
            </button>
            {/* Uždaryti mygtukas mobile */}
            <button
              onClick={() => setShowSidebar(false)}
              className="md:hidden text-gray-400 hover:text-white p-2 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Vartotojo nustatymai */}
          <div className="mb-6 p-3 bg-gray-700/50 rounded-lg">
            <label className="text-gray-400 text-xs block mb-2">Tavo tikslas</label>
            <input
              type="text"
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value)}
              placeholder="pvz., numesti 5kg"
              className="w-full text-sm rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
            <label className="text-gray-400 text-xs block mb-2 mt-3">Lygis</label>
            <select
              value={fitnessLevel}
              onChange={(e) => setFitnessLevel(e.target.value)}
              className="w-full text-sm rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none cursor-pointer"
            >
              <option value="pradedantysis">Pradedantysis</option>
              <option value="vidutinis">Vidutinis</option>
              <option value="pažengęs">Pažengęs</option>
            </select>
          </div>

          {/* Treniruočių kategorijos */}
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

          {/* Greiti veiksmai */}
          <div className="flex-1 overflow-y-auto">
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

          {/* Išvalyti pokalbį */}
          <button
            onClick={clearChat}
            className="mt-auto p-2 text-gray-400 hover:text-red-400 text-sm flex items-center gap-2"
          >
            🗑️ Išvalyti pokalbį
          </button>
        </div>
      </div>

      {/* Pagrindinis pokalbių sritas - paspaudus uždarys sidebar mobile */}
      <div className="flex-1 flex flex-col min-w-0" onClick={handleMainContentClick}>
        {/* Antraštė */}
        <header className="bg-gray-800 border-b border-gray-700 p-3 md:p-4 flex items-center gap-3 md:gap-4">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-gray-400 hover:text-white p-2 flex-shrink-0"
          >
            ☰
          </button>
          {/* Logo header - paspaudus refreshina */}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 hover:opacity-80 transition flex-1 min-w-0"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-sm flex-shrink-0 md:hidden">
              🏋️
            </div>
            <div className="min-w-0">
              <h2 className="text-white font-semibold text-sm md:text-base truncate">AI Fitness Treneris</h2>
              <p className="text-gray-400 text-xs hidden md:block">Tavo asmeninis treniruočių pagalbininkas</p>
            </div>
          </button>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-green-500 text-xs md:text-sm hidden sm:inline">Prisijungęs</span>
          </div>
        </header>

        {/* Žinutės */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="text-5xl md:text-6xl mb-4">💪</div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Sveiki atvykę!</h2>
              <p className="text-gray-400 mb-6 md:mb-8 max-w-md text-sm md:text-base">
                Aš esu tavo AI fitness treneris. Paklausk manęs apie treniruotes,
                pratimus, mitybą ar bet ką, kas susiję su fizine sveikata.
              </p>

              {/* Greitų veiksmų tinklelis */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 max-w-2xl w-full">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickPrompt(prompt.text)}
                    className="p-3 md:p-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-left transition border border-gray-700 hover:border-green-500"
                  >
                    <span className="text-xl md:text-2xl block mb-1 md:mb-2">{prompt.icon}</span>
                    <span className="text-xs md:text-sm text-gray-300 line-clamp-2">{prompt.text}</span>
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
              <div className={`flex items-start gap-2 md:gap-3 max-w-[90%] md:max-w-[80%]`}>
                {message.role === "assistant" && (
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-xs md:text-sm flex-shrink-0">
                    🏋️
                  </div>
                )}
                <div
                  className={`p-3 md:p-4 rounded-2xl ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-green-500 to-blue-500 text-white"
                      : "bg-gray-800 text-gray-100 border border-gray-700"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-xs md:text-sm leading-relaxed">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-gray-600 rounded-lg flex items-center justify-center text-xs md:text-sm flex-shrink-0">
                    👤
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-xs md:text-sm">
                  🏋️
                </div>
                <div className="bg-gray-800 p-3 md:p-4 rounded-2xl border border-gray-700">
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

        {/* Įvesties laukas */}
        <form onSubmit={handleSubmit} className="p-3 md:p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex gap-2 md:gap-3 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Klausk apie treniruotes..."
              className="flex-1 p-3 md:p-4 text-sm md:text-base rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm md:text-base"
            >
              Siųsti
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
