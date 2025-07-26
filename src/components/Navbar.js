"use client";

import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const { user } = useUser();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out");
      router.push("/auth/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const username = user?.displayName || user?.email?.split("@")[0] || "User";
  const avatar = user?.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${username}`;

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-black text-white px-6 py-4 flex justify-between items-center shadow-md">
      <Link href="/" className="text-xl font-bold">
        Real Talk v2
      </Link>

      <div className="space-x-4 flex items-center">
        <Link href="/chat">Chatrooms</Link>
        <Link href="/gemini">Gemini Chat</Link>

        {user ? (
          <div className="relative ml-4" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 focus:outline-none"
            >
              <img
                src={avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full border border-white"
              />
              <span className="text-sm hidden sm:inline">{username}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 text-black dark:text-white rounded shadow-lg z-50">
                <Link
                  href="/profile"
                  className="block px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  onClick={() => setDropdownOpen(false)}
                >
                  View Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="ml-2 px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}