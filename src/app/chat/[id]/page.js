"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { format, isToday, isYesterday } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default function ChatRoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [user, setUser] = useState(null);
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) router.push("/auth/login");
      else setUser(user);
    });
    return () => unsubAuth();
  }, [router]);

  useEffect(() => {
    if (!id || !user) return;

    const q = query(
      collection(db, "chatrooms", id, "messages"),
      orderBy("createdAt")
    );
    const unsubMessages = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const memberDoc = doc(db, "chatrooms", id, "members", user.uid);

    const joinChat = async () => {
      const memberSnapshot = await getDocs(
        collection(db, "chatrooms", id, "members")
      );
    
      const alreadyJoined = memberSnapshot.docs.some(
        (doc) => doc.id === user.uid
      );
    
      if (!alreadyJoined) {
        // Only add to members and send system message if user hasn't joined yet
        await setDoc(doc(db, "chatrooms", id, "members", user.uid), {
          joinedAt: serverTimestamp(),
        });
    
        await addDoc(collection(db, "chatrooms", id, "messages"), {
          text: `${user.displayName} has joined the chat.`,
          system: true,
          createdAt: serverTimestamp(),
        });
      } else {
        // Refresh member timestamp on reconnect (optional)
        await setDoc(doc(db, "chatrooms", id, "members", user.uid), {
          joinedAt: serverTimestamp(),
        }, { merge: true });
      }
    };
    
    joinChat();

    const unsubscribe = () => {
      unsubMessages();
    };

    setHasJoined(true);
    return unsubscribe;
  }, [id, user]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    scrollToBottom();
    try {
      await addDoc(collection(db, "chatrooms", id, "messages"), {
        text,
        user: user.displayName,
        email: user.email,
        createdAt: serverTimestamp(),
      });
      setText("");
      scrollToBottom();
    } catch {
      toast.error("Message failed");
    }
  };

  const leaveRoom = async () => {
    try {
      await deleteDoc(doc(db, "chatrooms", id, "members", user.uid));

      await addDoc(collection(db, "chatrooms", id, "messages"), {
        text: `${user.displayName} has left the chat.`,
        system: true,
        createdAt: serverTimestamp(),
      });

      const membersSnapshot = await getDocs(
        collection(db, "chatrooms", id, "members")
      );
      if (membersSnapshot.empty) {
        await deleteDoc(doc(db, "chatrooms", id));
        toast("Room deleted as no members remain.");
      } else {
        toast.success("Left the room");
      }

      router.push("/chat");
    } catch (err) {
      toast.error("Failed to leave room");
    }
  };

  const groupMessagesByDay = (messages) => {
    const grouped = {};
    messages.forEach((msg) => {
      if (!msg.createdAt?.toDate) return;
      const date = msg.createdAt.toDate();
      const key = format(date, "yyyy-MM-dd");
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(msg);
    });
    return grouped;
  };

  const groupedMessages = groupMessagesByDay(messages);

  return (
    <div className="bg-gray-900 text-white flex flex-col items-center px-4 py-6 overflow-hidden h-[90vh]">
      <div className="w-full max-w-7xl bg-gray-800 rounded-lg shadow px-5 flex flex-col overflow-y-auto h-[100vh] space-y-4 custom-scrollbar">
        {Object.entries(groupedMessages).map(([dateKey, dayMessages]) => {
          const firstDate = dayMessages[0]?.createdAt?.toDate?.();
          const label = isToday(firstDate)
            ? "Today"
            : isYesterday(firstDate)
            ? "Yesterday"
            : format(firstDate, "MMMM d, yyyy");

          return (
            <div key={dateKey}>
              <div className="text-center text-sm text-gray-400 my-6 font-medium">
                {label}
              </div>

              {dayMessages.map((msg, i) => {
                const isUser = msg.user === user?.displayName;
                const isSystem = msg.system;

                return (
                  <div
                    key={msg.id || i}
                    className={`flex mb-2 ${
                      isSystem
                        ? "justify-center"
                        : isUser
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-xl shadow text-sm ${
                        isSystem
                          ? "bg-gray-700 text-gray-200 text-center"
                          : isUser
                          ? "bg-indigo-500 text-white rounded-br-none"
                          : "bg-white border border-gray-200 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      {!isUser && !isSystem && (
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          {msg.user}
                        </p>
                      )}
                      <div className="prose prose-invert max-w-none break-words whitespace-pre-wrap overflow-x-auto p-1 custom-scrollbar">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeKatex]}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
        <div ref={bottomRef} className="invisible h-0" />
      </div>

      {hasJoined && (
        <div className="mt-4 flex w-full max-w-7xl gap-2">
          <input
            type="text"
            className="flex-grow rounded-md bg-gray-800 border border-gray-700 px-4 py-2 focus:outline-none text-white"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
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
            onClick={leaveRoom}
          >
            Leave
          </button>
        </div>
      )}
    </div>
  );
}
