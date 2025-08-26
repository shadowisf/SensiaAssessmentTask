import React from "react";
import type { AccessLevel } from "../utils/types";

type CommentProps = {
  access: AccessLevel;
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
  access,
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
              disabled={!access.can_edit} // disable editing if no edit permission
            />
            <div className="comment-actions">
              {access.can_edit && <a onClick={onSaveClick}>Save</a>}
              <a onClick={onCancelClick}>Cancel</a>
            </div>
          </>
        ) : (
          <>
            <p>{content}</p>
            <div className="comment-actions">
              {access.can_edit && <a onClick={onEditClick}>Edit</a>}
              {access.can_delete && <a onClick={onDeleteClick}>Delete</a>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
