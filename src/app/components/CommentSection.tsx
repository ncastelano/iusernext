import Image from "next/image";
import { Comment } from "types/comment";

export const CommentsSection = ({
  comments,
  loading,
  onSubmit,
}: {
  comments: Comment[];
  loading: boolean;
  onSubmit: (text: string) => void;
}) => {
  return (
    <div
      style={{
        background: "#111",
        padding: "1rem",
        color: "#fff",
        maxHeight: "40vh",
        overflowY: "auto",
      }}
    >
      {loading ? (
        <p>Carregando comentários...</p>
      ) : comments.length === 0 ? (
        <p>Seja o primeiro a comentar!</p>
      ) : (
        comments.map((comment) => (
          <div
            key={comment.id}
            style={{ marginBottom: "1rem", display: "flex", gap: "0.75rem" }}
          >
            {comment.userProfileImage ? (
              <Image
                src={comment.userProfileImage}
                alt={comment.userName}
                width={40}
                height={40}
                style={{ borderRadius: "50%" }}
              />
            ) : (
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: "#555",
                  borderRadius: "50%",
                  color: "#ccc",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                ?
              </div>
            )}
            <div>
              <strong>{comment.userName}</strong>
              <p>{comment.text}</p>
            </div>
          </div>
        ))
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const input = form.elements.namedItem("comment") as HTMLInputElement;
          const value = input.value.trim();
          if (!value) return;
          onSubmit(value);
          input.value = "";
        }}
        style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}
      >
        <input
          name="comment"
          placeholder="Digite seu comentário..."
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Enviar
        </button>
      </form>
    </div>
  );
};
