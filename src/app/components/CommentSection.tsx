"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Send } from "lucide-react";
import { Comment } from "types/comment";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/components/UserContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type CommentSectionProps = {
  comments: Comment[];
  currentVideoId: string;
  artistSongName: string;
  onClose: () => void;
};

export function CommentSection({
  comments,
  currentVideoId,
  artistSongName,
  onClose,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [renderComments, setRenderComments] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    setRenderComments(true);
  }, []);

  const sendComment = async () => {
    if (!newComment.trim() || !currentVideoId || !user?.uid) return;

    try {
      const commentsRef = collection(db, "videos", currentVideoId, "comments");
      await addDoc(commentsRef, {
        userID: user.uid,
        userName: user.name,
        userProfileImage: user.image,
        text: newComment.trim(),
        timestamp: serverTimestamp(),
      });
      setNewComment("");
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
    }
  };

  const handleClose = () => {
    setRenderComments(false);
    onClose();
  };

  if (!renderComments) return null;

  return (
    <div
      className="p-3 position-relative"
      style={{
        height: "40vh",
        overflowY: "auto",
        backgroundColor: "#000",
        color: "#fff",
      }}
    >
      {/* Botão de fechar */}
      <button
        onClick={handleClose}
        className="position-absolute top-0 end-0 m-2 btn btn-sm rounded-circle"
        style={{
          width: "32px",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          color: "#fff",
          border: "1px solid #000",
          padding: 0,
        }}
        aria-label="Fechar comentários"
      >
        ×
      </button>

      <h5 className="mb-3">
        Comentários sobre{" "}
        <span className="text-info">{artistSongName || "o vídeo"}</span>
      </h5>

      <div className="mb-3" style={{ maxHeight: "25vh", overflowY: "auto" }}>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="mb-2 d-flex align-items-start">
              <Image
                src={comment.userProfileImage}
                alt={comment.userName}
                width={40}
                height={40}
                className="rounded-circle me-2"
                style={{ objectFit: "cover", border: "1px solid #000" }}
              />
              <div>
                <strong>{comment.userName}</strong>
                <p className="mb-0">{comment.text}</p>
                <small className="text-muted">
                  {formatDistanceToNow(comment.timestamp.toDate(), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </small>
              </div>
            </div>
          ))
        ) : (
          <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
        )}
        <div ref={commentsEndRef} />
      </div>

      {user ? (
        <div className="d-flex align-items-center">
          <input
            type="text"
            className="form-control text-white"
            style={{
              backgroundColor: "#000",
              border: "1px solid white",
              outline: "none",
              boxShadow: "none",
              borderRadius: "9999px",
            }}
            placeholder="Adicione um comentário..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendComment()}
          />
          <button
            onClick={sendComment}
            className="btn btn-primary ms-2"
            style={{
              border: "1px solid #000",
              boxShadow: "none",
            }}
            disabled={!newComment.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      ) : (
        <div
          className="d-flex align-items-center justify-content-center py-2 gap-2"
          style={{ backgroundColor: "#000", color: "#fff" }}
        >
          <p className="mb-0">Precisa fazer login para comentar</p>
          <button
            className="btn btn-primary btn-sm"
            style={{ border: "1px solid #000", boxShadow: "none" }}
            onClick={() => router.push("/login")}
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
}
