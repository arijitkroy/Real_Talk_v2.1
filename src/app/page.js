'use client';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white p-8 rounded-2xl shadow-xl text-gray-800">
        <h1 className="text-3xl font-bold mb-4 text-center text-indigo-600">Welcome to RealTalk AI</h1>

        <p className="text-lg mb-4">
            RealTalk AI is your personal companion for intelligent conversations, powered by advanced language models. Whether you're chatting casually or exploring deep topics, our platform ensures an intuitive and responsive experience.
        </p>

        <p className="text-md mb-4"></p>
          ✨ Features:
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>🧠 Chat with AI (powered by Gemini or GPT)</li>
            <li>💬 Join public and private chatrooms</li>
            <li>{👤 Manage your profile & preferences}</li>
            <li>🔒 Secure, authenticated access</li>
            <li>{⚡ Fast & responsive with Firebase backend}</li>
          </ul>

        <p className="text-md mt-6 text-center">
          Get started by <a href="/auth/login" className="text-blue-600 underline hover:text-blue-800">signing in</a> or exploring our <a href="/chatrooms" className="text-blue-600 underline hover:text-blue-800">chatrooms</a>.
        </p>
      </div>
    </main>
  );
}
