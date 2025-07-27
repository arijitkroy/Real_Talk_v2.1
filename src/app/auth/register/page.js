"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { useUser } from '@/context/UserContext';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [password, setPassword] = useState("");
  const { user, setUser } = useUser();

  const handleRegister = async (e) => {
    e.preventDefault();

    const username = usernameInput.trim();

    if (!username || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    const isValidUsername = /^[a-zA-Z0-9._]+$/.test(username);
    if (!isValidUsername) {
      toast.error("Username can only contain letters, numbers, dot or underscore");
      return;
    }

    try {
      // Check if username already exists
      const usernameRef = doc(db, "usernames", username);
      const usernameSnap = await getDoc(usernameRef);

      if (usernameSnap.exists()) {
        toast.error("Username is already taken");
        return;
      }

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Set displayName on the auth profile
      await updateProfile(auth.currentUser, {
        displayName: username,
      });

      const uid = userCredential.user.uid;

      // Save user data in 'users' collection
      await setDoc(doc(db, "users", uid), {
        username,
        email,
        createdAt: new Date(),
      });

      // Map username to UID in 'usernames' collection
      await setDoc(doc(db, "usernames", username), {
        uid,
      });

      toast.success("Account created!");
      setUser((prev) => ({
        ...prev,
        displayName: username
      }));
      router.push("/chat");
    } catch (error) {
      toast.error('Email is already taken.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-sm bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-lg space-y-5"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          Register
        </h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 border rounded bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full py-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Register
        </button>

        <p className="text-sm text-center text-gray-600 dark:text-gray-300">
          Already have an account?{" "}
          <a href="/auth/login" className="text-blue-500 hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}