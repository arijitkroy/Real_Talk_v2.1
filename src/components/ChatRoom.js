"use client";

import Link from "next/link";

export default function Chatroom({ id, name }) {
  return (
    <Link
      href={`/chat/${id}`}
      className="block bg-white hover:bg-violet-50 shadow p-4 rounded-lg transition duration-150 border"
    >
      <h2 className="text-lg font-semibold text-violet-700">{name}</h2>
      <p className="text-sm text-gray-500">Click to join this room</p>
    </Link>
  );
}