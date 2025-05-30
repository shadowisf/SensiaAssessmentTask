import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Page() {
  const { pageName } = useParams();
  const [page, setPage] = useState<any | null>(null);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [error, setError] = useState("");

  // Fetch page and comments
  async function fetchPage() {
    try {
      const res = await fetch(
        `http://localhost:8000/api/readPage/${pageName}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch page");

      const data = await res.json();

      setPage(data);
    } catch (err) {
      const msg = (err as Error).message;
      console.error(msg);
      setError(msg);
    }
  }

  useEffect(() => {
    fetchPage();
  }, []);

  async function handleCreateComment() {
    try {
      const res = await fetch(
        `http://localhost:8000/api/createComment/${pageName}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
          body: JSON.stringify({ content: newComment }),
        }
      );

      if (!res.ok) throw new Error("Failed to create comment");

      setNewComment("");
      fetchPage();
    } catch (err) {
      console.error((err as Error).message);
    }
  }

  async function handleUpdateComment(id: number) {
    try {
      const res = await fetch(
        `http://localhost:8000/api/updateComment/${id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
          body: JSON.stringify({ content: editedContent }),
        }
      );

      if (!res.ok) throw new Error("Failed to update comment");

      setEditingCommentId(null);
      setEditedContent("");
      fetchPage();
    } catch (err) {
      console.error((err as Error).message);
    }
  }

  async function handleDeleteComment(id: number) {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      const res = await fetch(
        `http://localhost:8000/api/deleteComment/${id}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete comment");

      fetchPage();
    } catch (err) {
      console.error((err as Error).message);
    }
  }

  return (
    <main className="page-wrapper">
      {page && (
        <>
          <div className="page-content">
            <h1>{page.name}</h1>
            <p>{page.content}</p>
          </div>

          <div className="comments-section">
            <h2>Comments</h2>

            {page.comments.length === 0 && <p>No comments yet.</p>}

            <ul>
              {page.comments.map((comment: any) => (
                <li key={comment.id}>
                  <strong>{comment.author.full_name || "Anonymous"}:</strong>{" "}
                  {editingCommentId === comment.id ? (
                    <>
                      <input
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                      />
                      <button onClick={() => handleUpdateComment(comment.id)}>
                        Save
                      </button>
                      <button onClick={() => setEditingCommentId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      {comment.content}{" "}
                      <small>
                        {new Date(comment.created_at).toLocaleString()}
                      </small>
                      <button
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditedContent(comment.content);
                        }}
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDeleteComment(comment.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>

            <div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment"
                required
              />
              <button onClick={handleCreateComment}>Post Comment</button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
