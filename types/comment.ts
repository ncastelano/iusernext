import { Timestamp } from "firebase/firestore";

export type Comment = {
  id: string;
  userId: string;
  userName: string;
  userProfileImage: string;
  text: string;
  timestamp: Timestamp;
};
