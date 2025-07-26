"use client";

import { useEffect, useState } from "react";
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
} from "firebase/firestore";
import { toast } from "react-hot-toast";

export default function ChatRoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) router.push("/auth/login");
      else setUser(user);
    });
    return () => unsubAuth();
  }, [router]);

  useEffect(() => {
    if (!id) return;

    const q = query(collection(db, "chatrooms", id, "messages"), orderBy("createdAt"));
    const unsubMessages = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map((doc) => doc.data()));
    });

    // Check auth state before accessing uid
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
        if (user) {
        const unsubMembers = onSnapshot(
            doc(db, "chatrooms", id, "members", user.uid),
            (docSnap) => {
            setHasJoined(docSnap.exists());
            }
        );

        // Clean up members listener too
        return () => {
            unsubMessages();
            unsubMembers();
        };
        }
    });

    return () => {
        unsubMessages();
        unsubscribeAuth();
    };
    }, [id]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      await addDoc(collection(db, "chatrooms", id, "messages"), {
        text,
        user: user.displayName, // use displayName
        email: user.email, // optional, for internal logic if needed
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch {
      toast.error("Message failed");
    }
  };

  const leaveRoom = async () => {
    try {
      // Remove user from members
      await deleteDoc(doc(db, "chatrooms", id, "members", auth.currentUser.uid));

      // Check if any members left
      const membersSnapshot = await getDocs(collection(db, "chatrooms", id, "members"));
      if (membersSnapshot.empty) {
        // Delete entire room if no members remain
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

  return (
    <div className="h-screen flex flex-col bg-gradient-to-tr from-violet-200 to-fuchsia-200 relative">
        {/* Scrollable chat messages */}
        <div className="flex-1 overflow-y-auto p-4 pb-40">
          {messages.map((msg, i) => {
            const isUser = msg.user === user?.displayName;

            return (
              <div key={i} className={`flex mb-2 ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg shadow ${
                    isUser
                      ? "bg-purple-500 text-white rounded-br-none"
                      : "bg-gray-200 text-black rounded-bl-none"
                  }`}
                >
                  {!isUser && (
                    <p className="text-xs font-semibold text-gray-600 mb-1">{msg.user}</p>
                  )}
                  <p className="break-words">{msg.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fixed bottom chat input */}
        {hasJoined && (
        <div className="fixed bottom-0 left-0 w-full flex p-4 bg-white border-t z-10">
            <input
            className="flex-1 p-2 border rounded mr-2"
            value={text}
            onChange={(e) => setText(e.target.value)}
            />
            <button className="bg-purple-600 text-white px-4 rounded mr-2" onClick={sendMessage}>
            Send
            </button>
            <button className="bg-red-500 text-white px-4 rounded" onClick={leaveRoom}>
            Leave
            </button>
        </div>
        )}
    </div>
    );
}