// videoProgress.ts
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function saveVideoProgress(
  userId: string,
  videoId: string,
  position: number
) {
  const progressDocRef = doc(db, "videoProgress", `${userId}_${videoId}`);

  await setDoc(
    progressDocRef,
    {
      userId,
      videoId,
      position,
      lastUpdated: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getVideoProgress(
  userId: string,
  videoId: string
): Promise<number> {
  const progressDocRef = doc(db, "videoProgress", `${userId}_${videoId}`);
  const docSnap = await getDoc(progressDocRef);
  if (docSnap.exists()) {
    return docSnap.data().position as number;
  }
  return 0;
}
