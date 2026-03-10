import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { useNavigate } from "react-router";
import { useLibrary } from "../context/LibraryContext";
import "../styles/App.css";

export default function CreateTest() {
  const navigate = useNavigate();
  const { savedSets } = useLibrary(); 
  
  const [testTitle, setTestTitle] = useState("");
  const [selectedSetId, setSelectedSetId] = useState("");
  const [timeLimit, setTimeLimit] = useState(15);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!selectedSetId) {
      alert("Please select a card set!");
      return;
    }

    try {
      const response = await fetch("/api/tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: testTitle,
          setId: selectedSetId,
          timeLimit: timeLimit,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Test created successfully!");
        navigate("/library"); 
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Request failed", error);
    }
  };

  return (
    <div className="overlay">
      <div className="backdrop" onClick={() => navigate("/library")} />
      <div className="modal">
        <button
          className="close-modal-btn"
          onClick={() => navigate("/library")}
        >
          <X size={24} />
        </button>
        <div className="box-header">
      <h1>Create New Test</h1>
      </div>
      <form onSubmit={handleCreate}>
        <div className="input-field">
          <label>Test Title</label>
          <input 
            type="text" 
            className="input"
            placeholder="Fruits"
            value={testTitle} 
            onChange={(e) => setTestTitle(e.target.value)} 
            required 
          />
        </div>

        <div className="input-field">
          <label>Select Set</label>
          <select 
            value={selectedSetId} 
             type="text"
              className="input"
            onChange={(e) => setSelectedSetId(e.target.value)} 
            required
          >
            <option value="">Choose a Set</option>
            {savedSets.map((set) => (
              <option key={set._id} value={set._id}>{set.name}</option>
            ))}
          </select>
        </div>

        <div className="input-field">
          <label>Time Limit (minutes)</label>
          <input 
            type="number" 
              className="input"
               placeholder="23"
            value={timeLimit} 
            onChange={(e) => setTimeLimit(e.target.value)} 
          />
        </div>

        <button type="submit" className="create-btn">Create Test</button>
      </form>
    </div>
    </div>
  );
}