"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, UserPlus, UserMinus } from "lucide-react";
import { MarkerData } from "types/markerTypes";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
} from "firebase/firestore";

type Props = {
  user: MarkerData;
  onClose: () => void;
};

const CustomInfoWindowUser: React.FC<Props> = ({ user, onClose }) => {
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (userAuth) => {
      if (userAuth) {
        setCurrentUid(userAuth.uid);

        if (userAuth.uid !== user.id) {
          const followerDocRef = doc(
            db,
            "users",
            user.id,
            "followers",
            userAuth.uid
          );
          const docSnap = await getDoc(followerDocRef);
          setIsFollowing(docSnap.exists());
        }

        const followersSnap = await getDocs(
          collection(db, "users", user.id, "followers")
        );
        setFollowersCount(followersSnap.size);

        const followingSnap = await getDocs(
          collection(db, "users", user.id, "following")
        );
        setFollowingCount(followingSnap.size);
      } else {
        setCurrentUid(null);
        setIsFollowing(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.id]);

  const toggleFollow = async () => {
    if (!currentUid) return;

    const followerRef = doc(db, "users", user.id, "followers", currentUid);
    const followingRef = doc(db, "users", currentUid, "following", user.id);

    try {
      const followerSnap = await getDoc(followerRef);

      if (followerSnap.exists()) {
        await deleteDoc(followerRef);
        await deleteDoc(followingRef);
        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);
      } else {
        await setDoc(followerRef, {});
        await setDoc(followingRef, {});
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Erro ao seguir/deixar de seguir:", error);
    }
  };

  const openGoogleMaps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLat = position.coords.latitude;
          const currentLng = position.coords.longitude;
          const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentLat},${currentLng}&destination=${user.latitude},${user.longitude}&travelmode=driving`;
          window.open(mapsUrl, "_blank");
        },
        (err) => {
          alert("Erro ao obter sua localização.");
          console.error(err);
        }
      );
    } else {
      alert("Geolocalização não suportada.");
    }
  };

  return (
    <div className="relative p-4 rounded-2xl w-[300px] bg-white/40 text-black shadow-xl border border-white/40 backdrop-blur-md">
      {/* Botão fechar */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-xl font-bold"
        aria-label="Fechar"
      >
        ×
      </button>

      <div className="flex gap-4 items-center">
        {/* Avatar */}
        <Link href={`/${user.namePage}`} className="shrink-0">
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              overflow: "hidden",
              border:
                currentUid === user.id ? "3px solid red" : "3px solid #2ecc71",
              boxShadow: "0 0 5px rgba(0,0,0,0.3)",
              backgroundColor: "#fff",
            }}
          >
            <Image
              src={user.image ?? "/default-avatar.png"}
              alt={user.namePage}
              width={60}
              height={60}
              style={{ objectFit: "cover" }}
            />
          </div>
        </Link>

        {/* Info */}
        <div className="flex flex-col overflow-hidden w-full">
          <h4 className="text-lg font-semibold truncate">{user.namePage}</h4>
          {user.email && (
            <p className="text-xs text-gray-700 break-words">{user.email}</p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={openGoogleMaps}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-full shadow transition"
            >
              <MapPin size={14} />
            </button>

            {currentUid && currentUid !== user.id && (
              <button
                onClick={toggleFollow}
                className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full shadow transition ${
                  isFollowing
                    ? "bg-gray-500 hover:bg-gray-600"
                    : "bg-green-600 hover:bg-green-700"
                } text-white`}
              >
                {isFollowing ? <UserMinus size={14} /> : <UserPlus size={14} />}
                {isFollowing ? "Seguindo" : "Seguir"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contadores */}
      {!loading && (
        <div className="mt-4 flex justify-between items-center gap-2">
          <div className="flex-1 bg-white/20 rounded-lg py-2 flex flex-col items-center shadow-inner">
            <div className="text-base font-bold text-black">
              {followersCount}
            </div>
            <span className="text-[10px] text-gray-700">Seguidores</span>
          </div>
          <div className="flex-1 bg-white/20 rounded-lg py-2 flex flex-col items-center shadow-inner">
            <div className="text-base font-bold text-black">
              {followingCount}
            </div>
            <span className="text-[10px] text-gray-700">Seguindo</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomInfoWindowUser;
