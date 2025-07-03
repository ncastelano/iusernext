import { useComments } from "@/app/hooks/useComments";

type Props = {
  videoId: string;
  onClose: () => void;
};

export function CommentModal({ videoId, onClose }: Props) {
  const { comments } = useComments(videoId, true);

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 text-white d-flex flex-column"
      style={{ zIndex: 200 }}
    >
      <div className="p-3 d-flex justify-content-between align-items-center border-bottom border-light">
        <h5>Comentários</h5>
        <button onClick={onClose} className="btn btn-sm btn-light">
          Fechar
        </button>
      </div>

      <div className="flex-grow-1 overflow-auto p-3">
        {comments.map((comment) => (
          <div key={comment.id} className="mb-3">
            <strong>{comment.userName}</strong>
            <p className="mb-0">{comment.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
