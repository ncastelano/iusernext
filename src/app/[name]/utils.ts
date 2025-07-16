"use client";

import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Atualiza followList e followerList em ambas as direções.
 * @param targetUid UID do usuário a ser seguido/desseguido
 * @param currentUid UID do usuário logado
 * @param isFollowing booleano indicando se já está seguindo
 */
export async function followOrUnfollow(
  targetUid: string,
  currentUid: string,
  isFollowing: boolean
): Promise<"followed" | "unfollowed" | "error"> {
  const currentUserRef = doc(db, "users", currentUid);
  const targetUserRef = doc(db, "users", targetUid);

  try {
    if (isFollowing) {
      // 🚫 Deixar de seguir
      await updateDoc(currentUserRef, {
        followList: arrayRemove(targetUid),
      });

      await updateDoc(targetUserRef, {
        followerList: arrayRemove(currentUid),
      });

      return "unfollowed";
    } else {
      // ✅ Seguir
      await updateDoc(currentUserRef, {
        followList: arrayUnion(targetUid),
      });

      await updateDoc(targetUserRef, {
        followerList: arrayUnion(currentUid),
      });

      return "followed";
    }
  } catch (error) {
    console.error("Erro ao seguir/desseguir:", error);
    return "error";
  }
}
