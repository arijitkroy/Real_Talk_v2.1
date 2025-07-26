"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  setDoc,
  deleteField,
} from "firebase/firestore";
import { toast } from "react-hot-toast";

export default function ChatLobbyPage() {
  const router = useRouter();
  const [chatrooms, setChatrooms] = useState([]);
  const [newRoom, setNewRoom] = useState("");

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) router.push("/auth/login");
    });
    return () => unsubAuth();
  }, [router]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "chatrooms"), (snapshot) => {
      setChatrooms(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const createRoom = async () => {
    if (!newRoom.trim()) return toast.error("Room name required");

    try {
      const docRef = await addDoc(collection(db, "chatrooms"), {
        name: newRoom,
        createdAt: serverTimestamp(),
      });

      // Add user to members subcollection
      await setDoc(doc(db, "chatrooms", docRef.id, "members", auth.currentUser.uid), {
        email: auth.currentUser.email,
        joinedAt: serverTimestamp(),
      });

      setNewRoom("");
      toast.success("Room created");
      router.push(`/chat/${docRef.id}`);
    } catch (error) {
      toast.error("Failed to create room");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
          Chatrooms
        </h1>

        <div className="flex mb-6">
          <input
            type="text"
            placeholder="Enter room name"
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
            className="flex-1 px-4 py-2 border bg-white text-black rounded-l outline-none"
          />
          <button
            onClick={createRoom}
            className="bg-indigo-600 text-white px-4 py-2 rounded-r hover:bg-indigo-700"
          >
            Create
          </button>
        </div>

        <div className="space-y-4">
          {chatrooms.map((room) => (
            <div
              key={room.id}
              onClick={async () => {
                // Add current user to members list before navigating
                await setDoc(doc(db, "chatrooms", room.id, "members", auth.currentUser.uid), {
                  email: auth.currentUser.email,
                  joinedAt: serverTimestamp(),
                });
                router.push(`/chat/${room.id}`);
              }}
              className="cursor-pointer bg-white p-4 rounded shadow hover:bg-indigo-50 transition"
            >
              <h2 className="text-lg font-semibold text-indigo-800">
                {room.name || "Unnamed Room"}
              </h2>
              <p className="text-sm text-gray-500">ID: {room.id}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}