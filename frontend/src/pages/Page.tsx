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
  const [accessLevel, setAccessLevel] = useState("none");
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authInitialized && !isAuthenticated) {
      navigate("/");
    }
  }, [authInitialized, isAuthenticated]);

  useEffect(() => {
    initializePageData();
  }, []);

  async function initializePageData() {
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      };

      const [userRes, pageRes] = await Promise.all([
        fetch("http://localhost:8000/api/readSelfUser/", { headers }),
        fetch(`http://localhost:8000/api/readPage/${pageName}/`, { headers }),
      ]);

      if (!userRes.ok || !pageRes.ok) {
        throw new Error("Failed to fetch user or page data");
      }

      const userData = await userRes.json();
      const pageData = await pageRes.json();

      setPage(pageData);

      const accessRes = await fetch(
        "http://localhost:8000/api/readAllPageAccess/",
        { headers }
      );

      if (!accessRes.ok) throw new Error("Failed to fetch access levels");

      const accessData = await accessRes.json();

      const match = accessData.find(
        (entry: any) =>
          entry.user === userData.id && entry.page_name === pageData.name
      );

      setAccessLevel(match?.access_level ?? "none");
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
      initializePageData();
    } catch (err) {
      const msg = (err as Error).message;

      console.error(msg);
      setError(msg);
    }
  }

  async function handleUpdateComment(id: number) {
    try {
      if (accessLevel !== "edit") {
        setError("You do not have permission to edit a comment");
        throw new Error("You do not have permission to edit a comment");
      }

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
      initializePageData();
    } catch (err) {
      const msg = (err as Error).message;

      console.error(msg);
      setError(msg);
    }
  }

  async function handleDeleteComment(id: number) {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    if (accessLevel !== "delete") {
      setError("You do not have permission to delete a comment");
      throw new Error("You do not have permission to delete a comment");
    }

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

      initializePageData();
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
                date={new Date(comment.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
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

            {accessLevel !== "view" && (
              <div className="add-comment-container">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment"
                  required
                />
                <button onClick={handleCreateComment}>Post Comment</button>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
