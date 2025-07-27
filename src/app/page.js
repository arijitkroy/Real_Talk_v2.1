'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="h-[90vh] bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-gray-800 p-8 rounded-2xl shadow-xl text-white">
        <h1 className="text-3xl font-bold mb-4 text-center text-white">
          Welcome to RealTalk AI
        </h1>

        <p className="text-lg mb-4">
          RealTalk AI is your personal companion for intelligent conversations, powered by advanced language models. Whether you&apos;re chatting casually or exploring deep topics, our platform ensures an intuitive and responsive experience.
        </p>

        <p className="text-md mb-4">✨ Features:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>🧠 Chat with AI (powered by Gemini or GPT)</li>
          <li>💬 Join public and private chatrooms</li>
          <li>👤 Manage your profile & preferences</li>
          <li>🔒 Secure, authenticated access</li>
          <li>⚡ Fast & responsive with Firebase backend</li>
        </ul>

        <p className="text-md mt-6 text-center">
          Get started by{" "}
          <Link href="/auth/login" className="text-gray-300 underline hover:text-gray-500">
            signing in
          </Link>{" "}
          or exploring our{" "}
          <Link href="/chat" className="text-gray-300 underline hover:text-gray-500">
            chatrooms
          </Link>.
        </p>
      </div>
    </main>
  );
}
