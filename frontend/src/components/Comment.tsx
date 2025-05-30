type CommentProps = {
  id: number;
  date: string;
  author_name: string;
  content: string;
  onEdit: (id: number, content: string) => void;
  onDelete: (id: number) => void;
};

export default function Comment({
  id,
  date,
  author_name,
  content,
  onEdit,
  onDelete,
}: CommentProps) {
  return (
    <div className="comment-container">
      <div className="top-container">
        <span>{author_name}</span>
        <small>{date}</small>
      </div>
      <div className="bottom-container">
        <p>{content}</p>
        <div className="comment-actions">
          <a onClick={() => onEdit(id, content)}>Edit</a>
          <a onClick={() => onDelete(id)}>Delete</a>
        </div>
      </div>
    </div>
  );
}
