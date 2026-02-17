import React from "react";
import { Link, useNavigate } from "react-router";
import "./App.css";
import { useLibrary } from "./LibraryContext";

export default function Library() {
  const navigate = useNavigate();
  const { savedSets, folders, deleteCardSet, setFolders } = useLibrary();

  const deleteFolder = async (folderId) => {
    try {
      const response = await fetch(`/api/folder/${folderId}`, {
        method: "delete",
      });
      const data = await response.json();

      if (data.success) {
        setFolders((prev) => prev.filter((f) => f._id !== folderId));
      } else {
        alert("Could not delete from server");
      }
    } catch (error) {
      console.error("Delete request failed", error);
    }
  };

  const updateFolder = async (folderId, currentName, currentDescription) => {
    const newName = prompt("Enter new folder name:", currentName);
    const newDesc = prompt("Enter new description:", currentDescription);

    if (!newName) return;

    try {
      const response = await fetch(`/api/folder/${folderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newName,
          description: newDesc,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Update failed");
      }
    } catch (error) {
      console.error("Update request failed", error);
    }
  };

const setsInFoldersIds = (folders || []).flatMap((folder) =>
  folder?.sets ? folder.sets.map((s) => s._id || s.id) : []
);

const filteredSets = (savedSets || []).filter(
  (set) => set && !setsInFoldersIds.includes(set._id),
);

console.log('render library')
  return (
    <div className="library-container">
      <div className="library-header">
        <h1>My Library</h1>
      </div>

      <div className="section">
        <h2>Your Folders</h2>
        <div
          className="create-btn"
          onClick={() => navigate("/folder")}
          style={{ cursor: "pointer" }}
        >
          + New Folder
        </div>

        <div className="folders-grid">
          {folders.map((folder) => (
            <div
              key={folder._id}
              className="folder-card clickable"
              onClick={() => navigate(`/folder/${folder._id}`)}
            >
              <div className="folder-header">
                <h3>{folder.name}</h3>
              </div>

              <p className="folder-count">
                {Array.isArray(folder.sets) ? folder.sets.length : 0} sets
              </p>

              <div className="button-group">
                <button
                  className="create-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateFolder(folder._id, folder.name, folder.description);
                  }}
                >
                  Edit
                </button>
              </div>

              <div className="button-group">
                <button
                  className="create-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFolder(folder._id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>Your Cards Set</h2>
        <Link to="/setcards" className="create-btn">
          + Create New Set
        </Link>

        <div className="sets-grid">
          {filteredSets.length > 0 ? (
            filteredSets.map((set) => (
              <div key={set._id} className="folder-card">
                <div className="folder-header">
                  <h3>{set.name}</h3>
                </div>

                <p className="folder-count"> {set.cards?.length || 0} cards</p>

                <p className="set-description">{set.description}</p>

                <div className="button-group">
                  <button
                    className="create-btn"
                    onClick={() => navigate(`/setcards/${set._id}`)}
                  >
                    Update
                  </button>
                  <button
                    className="create-btn"
                    onClick={() => navigate(`/cards/${set._id}`)}
                  >
                    Learn
                  </button>
                  <button
                    className="create-btn delete-btn"
                    onClick={() => deleteCardSet(set._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : null}
        </div>
      </div>
    </div>
  );
}
