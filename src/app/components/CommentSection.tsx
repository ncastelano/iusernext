"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Send, X } from "lucide-react";
import { Comment } from "types/comment";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/components/UserContext";

type CommentSectionProps = {
  comments: Comment[];
  currentVideoId: string;
  onClose: () => void;
};

export function CommentSection({
  comments,
  currentVideoId,
  onClose,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useUser();

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

  // Controla o fechamento com animação
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Tempo da animação
  };

  return (
    <>
      <div
        className={`bg-dark text-white p-3 position-relative ${
          isClosing ? "comment-slide-down" : "comment-slide-up"
        }`}
        style={{
          height: "40vh",
          overflowY: "auto",
          borderTop: "1px solid #333",
        }}
      >
        {/* Botão de fechar */}
        <button
          onClick={handleClose}
          className="position-absolute top-0 end-0 m-2 btn btn-sm btn-outline-light rounded-circle"
          style={{
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Fechar comentários"
        >
          <X size={18} />
        </button>

        <h5 className="mb-3">Comentários</h5>

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
                  style={{ objectFit: "cover" }}
                />
                <div>
                  <strong>{comment.userName}</strong>
                  <p className="mb-0">{comment.text}</p>
                  <small className="text-muted">
                    {comment.timestamp
                      ? new Date(comment.timestamp).toLocaleString()
                      : "Agora"}
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
              className="form-control bg-secondary text-white border-0"
              placeholder="Adicione um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendComment()}
            />
            <button
              onClick={sendComment}
              className="btn btn-primary ms-2"
              disabled={!newComment.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        ) : (
          <div className="d-flex align-items-center justify-content-center py-2 gap-2">
            <p className="mb-0">Precisa fazer login para comentar</p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => router.push("/login")}
            >
              Login
            </button>
          </div>
        )}
      </div>

      {/* Animações via CSS global */}
      <style>
        {`
    @keyframes slideUpFadeIn {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0%);
        opacity: 1;
      }
    }

    @keyframes slideDownFadeOut {
      from {
        transform: translateY(0%);
        opacity: 1;
      }
      to {
        transform: translateY(100%);
        opacity: 0;
      }
    }

    .comment-slide-up {
      animation: slideUpFadeIn 0.3s ease-out forwards;
    }

    .comment-slide-down {
      animation: slideDownFadeOut 0.3s ease-in forwards;
    }
  `}
      </style>
    </>
  );
}
