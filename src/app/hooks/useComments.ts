import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  DocumentSnapshot,
  QuerySnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Comment } from "types/comment";

export function useComments(videoId: string, enabled: boolean) {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!enabled || !videoId) return;

    const commentsRef = collection(db, "videos", videoId, "comments");
    const q = query(commentsRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot) => {
      setComments(
        snapshot.docs.map((doc: DocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
        })) as Comment[]
      );
    });

    return unsubscribe;
  }, [enabled, videoId]);

  return { comments };
}
