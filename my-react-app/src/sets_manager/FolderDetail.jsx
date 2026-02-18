import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { X } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import "./App.css";

export default function FolderDetail() {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const { folders, savedSets, handleAddSetToFolder} =
    useLibrary();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const folder = folders.find((f) => String(f._id) === String(folderId));

  if (!folder) return <div className="library-container">Folder not found</div>;

  const currentFolderSets = Array.isArray(folder.sets) ? folder.sets : [];

return (
    <div className="library-container">
      <div className="library-header">
        <h1>{folder.name}</h1>
        <p>{currentFolderSets.length} sets in this folder</p>
      </div>

      <div className="section">
        <button className="create-btn" onClick={() => setIsModalOpen(true)}>
          + Add Set to Folder
        </button>

        <div className="sets-grid">
          {currentFolderSets.map((set) => (
            <div key={set._id || set.id} className="folder-card">
              <h3>{set.name}</h3>
              <p>{set.cards?.length || 0} cards</p>
              <div className="card-actions">
                <button
                    className="create-btn"
                    onClick={() => navigate(`/cards/${set._id}`)}
                  >
                    Learn
                  </button>
                <button
                  className="create-btn"
                  onClick={() => navigate(`/setcards/${set._id || set.id}`)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Set to {folder.name}</h2>
              <button
                className="close-modal-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">

              {savedSets.filter(set => 
                !currentFolderSets.some(s => String(s._id || s) === String(set._id))
                  ).length > 0 ? (
                savedSets
                  .filter(
                    (set) => !currentFolderSets.some((s) => (s._id || s.id) === (set._id || set.id))
                  )
                  .map((set) => (
                    <div key={set._id || set.id} className="set-selection-row">
                      <span>{set.name}</span>
                      <button
                        className="add-action-btn"
                        onClick={() => {
                          handleAddSetToFolder(folder._id || folder.id, set);
                        }}
                      >
                        Add
                      </button>
                    </div>
                  ))
              ) : (
                <p>No more sets available to add.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}