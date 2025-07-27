'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useUser } from '@/context/UserContext';
import Image from "next/image";

const avatarStyles = ['thumbs', 'adventurer', 'avataaars', 'fun-emoji', 'bottts'];

export default function ProfilePage() {
  const router = useRouter();
  const [localUser, setLocalUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [avatarStyle, setAvatarStyle] = useState('thumbs');

  const { user: globalUser, setUser: setGlobalUser } = useUser();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        toast.error('Please sign in to access your profile');
        router.push('/auth/login');
      } else {
        setLocalUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        setPhotoURL(currentUser.photoURL || '');

        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setAvatarStyle(data.avatarStyle || 'thumbs');
          setPhotoURL(''); // sync Firestore photoURL
        }

        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleUpdateProfile = async () => {
    try {
      if (!displayName.trim()) {
        toast.error('Username cannot be empty');
        return;
      }

      const currentUid = auth.currentUser.uid;
      const oldUsername = auth.currentUser.displayName;

      // Check for username conflict
      const usernameDoc = await getDoc(doc(db, 'usernames', displayName));
      if (usernameDoc.exists() && usernameDoc.data().uid !== currentUid) {
        toast.error('Username is already taken');
        return;
      }

      // Update username registry
      if (oldUsername && oldUsername !== displayName) {
        await deleteDoc(doc(db, 'usernames', oldUsername));
      }
      await setDoc(doc(db, 'usernames', displayName), { uid: currentUid });

      // Save avatar style and photoURL to Firestore
      await setDoc(
        doc(db, 'users', currentUid),
        {
          avatarStyle,
          photoURL,
        },
        { merge: true }
      );

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName,
        photoURL: `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${displayName}`,
      });

      // Update global context
      setGlobalUser((prev) => ({
        ...prev,
        displayName,
        photoURL: `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${displayName}`,
        avatarStyle,
      }));

      toast.success('Profile updated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    }
  };

  const logout = async () => {
    await auth.signOut();
    router.push('/');
  };

  if (loading) return <p className="text-center mt-20">Loading profile...</p>;

  return (
    <div className="h-[90vh] flex flex-col bg-gray-900">
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-gray-800 p-6 rounded shadow-lg w-full max-w-md">
          <h2 className="text-xl font-bold mb-2 text-white text-center">
            Welcome, {displayName || 'User'}!
          </h2>

          <Image
            src={
              photoURL ||
              `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${displayName || 'guest'}`
            }
            alt="avatar"
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2"
            width={40} 
            height={40}
          />

          <p className="text-center text-white text-sm mb-4">Email: {localUser?.email}</p>

          <div className="space-y-3 mt-4">
            <input
              type="text"
              placeholder="Username"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-2 border rounded text-white bg-gray-700"
            />

            <input
              type="text"
              placeholder="Photo URL (optional)"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              className="w-full p-2 border rounded text-white bg-gray-700"
            />

            <select
              value={avatarStyle}
              onChange={(e) => setAvatarStyle(e.target.value)}
              className="w-full p-2 border rounded text-white bg-gray-700"
            >
              {avatarStyles.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>

            <button
              onClick={handleUpdateProfile}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              Save Changes
            </button>

            <button
              onClick={logout}
              className="w-full mt-2 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
