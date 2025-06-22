import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export async function getUserFromFirestore(uid: string) {
  const docRef = doc(db, 'users', uid)
  const snapshot = await getDoc(docRef)
  if (snapshot.exists()) {
    return snapshot.data()
  }
  return null
}
