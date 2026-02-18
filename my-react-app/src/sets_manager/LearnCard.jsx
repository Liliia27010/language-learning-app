import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { X } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import "./App.css";

export default function Learn() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const { savedSets } = useLibrary();

  const [index, setIndex] = useState(0);
  const [flip, setFlip] = useState(false);

  const mySet = savedSets.find((s) => String(s._id) === String(setId));

  const currentCard = mySet.cards && mySet.cards.length > 0 ? mySet.cards[index] : null;

  if (!currentCard) {
    return <div className="library-container">No cards found in this set.</div>;
  }

  return (
    <div className="library-container">
      <button className="close-modal-btn" onClick={() => navigate("/library")}>
        <X size={24} />
      </button>
      <h1>{mySet.name}</h1>

      <div
        className={`flashcard-container ${flip ? "flipped" : ""}`}
        onClick={() => setFlip(!flip)}
      >
        <div className="flashcard-inner">
          <div className="front">{currentCard.term}</div>

          <div className="back">{currentCard.definition}</div>
        </div>
      </div>

      <div className="button">
        <button
          className="btn"
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          Back
        </button>

        <button
          className="btn"
          disabled={index === mySet.cards.length - 1}
          onClick={() => setIndex(index + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
