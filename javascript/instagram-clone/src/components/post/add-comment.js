import React, { useState, useContext } from "react";
import FirebaseContext from "../../context/firebase";
import UserContext from "../../context/user";

const AddComment = ({ docId, comments, setComments, commentInput }) => {
  const [comment, setComment] = useState("");
  const { firebase, FieldValue } = useContext(FirebaseContext);
  const {
    user: { displayName },
  } = useContext(UserContext);

  const handleSubmitComment = (e) => {
    e.preventDefault();
    setComments([{ displayName, comment }, ...comments]);
    setComment("");
    return firebase.firestore()
      .collection("photos")
      .doc(docId)
      .update({ comments: FieldValue.arrayUnion({ displayName, comment }) });
  };

  return (
    <div className="border-t border-gray-primary">
      <form
        className="flex justify-between pl-0 pr-5"
        method="post"
        onSubmit={(e) =>
          comment.length >= 1 ? handleSubmitComment(e) : e.preventDefault()
        }  
      >
        <input
          type="text"
          autoComplete="off"
          className="text-sm text-gray-base w-full mr-3 py-5 px-4"
          name="add-comment"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          ref={commentInput}
        />
        <button
          className={`text-sm font-bold text-blue-medium ${
            !comment && "opacity-25"
          }`}
          type="button"
          disabled={comment.length < 1}
          onClick={handleSubmitComment}
        >
          Post
        </button>
      </form>
    </div>
  );
};

export default AddComment;
