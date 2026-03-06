import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { X } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import "../styles/App.css";

export default function Learn() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const { savedSets } = useLibrary();

  const [index, setIndex] = useState(0);
  const [flip, setFlip] = useState(false);

  const mySet = savedSets?.find((s) => String(s._id) === String(setId));
  
  const totalCards = mySet?.cards?.length || 0;

  const currentCard = totalCards > 0 ? mySet.cards[index] : null;

  if (!currentCard) {
    return <div className="library-container">No cards found in this set.</div>;
  }

  return (
    <div className="library-container">
      <button className="close-modal-btn" onClick={() => navigate("/library")}>
        <X size={24} />
      </button>
      <h1>{mySet.name}</h1>

      <p >{index + 1} / {totalCards}</p>


      <div
        className={`flashcard-container ${flip ? "flipped" : ""}`}
        onClick={() => setFlip(!flip)}
      >
        <div className="flashcard-inner">
          <div className="front" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            {currentCard.term}
            <p style={{ fontSize: "11px", color: "#666", marginTop: "10px", fontWeight: "normal" }}>Click, to see the definition</p>
          </div>

          <div className="back" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            {currentCard.definition}
            <p style={{ fontSize: "11px", color: "#666", marginTop: "10px", fontWeight: "normal" }}>Click, to see the term</p>
          </div>

          
        </div>
      </div>

     <div className="button" style={{ marginTop: "20px", display: "flex", gap: "15px" }}>
        <button
          className="btn"
          style={{
            backgroundColor: index === 0 ? "#eeeeee" : "#ffffff",
            color: index === 0 ? "#bbbbbb" : "black",
            cursor: index === 0 ? "not-allowed" : "pointer",
            border: "1px solid " + (index === 0 ? "#dddddd" : "#000000")
          }}
          disabled={index === 0}
          onClick={() => { setIndex(index - 1); setFlip(false); }}
        >
          Back
        </button>

        <button
          className="btn"
          style={{
            backgroundColor: index === totalCards - 1 ? "#eeeeee" : "#ffffff",
            color: index === totalCards - 1 ? "#bbbbbb" : "black",
            cursor: index === totalCards - 1 ? "not-allowed" : "pointer",
            border: "1px solid " + (index === totalCards - 1 ? "#dddddd" : "#000000")
          }}
          disabled={index === totalCards - 1}
          onClick={() => { setIndex(index + 1); setFlip(false); }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
