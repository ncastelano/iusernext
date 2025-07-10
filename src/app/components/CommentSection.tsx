"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Send, X } from "lucide-react";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/components/UserContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type Comment = {
  id: string;
  userID: string;
  userName: string;
  userProfileImage: string;
  text: string;
  timestamp: any;
  replies?: Comment[]; // <- agora é opcional
};

type CommentSectionProps = {
  currentVideoId: string;
  artistSongName: string;
  onClose: () => void;
  comments: Comment[];
};

function useCommentsWithReplies(videoId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!videoId) return;

    async function fetchComments() {
      setLoading(true);

      try {
        const commentsSnapshot = await getDocs(
          collection(db, "videos", videoId, "comments")
        );

        const commentsWithReplies: Comment[] = [];

        for (const commentDoc of commentsSnapshot.docs) {
          const commentData = commentDoc.data();

          const repliesSnapshot = await getDocs(
            collection(
              db,
              "videos",
              videoId,
              "comments",
              commentDoc.id,
              "replies"
            )
          );

          const replies = repliesSnapshot.docs.map((replyDoc) => ({
            id: replyDoc.id,
            ...(replyDoc.data() as Omit<Comment, "id" | "replies">),
          }));

          commentsWithReplies.push({
            id: commentDoc.id,
            ...(commentData as Omit<Comment, "id" | "replies">),
            replies,
          });
        }

        setComments(commentsWithReplies);
      } catch (error) {
        console.error("Erro ao buscar comentários e respostas:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchComments();
  }, [videoId]);

  return { comments, loading };
}

export function CommentSection({
  currentVideoId,
  artistSongName,
  onClose,
}: CommentSectionProps) {
  const { user } = useUser();
  const router = useRouter();

  const { comments, loading } = useCommentsWithReplies(currentVideoId);

  const [newComment, setNewComment] = useState("");
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showRepliesFor, setShowRepliesFor] = useState<string | null>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

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

  const sendReply = async (parentCommentId: string) => {
    if (!replyText.trim() || !user?.uid) return;

    try {
      const repliesRef = collection(
        db,
        "videos",
        currentVideoId,
        "comments",
        parentCommentId,
        "replies"
      );
      await addDoc(repliesRef, {
        userID: user.uid,
        userName: user.name,
        userProfileImage: user.image,
        text: replyText.trim(),
        timestamp: serverTimestamp(),
      });
      setReplyText("");
      setReplyToCommentId(null);
      setShowRepliesFor(parentCommentId);
    } catch (error) {
      console.error("Erro ao enviar resposta:", error);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (loading) {
    return (
      <div
        className="p-3"
        style={{ height: "40vh", backgroundColor: "#000", color: "#fff" }}
      >
        <p>Carregando comentários...</p>
      </div>
    );
  }

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
            <div key={comment.id} className="mb-3">
              <div className="d-flex align-items-start mb-1">
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
                  <p className="mb-1">{comment.text}</p>
                  <small className="text-muted">
                    {comment.timestamp
                      ? formatDistanceToNow(comment.timestamp.toDate(), {
                          addSuffix: true,
                          locale: ptBR,
                        })
                      : "Agora mesmo"}
                  </small>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 mb-1">
                {user && (
                  <button
                    className="btn btn-sm text-info"
                    onClick={() =>
                      setReplyToCommentId(
                        replyToCommentId === comment.id ? null : comment.id
                      )
                    }
                  >
                    Responder
                  </button>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <button
                    className="btn btn-sm text-info"
                    onClick={() =>
                      setShowRepliesFor(
                        showRepliesFor === comment.id ? null : comment.id
                      )
                    }
                  >
                    {comment.replies.length}{" "}
                    {comment.replies.length === 1 ? "resposta" : "respostas"}
                  </button>
                )}
              </div>

              {showRepliesFor === comment.id && comment.replies && (
                <div
                  style={{
                    maxHeight: 400,
                    overflowY: "auto",
                    border: "1px solid #444",
                    borderRadius: 8,
                    padding: "8px 12px",
                    marginBottom: "12px",
                    backgroundColor: "#111",
                  }}
                >
                  {comment.replies.slice(0, 5).map((reply) => (
                    <div
                      key={reply.id}
                      className="d-flex align-items-start mb-2"
                    >
                      <Image
                        src={reply.userProfileImage}
                        alt={reply.userName}
                        width={30}
                        height={30}
                        className="rounded-circle me-2"
                        style={{ objectFit: "cover", border: "1px solid #000" }}
                      />
                      <div>
                        <strong>{reply.userName}</strong>
                        <p className="mb-1" style={{ fontSize: "0.9rem" }}>
                          {reply.text}
                        </p>
                        <small className="text-muted">
                          {reply.timestamp
                            ? formatDistanceToNow(reply.timestamp.toDate(), {
                                addSuffix: true,
                                locale: ptBR,
                              })
                            : "Agora mesmo"}
                        </small>
                      </div>
                    </div>
                  ))}
                  {comment.replies.length > 5 && (
                    <small className="text-muted">
                      ...e mais {comment.replies.length - 5} respostas
                    </small>
                  )}
                </div>
              )}

              {replyToCommentId === comment.id && (
                <div className="mt-2 d-flex align-items-center">
                  <input
                    type="text"
                    className="form-control text-white"
                    style={{
                      backgroundColor: "#000",
                      border: "1px solid white",
                      borderRadius: "9999px",
                    }}
                    placeholder="Escreva sua resposta..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <button
                    className="btn btn-primary ms-2 d-flex align-items-center justify-content-center"
                    style={{ width: "36px", height: "36px" }}
                    onClick={() => sendReply(comment.id)}
                  >
                    <Send size={18} />
                  </button>
                  <button
                    className="btn btn-danger ms-2 d-flex align-items-center justify-content-center"
                    style={{ width: "36px", height: "36px" }}
                    onClick={() => {
                      setReplyToCommentId(null);
                      setReplyText("");
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
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
