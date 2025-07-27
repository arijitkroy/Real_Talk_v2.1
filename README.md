# 💬 Real Talk — Gemini + Chatroom App

A feature-rich chat platform built with **Next.js**, **Tailwind CSS**, **Firebase**, and **Firebase Gemini AI**.  
Supports both **real-time chatrooms with real users** and **one-on-one conversations with Gemini AI**.

---

## ✨ Features

### 🤖 Gemini AI Chat
- 🔥 Powered by **Firebase Gemini AI**
- 📄 Markdown support (tables, code, math, etc.)
- 🧠 Streaming responses with typing indicator
- 🗑️ Clear chat history (with Firestore cleanup)
- 💾 Auto-save messages in Firestore
- ⬇️ Auto-scroll to latest message

### 👥 Real-Time Chatrooms
- 🏷️ Create or join rooms with unique codes
- 👨‍👩‍👧 Live member count and presence
- 📝 Send and receive messages in real time
- 📌 Room ID copy button for easy sharing
- 🚪 Join/leave notifications shown in chat
- 🔐 Duplicate room names not allowed
- 🧹 Clean UI with auto-scroll and separators

### 🎨 Design & UX
- 🌓 Dark mode default
- 🪄 DiceBear avatar selection + preview
- 📱 Fully responsive on mobile and desktop

---

## 📦 Tech Stack

| Tech                 | Purpose                         |
|----------------------|----------------------------------|
| **Next.js**          | App framework & routing         |
| **Tailwind CSS**     | Styling                         |
| **Firebase**         | Auth, Firestore, Realtime Sync  |
| **Firebase Gemini AI** | Gemini model integration      |
| **React Markdown**   | Message formatting              |

---

## 🚀 How to Use the App

### 🔐 Authentication
- Log in using your Google account (via Firebase Auth)
- Your identity will be linked with chatroom activity and AI chat history

### 💬 Chat with Gemini AI
1. Go to the **Gemini Chat** page
2. Start typing and press `Send` or hit `Enter`
3. Watch Gemini respond live (streamed)
4. You can clear messages using the "Clear Chat" button

### 👥 Chatroom Mode
1. Navigate to the **Chatroom Lobby**
2. Either:
   - Create a new room with a unique name, or
   - Join using an existing room code
3. You'll be redirected to the room where:
   - You can chat with others in real-time
   - Messages are updated live via Firestore
   - Join/leave alerts are displayed in chat
   - Member count is shown and updates in real-time
   - Room ID is easily copyable from the top right

---

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/real-talk.git
cd real-talk
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Configuration

- Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- Enable:
  - **Authentication (Google Sign-In)**
  - **Cloud Firestore**
  - **Firebase Gemini AI** (`firebase/ai`)
- Copy your Firebase config into `/lib/firebase.js`

### 4. Run the App Locally

```bash
npm run dev
```

---

## 📐 Markdown + LaTeX Support

This app supports enhanced rendering of:
- **Bold**, *Italic*, `inline code`
- ```js
  Code blocks
  ```
- 📊 Tables
- 📐 LaTeX expressions (`$E = mc^2$`)
- 😄 Emojis

Powered by:
- `react-markdown`
- `remark-gfm`
- `rehype-katex`
- `rehype-highlight`

---

## ✅ To-Do

- [ ] Typing indicator in chatroom
- [ ] Room privacy & password protection
- [ ] Media sharing (images, audio)
- [ ] Downloadable chat history
- [ ] Message reactions
- [ ] Push notifications

---

## 🧠 Credits

- Gemini AI via `@firebase/ai`
- Avatars via [DiceBear Avatars](https://www.dicebear.com)
- Markdown rendering powered by React Markdown + plugins

---

## 📄 License

MIT © 2025 [Arijit Kumar Roy](https://github.com/arijitkroy)

---

**Happy chatting! 💬**
