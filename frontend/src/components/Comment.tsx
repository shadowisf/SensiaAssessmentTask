import React from "react";

type CommentProps = {
  date: string;
  author_name: string;
  content: string;
  isEditing?: boolean;
  editedContent?: string;
  onChangeEditedContent?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  onSaveClick?: () => void;
  onCancelClick?: () => void;
};

export default function Comment({
  date,
  author_name,
  content,
  isEditing = false,
  editedContent,
  onChangeEditedContent,
  onEditClick,
  onDeleteClick,
  onSaveClick,
  onCancelClick,
}: CommentProps) {
  return (
    <div className="comment-container">
      <div className="top-container">
        <span>{author_name}</span>
        <small>{date}</small>
      </div>

      <div className="bottom-container">
        {isEditing ? (
          <>
            <textarea
              value={editedContent}
              onChange={onChangeEditedContent}
              style={{ width: "100%" }}
            />
            <div className="comment-actions">
              <a onClick={onSaveClick}>Save</a>
              <a onClick={onCancelClick}>Cancel</a>
            </div>
          </>
        ) : (
          <>
            <p>{content}</p>
            <div className="comment-actions">
              <a onClick={onEditClick}>Edit</a>
              <a onClick={onDeleteClick}>Delete</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
