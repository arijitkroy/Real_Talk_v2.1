"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { HiMenu, HiX } from "react-icons/hi";

export default function Navbar() {
  const { user } = useUser();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <nav className="sticky top-0 z-50 bg-black text-white px-6 py-4 shadow-md">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Real Talk v2
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="sm:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>

        {/* Desktop Links */}
        <div className="hidden sm:flex items-center space-x-4">
          <Link href="/chat">Chatrooms</Link>
          <Link href="/gemini">Gemini Chat</Link>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <Image
                  src={avatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border border-white"
                  width={40}
                  height={40}
                />
                <span className="text-sm hidden md:inline">{username}</span>
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
      </div>

      {/* Mobile Menu Links */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-4 space-y-2">
          <Link href="/chat" onClick={() => setMobileMenuOpen(false)} className="block">Chatrooms</Link>
          <Link href="/gemini" onClick={() => setMobileMenuOpen(false)} className="block">Gemini Chat</Link>

          {user ? (
            <>
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block">View Profile</Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="block">Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}