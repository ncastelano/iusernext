import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { notFound } from "next/navigation";
import UserProfileClient from "src/app/components/UserProfileClient";
import { User } from "types/user";
import { Video } from "types/video";

interface PageProps {
  params: {
    name: string;
  };
}

export default async function UserProfilePage({ params }: PageProps) {
  const { name } = params;
  const decodedName = decodeURIComponent(name);

  const usersRef = collection(db, "users");
  const qUser = query(usersRef, where("name", "==", decodedName));
  const userSnapshot = await getDocs(qUser);

  if (userSnapshot.empty) return notFound();

  const user = userSnapshot.docs[0].data() as User;

  const safeUser = {
    ...user,
    latitude: typeof user.latitude === "number" ? user.latitude : null,
    longitude: typeof user.longitude === "number" ? user.longitude : null,
    visible: typeof user.visible === "boolean" ? user.visible : false,
  };

  const videosRef = collection(db, "videos");
  const qVideos = query(videosRef, where("userID", "==", user.uid));
  const videosSnapshot = await getDocs(qVideos);

  const videos: Video[] = videosSnapshot.docs.map((doc) => ({
    ...(doc.data() as Video),
    videoID: doc.id,
  }));

  return <UserProfileClient safeUser={safeUser} videos={videos} />;
}
