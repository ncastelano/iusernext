import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// Defina os campos que você espera no Firestore:
interface UserDataFromFirestore {
  name: string;
  username?: string | null;
  namePage?: string | null;
  image: string;
  latitude: number;
  longitude: number;
  visible: boolean;
}

export async function getUserFromFirestore(
  uid: string
): Promise<UserDataFromFirestore | null> {
  try {
    const docRef = doc(db, "users", uid);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data() as UserDataFromFirestore;

      // Validação básica (exemplo: garantir que pelo menos o nome existe)
      if (!data.name || !data.image) {
        console.warn(
          `Usuário com uid ${uid} tem dados incompletos no Firestore.`
        );
        return null;
      }

      return data;
    } else {
      console.warn(`Usuário com uid ${uid} não encontrado no Firestore.`);
      return null;
    }
  } catch (error) {
    console.error(`Erro ao buscar usuário ${uid} do Firestore:`, error);
    return null;
  }
}
