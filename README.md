
# 💬 Gemini Chat App

A modern chat application using **Firebase Gemini AI** powered by **Next.js**, **Tailwind CSS**, and **Firestore** for real-time message storage and retrieval.

---

## ✨ Features

- 🔥 Gemini model integration via **Firebase AI**
- 💾 Realtime chat history storage with **Cloud Firestore**
- 🧠 Dynamic AI response streaming with `loading` indicator
- 🎨 Responsive and dark-themed UI using **Tailwind CSS**
- ⬇️ Auto-scroll to newest messages on send/receive
- 🧹 **Clear Chat** with confirmation and Firestore cleanup
- 🧾 Markdown support with:
  - **Bold**, *Italic*, `Inline code`
  - 📊 Tables
  - 📐 LaTeX math expressions
  - 🎨 Syntax highlighting for code blocks
  - 😃 Emojis!

---

## 📦 Tech Stack

| Tech           | Usage                     |
|----------------|---------------------------|
| Next.js        | Frontend & App Routing    |
| Tailwind CSS   | UI Design and Styling     |
| Firebase       | Auth & Firestore Database |
| Gemini (via Firebase AI) | Chat responses     |
| React Markdown | Rich formatting support   |

---

## 🔧 Setup Instructions

1. **Clone the Repository**

```bash
git clone https://github.com/your-username/gemini-chat-app.git
cd gemini-chat-app
```

2. **Install Dependencies**

```bash
npm install
```

3. **Configure Firebase**

- Create a Firebase project
- Enable:
  - **Authentication**
  - **Firestore Database**
  - **Gemini AI API (firebase/ai)**
- Copy your Firebase config and update `/lib/firebase.js`

4. **Run the Dev Server**

```bash
npm run dev
```

---

## 🧠 Gemini Integration

- Responses are streamed from `@firebase/ai`
- AI messages are persisted to Firestore in `users/{uid}/messages`
- Supports enhanced formatting using `react-markdown`, `rehype-katex`, `remark-gfm`, and `rehype-highlight`.

---

## 📸 Screenshots

| Chat View | Markdown Rendering |
|-----------|--------------------|
| ![Chat](./public/screenshot-chat.png) | ![Markdown](./public/screenshot-markdown.png) |

---

## 🔐 Authentication

Basic Firebase Auth is assumed (Google or Email/Password).
You can extend it as needed using `useAuth()` hook.

---

## 📂 Folder Structure

```
src/
├── app/
│   ├── page.js             // Main chat UI
├── lib/
│   ├── firebase.js         // Firebase setup
│   ├── geminiApi.js        // Gemini fetch logic
│   └── useAuth.js          // Auth context hook
```

---

## ✅ To Do

- [ ] Multi-user support
- [ ] Image/voice input
- [ ] Message reaction system
- [ ] Typing indicator
- [ ] Chat backup/download

---

## 📄 License

MIT © 2025 [Your Name](https://github.com/your-username)
