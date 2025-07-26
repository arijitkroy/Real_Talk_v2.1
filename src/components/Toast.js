import { Toaster } from "react-hot-toast";

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        success: {
          style: {
            background: "#4ade80",
            color: "white",
          },
        },
        error: {
          style: {
            background: "#f87171",
            color: "white",
          },
        },
      }}
    />
  );
}