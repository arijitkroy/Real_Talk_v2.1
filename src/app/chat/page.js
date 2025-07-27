"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { toast } from "react-hot-toast";

export default function ChatLobbyPage() {
  const router = useRouter();
  const [chatrooms, setChatrooms] = useState([]);
  const [roomInput, setRoomInput] = useState("");
  const [isExistingRoom, setIsExistingRoom] = useState(false);
  const [memberCounts, setMemberCounts] = useState({});

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) router.push("/auth/login");
    });
    return () => unsubAuth();
  }, [router]);

  useEffect(() => {
    const unsubscribers = [];

    chatrooms.forEach((room) => {
      const membersRef = collection(db, "chatrooms", room.id, "members");
      const unsub = onSnapshot(membersRef, (snapshot) => {
        setMemberCounts((prev) => ({
          ...prev,
          [room.id]: snapshot.size,
        }));
      });

      unsubscribers.push(unsub);
    });

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [chatrooms]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "chatrooms"), async (snapshot) => {
      const rooms = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const memberSnap = await getDocs(collection(db, "chatrooms", docSnap.id, "members"));
          return {
            id: docSnap.id,
            ...docSnap.data(),
            memberCount: memberSnap.size,
          };
        })
      );
      setChatrooms(rooms);
    });
    return () => unsub();
  }, []);

  // Detect if the input matches an existing room ID
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!roomInput.trim()) return setIsExistingRoom(false);
      const ref = doc(db, "chatrooms", roomInput.trim());
      const snap = await getDoc(ref);
      setIsExistingRoom(snap.exists());
    }, 500); // debounce

    return () => clearTimeout(timeout);
  }, [roomInput]);

  const handleAction = async () => {
    const input = roomInput.trim();
    if (!input) return toast.error("Input cannot be empty");

    try {
      if (isExistingRoom) {
        // Join existing room
        await setDoc(doc(db, "chatrooms", input, "members", auth.currentUser.uid), {
          email: auth.currentUser.email,
          joinedAt: serverTimestamp(),
        });
        toast.success("Joined room");
        router.push(`/chat/${input}`);
      } else {
        // Check for duplicate room name
        const q = await getDocs(
          query(collection(db, "chatrooms"), where("name", "==", input))
        );

        if (!q.empty) {
          return toast.error("Room name already exists. Choose a different name.");
        }

        // Create new room
        const docRef = await addDoc(collection(db, "chatrooms"), {
          name: input,
          createdAt: serverTimestamp(),
        });

        await setDoc(doc(db, "chatrooms", docRef.id, "members", auth.currentUser.uid), {
          email: auth.currentUser.email,
          joinedAt: serverTimestamp(),
        });

        toast.success("Room created");
        router.push(`/chat/${docRef.id}`);
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Room ID copied!");
    } catch (e) {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="h-[90vh] p-6 bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Chatrooms</h1>

        {/* Smart Create/Join Input */}
        <div className="flex mb-8">
          <input
            type="text"
            placeholder="Enter room name or ID"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            className="flex-1 px-4 py-2 border bg-white text-black rounded-l outline-none"
          />
          <button
            onClick={handleAction}
            className={`${
              isExistingRoom
                ? "bg-green-600 hover:bg-green-700"
                : "bg-indigo-600 hover:bg-indigo-700"
            } text-white px-4 py-2 rounded-r transition`}
          >
            {isExistingRoom ? "Join" : "Create"}
          </button>
        </div>

        {/* Chatroom list */}
        <div className="space-y-4">
          {chatrooms.map((room) => (
            <div
              key={room.id}
              className="bg-gray-700 p-4 rounded shadow hover:bg-gray-800 transition relative"
            >
              {/* Member count at top-right */}
              <div className="absolute top-2 right-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                {memberCounts[room.id] ?? 0} member{memberCounts[room.id] === 1 ? "" : "s"}
              </div>

              {/* Room name & ID */}
              <div
                className="cursor-pointer"
                onClick={async () => {
                  await setDoc(doc(db, "chatrooms", room.id, "members", auth.currentUser.uid), {
                    email: auth.currentUser.email,
                    joinedAt: serverTimestamp(),
                  });
                  router.push(`/chat/${room.id}`);
                }}
              >
                <h2 className="text-lg font-semibold">{room.name || "Unnamed Room"}</h2>
                <p className="text-sm text-gray-300">ID: {room.id}</p>
              </div>

              {/* Copy room ID at bottom-right */}
              <button
                onClick={() => copyToClipboard(room.id)}
                className="absolute bottom-2 right-2 text-sm text-blue-400 underline hover:text-blue-300"
              >
                Copy Room ID
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}