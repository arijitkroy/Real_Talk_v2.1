"use client";

import Cropper from "react-easy-crop";
import { useState, useCallback } from "react";
import getCroppedImg from "@/utils/cropImage";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useUser } from "@/context/UserContext";
import toast from "react-hot-toast";

export default function ImageCropModal({ imageUrl, onClose, onCropDone }) {
  const { user } = useUser();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels);
      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        photoURL: croppedImage, // base64 string
      });

      onCropDone(croppedImage);
      toast.success("Profile picture updated!");
      onClose();
    } catch (err) {
      console.error("Crop error:", err);
      toast.error("Failed to crop image");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 max-w-lg w-full">
        <div className="relative w-full aspect-square bg-black">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>
          <button onClick={handleCrop} className="px-4 py-2 bg-blue-600 text-white rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}