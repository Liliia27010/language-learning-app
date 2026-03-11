import React, {useEffect, useState} from "react";
import { Link, useNavigate } from "react-router";
import "../styles/App.css";
import { useLibrary } from "../context/LibraryContext";
import {useAuth} from "../context/LoginContext";

export default function Library() {
  const navigate = useNavigate();
  const {user} = useAuth();
  const { savedSets, folders, deleteCardSet, setFolders } = useLibrary();
  const [tests, setTests] = useState([]);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch("/api/tests");
        const data = await response.json();
        if (data.success) {
          setTests(data.tests);
        }
      } catch (error) {
        console.error("Failed to fetch tests", error);
      }
    };

    if (user) {
      fetchTests();
    }
  }, [user, user?.userType]);
  
  const assignStudent = async (testId) => {
    const email = prompt("Enter student's email to share this test:");
    if (!email) return;

    try {
      const response = await fetch(`/api/tests/${testId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Success: " + data.message);
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      alert("Failed to assign student. Check console.");
    }
  };

  const shareSet = async (setId) => {
    const email = prompt("Enter email to sahre this set:");
    if (!email) return;

    try {
      const response = await fetch(`/api/setcards/${setId}/share`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ email: email }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Shared successfully!");
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      alert("Request failed");
    }
  };

  const shareFolder = async (folderId) => {
    const email = prompt("Enter email to share this folder:");
    if (!email) return;

    try {
      const response = await fetch(`/api/folder/${folderId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) alert("Folder shared successfully!");
      else alert("Error: " + data.message);
    } catch (err) {
      alert("Failed to share folder");
    }
  };

  const deleteTest = async (testId) => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;
    try {
      const response = await fetch(`/api/tests/${testId}`, { method: "DELETE" });
      if (response.ok) {
        setTests((prev) => prev.filter((t) => t._id !== testId));
      }
    } catch (error) {
      console.error("Delete test failed", error);
    }
  };


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
          +  Create New Folder
        </div>

        <div className="folders-grid">
          {folders.map((folder) => {
            const isOwner = Array.isArray(folder.userId) && folder.userId[0] === user?.id;
            
            return (
            <div
              key={folder._id}
              className="folder-card clickable"
              onClick={() => navigate(`/folder/${folder._id}`)}
            >
              <div className="folder-header">
                {!isOwner && <p>Shared with you</p>}
                <h3>{folder.name}</h3>
              </div>

              <p className="folder-count">
                {Array.isArray(folder.sets) ? folder.sets.length : 0} sets
              </p>

              <div className="button-group">
                {isOwner && (
                <button
                  className="create-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateFolder(folder._id, folder.name, folder.description);
                  }}
                >
                  Edit
                </button>
                )}
                 {isOwner && (
                <button className="create-btn" onClick={(e) => { e.stopPropagation(); shareFolder(folder._id); }}>
                        Share
                      </button>
                 )}
                  {isOwner && (
                <button
                  className="create-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFolder(folder._id);
                  }}
                >
                  Delete
                </button>
                )}
              </div>
            </div>
            );
          })}
        </div>
      </div>
        <div className="section">
        <h2>Your Cards Set</h2>
        <Link to="/setcards" className="create-btn">
          + Create New Set
        </Link>

        <div className="sets-grid">
          {filteredSets.length > 0 ? (
            filteredSets.map((set) => {
              const isOwner = set.userId && set.userId[0] === user?.id;

              return (
                <div key={set._id} className="folder-card">
                  <div className="folder-header">
                    {!isOwner && (
                      <p>
                        Shared with you
                      </p>
                    )}
                     <h3>{set.name}</h3>
                  </div>

                  <p className="folder-count"> {set.cards?.length || 0} cards</p>
                  <p className="set-description">{set.description}</p>

                  <div className="button-group">
                    {isOwner && (
                      <button
                        className="create-btn"
                        onClick={() => navigate(`/setcards/${set._id}`)}
                      >
                        Update
                      </button>
                    )}
                    
                    {isOwner && (
                      <button
                        className="create-btn"
                        onClick={() => shareSet(set._id)}
                      >
                        Share
                      </button>
                      
                    )}
                    {isOwner && (
                      <button
                      className="create-btn delete-btn"
                      onClick={() => deleteCardSet(set._id)}
                    >
                      Delete
                    </button>
                    )}
                    
                     <button
                      className="create-btn"
                      onClick={() => navigate(`/cards/${set._id}`)}
                    >
                      Learn
                    </button>

                  </div>
                </div>
              );
            })
          ) : (
            <p>No card sets found.</p>
          )}
        </div>
      </div>
      <div className="section">
        <h2>{user?.userType === "teacher" ? "Your Tests" : "Assigned Tests"}</h2>
        
        {user?.userType === "teacher" && (
          <Link to="/createtest" className="create-btn">+ Create New Test</Link>
        )}
        
        <div className="folders-grid">
          {tests.length > 0 ? (
            tests.map((test) => (
              <div key={test._id} className="folder-card">
                <h3>{test.title}</h3>
                <p className="folder-count">Time limit: {test.timeLimit} min</p>
                <div className="button-group">
                  <button className="create-btn" onClick={() => navigate(`/take-test/${test._id}`)}>
                    Start Test
                  </button>
                  
                  {user?.userType === "teacher" && (
                    <>
                      <button className="create-btn" onClick={() => navigate(`/setcards/${test.setId}`)}>Edit</button>
                      <button className="create-btn" onClick={() => assignStudent(test._id)}>Add Student</button>
                      <button className="create-btn delete-btn" onClick={() => deleteTest(test._id)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              {user?.userType === "student" ? (
                <div className="no-tests-message">
                  <p>No tests have been shared with you yet.</p>
                  <small>Once your teacher assigns a test, it will appear here.</small>
                </div>
              ) : (
                <p>You haven't created any tests yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
