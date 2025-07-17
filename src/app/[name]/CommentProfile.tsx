"use client";
import { serverTimestamp } from "firebase/firestore";
import React, { useEffect, useState, useCallback } from "react";
import {
  collection,
  getDocs,
  addDoc,
  orderBy,
  query,
  Timestamp,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "../components/UserContext";
import Link from "next/link";
import Image from "next/image";

export type Comment = {
  id: string;
  userID: string;
  userName: string;
  userProfileImage: string;
  text: string;
  timestamp: Timestamp | null;
  replies?: Comment[];
};

interface CommentProfileProps {
  profileUid: string;
}

export default function CommentProfile({ profileUid }: CommentProfileProps) {
  const { user } = useUser();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newReply, setNewReply] = useState("");
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 5;

  const loadComments = useCallback(
    async (isInitialLoad = false) => {
      if (!hasMore && !isInitialLoad) return;
      isInitialLoad ? setLoadingComments(true) : setLoadingMore(true);

      try {
        const commentsRef = collection(db, "users", profileUid, "comments");
        let q = query(
          commentsRef,
          orderBy("timestamp", "desc"),
          limit(PAGE_SIZE)
        );

        if (lastDoc && !isInitialLoad) {
          q = query(
            commentsRef,
            orderBy("timestamp", "desc"),
            startAfter(lastDoc),
            limit(PAGE_SIZE)
          );
        }

        const snapshot = await getDocs(q);
        const newComments = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            userID: data.userID,
            userName: data.userName,
            userProfileImage: data.userProfileImage || "/default-profile.png",
            text: data.text,
            timestamp: data.timestamp,
            replies: data.replies || [],
          } as Comment;
        });

        setComments((prev) =>
          isInitialLoad ? newComments : [...prev, ...newComments]
        );

        if (snapshot.docs.length < PAGE_SIZE) setHasMore(false);
        else setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      } catch (err) {
        console.error("Erro ao carregar comentários:", err);
        setError("Erro ao carregar comentários.");
      }

      isInitialLoad ? setLoadingComments(false) : setLoadingMore(false);
    },
    [hasMore, lastDoc, profileUid]
  );

  const resetAndLoadComments = useCallback(async () => {
    setComments([]);
    setLastDoc(null);
    setHasMore(true);
    await loadComments(true);
  }, [loadComments]);

  useEffect(() => {
    if (!profileUid) return;
    resetAndLoadComments();
  }, [profileUid, resetAndLoadComments]);

  async function handleCommentSubmit() {
    if (!user) {
      setError("Você precisa estar logado para comentar.");
      return;
    }
    if (!newComment.trim()) {
      setError("Comentário vazio não é permitido.");
      return;
    }
    setError("");

    try {
      const commentsRef = collection(db, "users", profileUid, "comments");
      await addDoc(commentsRef, {
        userID: user.uid,
        userName: user.name,
        userProfileImage: user.image || "/default-profile.png",
        text: newComment.trim(),
        timestamp: serverTimestamp(),
        replies: [],
      });

      setNewComment("");
      resetAndLoadComments();
    } catch (err) {
      console.error("Erro ao enviar comentário:", err);
      setError("Erro ao enviar comentário. Tente novamente.");
    }
  }

  async function handleReplySubmit(parentCommentId: string) {
    if (!user) {
      setError("Você precisa estar logado para responder.");
      return;
    }
    if (!newReply.trim()) {
      setError("Resposta vazia não é permitida.");
      return;
    }
    setError("");

    try {
      const commentDocRef = doc(
        db,
        "users",
        profileUid,
        "comments",
        parentCommentId
      );
      const commentDocSnapshot = await getDoc(commentDocRef);

      if (!commentDocSnapshot.exists()) {
        setError("Comentário pai não encontrado.");
        return;
      }

      const commentData = commentDocSnapshot.data();
      const currentReplies: Comment[] = commentData?.replies || [];

      const newReplyObj: Comment = {
        id: Math.random().toString(36).substring(2, 15),
        userID: user.uid,
        userName: user.name,
        userProfileImage: user.image || "/default-profile.png",
        text: newReply.trim(),
        timestamp: Timestamp.now(),
        replies: [],
      };

      const updatedReplies = [...currentReplies, newReplyObj];

      await updateDoc(commentDocRef, { replies: updatedReplies });

      setNewReply("");
      setReplyingTo(null);
      resetAndLoadComments();
    } catch (err) {
      console.error("Erro ao enviar resposta:", err);
      setError("Erro ao enviar resposta. Tente novamente.");
    }
  }

  return (
    <section style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
      <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Comentários</h3>

      {loadingComments ? (
        <p>Carregando comentários...</p>
      ) : comments.length === 0 ? (
        <p>Nenhum comentário ainda.</p>
      ) : (
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {comments.map((comment) => (
            <li
              key={comment.id}
              style={{
                backgroundColor: "transparent",
                border: "1px solid white",
                borderRadius: "12px",
                padding: "1rem",
                marginBottom: "1rem",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                color: "rgb(255, 255, 255)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <Image
                  src={comment.userProfileImage}
                  alt={comment.userName}
                  width={48}
                  height={48}
                  style={{
                    borderRadius: "50%",
                    border: "2px solid  rgb(255, 255, 255)",
                    boxShadow: "0 0 5px rgba(0,0,0,0.1)",
                    objectFit: "cover",
                    width: "48px",
                    height: "48px",
                    display: "block",
                  }}
                />
                <strong>{comment.userName}</strong>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "0.8rem",
                    color: "#666",
                  }}
                >
                  {comment.timestamp?.toDate().toLocaleString()}
                </span>
              </div>
              <p style={{ marginLeft: "3.5rem", marginTop: "0.5rem" }}>
                {comment.text}
              </p>

              {user && (
                <button
                  onClick={() =>
                    setReplyingTo(replyingTo === comment.id ? null : comment.id)
                  }
                  style={{
                    marginLeft: "3.5rem",
                    fontSize: "0.8rem",
                    marginTop: "0.25rem",
                    background: "transparent",
                    color: "#0070f3",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {replyingTo === comment.id ? "Cancelar" : "Responder"}
                </button>
              )}

              {replyingTo === comment.id && user && (
                <div style={{ marginLeft: "3.5rem", marginTop: "0.5rem" }}>
                  <textarea
                    rows={2}
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Escreva sua resposta..."
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      resize: "vertical",
                    }}
                  />
                  <button
                    onClick={() => handleReplySubmit(comment.id)}
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.4rem 0.9rem",
                      backgroundColor: "#10b981",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                    }}
                  >
                    Enviar resposta
                  </button>
                </div>
              )}

              {comment.replies && comment.replies.length > 0 && (
                <ul
                  style={{
                    listStyle: "none",
                    paddingLeft: "3.5rem",
                    marginTop: "1rem",
                  }}
                >
                  {comment.replies.map((reply) => (
                    <li
                      key={reply.id}
                      style={{
                        marginBottom: "1rem",
                        backgroundColor: "transparent",
                        border: "1px solid white",
                        borderRadius: "12px",
                        padding: "1rem",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        color: "rgb(255, 255, 255)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        <Image
                          src={reply.userProfileImage}
                          alt={reply.userName}
                          width={48}
                          height={48}
                          style={{
                            borderRadius: "50%",
                            border: "2px solid rgb(255, 255, 255)",
                            boxShadow: "0 0 5px rgba(0,0,0,0.1)",
                            objectFit: "cover",
                            width: "48px",
                            height: "48px",
                            display: "block",
                          }}
                        />
                        <strong>{reply.userName}</strong>
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: "0.8rem",
                            color: "#666",
                          }}
                        >
                          {reply.timestamp instanceof Timestamp
                            ? reply.timestamp.toDate().toLocaleString()
                            : "Data desconhecida"}
                        </span>
                      </div>
                      <p style={{ marginLeft: "3.5rem", marginTop: "0.5rem" }}>
                        {reply.text}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      {hasMore && !loadingComments && (
        <button
          onClick={() => loadComments()}
          disabled={loadingMore}
          style={{
            marginTop: "1rem",
            padding: "0.6rem 1.2rem",
            backgroundColor: "#6366f1",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loadingMore ? "Carregando..." : "Carregar mais"}
        </button>
      )}

      {user ? (
        <div style={{ position: "relative", marginBottom: "1rem" }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva um comentário..."
            rows={1}
            style={{
              width: "100%",
              height: "44px",
              padding: "0 4.5rem 0 1rem",
              borderRadius: "9999px",
              border: "1px solid #ccc",
              resize: "none",
              fontSize: "1rem",
              lineHeight: "44px",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={handleCommentSubmit}
            style={{
              position: "absolute",
              top: "5px",
              right: "5px",
              height: "34px",
              padding: "0 1rem",
              backgroundColor: "#0070f3",
              color: "#fff",
              border: "none",
              borderRadius: "9999px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "0.9rem",
              whiteSpace: "nowrap",
            }}
          >
            Enviar
          </button>
          {error && (
            <p style={{ color: "red", marginTop: "0.5rem" }}>{error}</p>
          )}
        </div>
      ) : (
        <p>
          Você precisa{" "}
          <Link
            href="/login"
            style={{ color: "#0070f3", textDecoration: "underline" }}
          >
            fazer login
          </Link>{" "}
          para comentar.
        </p>
      )}
    </section>
  );
}
