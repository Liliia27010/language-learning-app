import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { useNavigate } from "react-router";
import { useLibrary } from "./LibraryContext";
import "./App.css";

export default function Folder() {
  const [folderName, setFolderName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSets, setSelectedSets] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { setFolders, savedSets } = useLibrary();

  const toggleSetSelection = (setId) => {
    setSelectedSets((prev) =>
      prev.includes(setId) 
        ? prev.filter((id) => id !== setId) 
        : [...prev, setId]                
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: folderName,
          description: description,
          sets: selectedSets, 
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newFolder = {
          _id: data.id, 
          name: folderName,
          description: description,
          sets: selectedSets, 
        };

        setFolders((prev) => [...prev, newFolder]);
        navigate("/library");
      } else {
        alert("Failed to create folder");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Could not connect to the server");
    } finally {
      setIsLoading(false);
    }
  };;

  return (
    <div className="login-overlay">
      <div className="backdrop" onClick={() => navigate("/library")} />
      <div className="modal">
        <button
          className="close-modal-btn"
          onClick={() => navigate("/library")}
        >
          <X size={24} />
        </button>

        <div className="box-header">
          <h2>Create New Folder</h2>
          <p>Organize your study sets into folders.</p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="input-field">
            <label>Folder Name</label>
            <input
              type="text"
              className="input"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Fruits"
              required
            />
          </div>

          <div className="input-field">
            <label>Description (Optional)</label>
            <input
              type="text"
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="For the test on Friday"
            />
          </div>

          <button className="create-btn">Create Folder</button>
        </form>
      </div>
    </div>
  );
}
