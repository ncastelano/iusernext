import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function saveVideoProgress(
  userId: string,
  videoId: string,
  time: number
) {
  const progressRef = doc(db, "users", userId, "progress", videoId);
  await setDoc(progressRef, { time }, { merge: true });
}

export async function getVideoProgress(
  userId: string,
  videoId: string
): Promise<number> {
  const progressRef = doc(db, "users", userId, "progress", videoId);
  const snapshot = await getDoc(progressRef);
  const data = snapshot.data();
  return data?.time ?? 0;
}
