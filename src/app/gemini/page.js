"use client";
import { useState, useEffect, useRef } from "react";
import { fetchGeminiResponse } from "@/lib/geminiApi";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, getDocs, deleteDoc } from "firebase/firestore";
import { useUser } from "@/context/UserContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { useRouter } from "next/navigation";

export default function GeminiChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, router]);

  const chatRef = user?.uid
    ? collection(db, "users", user.uid, "geminiMessages")
    : null;

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  // Load messages in real-time
  useEffect(() => {
    if (!chatRef) return;
    const q = query(chatRef, orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
    });
    return () => unsubscribe();
  }, [chatRef]);

  const sendMessage = async () => {
    if (!input.trim() || !chatRef) return;

    const userMsg = {
      role: "user",
      text: input,
      createdAt: new Date(),
    };

    await addDoc(chatRef, userMsg);
    setInput("");
    setLoading(true);
    scrollToBottom();

    const aiText = await fetchGeminiResponse(input);
    const aiMsg = {
      role: "assistant",
      text: aiText,
      createdAt: new Date(),
    };

    await addDoc(chatRef, aiMsg);
    setLoading(false);
    scrollToBottom();
  };

  const handleClearChat = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const confirmed = window.confirm("Are you sure you want to clear the entire chat?");
    if (!confirmed) return;

    try {
      const chatRef = collection(db, "users", user.uid, "geminiMessages");
      const snapshot = await getDocs(chatRef);

      const deletions = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletions);

      setMessages([]);
    } catch (err) {
      console.error("Error clearing messages:", err);
      alert("Failed to clear chat. Please try again.");
    }
  };

  return (
    <div className="bg-gray-900 text-white flex flex-col items-center px-4 py-6 h-[90vh] overflow-hidden">
      <div className="text-3xl font-bold mb-4">💬 Chat with Gemini</div>

      <div className="w-full max-w-7xl bg-gray-800 rounded-lg shadow p-4 flex flex-col h-[95vh] overflow-y-auto space-y-4 custom-scrollbar">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`whitespace-pre-wrap px-4 py-3 rounded-xl max-w-[80%] ${
              msg.role === "user"
                ? "bg-blue-600 self-end text-white"
                : "bg-gray-700 self-start text-gray-100"
            }`}
          >
            <div className="prose prose-invert max-w-none break-words whitespace-pre-wrap overflow-x-auto custom-scrollbar">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeKatex]}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-gray-400 italic self-start animate-pulse px-4 py-3">
            Gemini is thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 flex w-full max-w-7xl gap-2">
        <input
          type="text"
          className="flex-grow rounded-md bg-gray-800 border border-gray-700 px-4 py-2 focus:outline-none text-white"
          placeholder="Ask Gemini something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          onClick={sendMessage}
        >
          Send
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={handleClearChat}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
