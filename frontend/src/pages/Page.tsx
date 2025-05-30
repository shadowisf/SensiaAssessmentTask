import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Comment from "../components/Comment";
import ErrorMessage from "../components/ErrorMessage";
import { useAuth } from "../context/AuthContext";

export default function Page() {
  const navigate = useNavigate();

  const { pageName } = useParams();
  const { isAuthenticated, authInitialized } = useAuth();

  const [page, setPage] = useState<any | null>(null);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [error, setError] = useState("");

  // role check
  useEffect(() => {
    async function fetchSelfUser() {
      if (authInitialized && !isAuthenticated) {
        navigate("/");
      }
    }

    fetchSelfUser();
  }, [authInitialized, isAuthenticated]);

  useEffect(() => {
    fetchPage();
  }, []);

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
      const msg = (err as Error).message;

      console.error(msg);
      setError(msg);
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
      const msg = (err as Error).message;

      console.error(msg);
      setError(msg);
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
      const msg = (err as Error).message;

      console.error(msg);
      setError(msg);
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

            {error && <ErrorMessage>{error}</ErrorMessage>}

            {page.comments.length === 0 && <p>No comments yet.</p>}

            {page.comments.map((comment: any) => (
              <Comment
                key={comment.id}
                date={new Date(comment.created_at).toLocaleString()}
                author_name={comment.author.full_name || "Anonymous"}
                content={comment.content}
                isEditing={editingCommentId === comment.id}
                editedContent={editedContent}
                onChangeEditedContent={(e) => setEditedContent(e.target.value)}
                onEditClick={() => {
                  setEditingCommentId(comment.id);
                  setEditedContent(comment.content);
                }}
                onDeleteClick={() => handleDeleteComment(comment.id)}
                onSaveClick={() => handleUpdateComment(comment.id)}
                onCancelClick={() => setEditingCommentId(null)}
              />
            ))}

            <div className="add-comment-container">
              <input
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
