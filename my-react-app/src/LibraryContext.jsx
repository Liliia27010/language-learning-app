import React, { createContext, useContext, useState, useEffect, useRef } from "react";

const LibraryContext = createContext(null);

export function useLibrary() {
  return useContext(LibraryContext);
}

export function LibraryProvider({ children }) {
  const [savedSets, setSavedSets] = useState([]);
  const [folders, setFolders] = useState([]);

  const ref = useRef(false);

useEffect(() => {
  console.log('entering myLibraryContext')
  if (ref.current) {
    return;
  }
    const fetchLibraryData = async () => {
      try {
        ref.current = true;
        const token = localStorage.getItem("token");
        const fetchOptions = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [folderRes, setsRes] = await Promise.all([
          fetch("/api/folder", fetchOptions),
          fetch("/api/setcards", fetchOptions)
        ]);

        if (folderRes.ok) {
          const folderData = await folderRes.json();
          setFolders(Array.isArray(folderData) ? folderData : []);
          localStorage.setItem("folder", JSON.stringify(folderData));
        }

        if (setsRes.ok) {
          const setsData = await setsRes.json();
          setSavedSets(Array.isArray(setsData) ? setsData : []);
          localStorage.setItem("sets", JSON.stringify(setsData));
        }

      } catch (err) {
        console.error("Failed to load library data", err);
      }
    };

    fetchLibraryData();
  }, []);
  const handleSaveSet = (newSet) => {
    const CardsSet = { ...newSet, _id: Date.now().toString() };
    setSavedSets((prev) => [...prev, CardsSet]);

    const existingSets = JSON.parse(localStorage.getItem("sets")) || [];
    existingSets.push(CardsSet);
    localStorage.setItem("sets", JSON.stringify(existingSets));
  };

const deleteCardSet = async (setId) => {
  if (!window.confirm("Delete this cards set?")) return;

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/setcards/${setId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      setSavedSets(prev => prev.filter(s => String(s._id || s.id) !== String(setId)));
    }
  } catch (err) {
    console.error("Error", err);
  }
};

const handleAddSetToFolder = (folderId, setToAdd) => {
  setFolders((prevFolders) => {
    const updatedFolders = prevFolders.map((folder) => {
      const currentFolderId = String(folder._id || folder.id);
      const targetFolderId = String(folderId);

      if (currentFolderId === targetFolderId) {
        const currentSets = Array.isArray(folder.sets) ? folder.sets : [];

        const isAlreadyAdded = currentSets.some(
          (s) => String(s._id ) === String(setToAdd._id )
        );

        if (isAlreadyAdded) return folder;
        return { ...folder, sets: [...currentSets, setToAdd] };
      }
      return folder;
    });

    localStorage.setItem("folder", JSON.stringify(updatedFolders));
    return updatedFolders;
  });
};

  const handleUpdateSet = (updatedSet) => {
    setSavedSets((prevSets) => {
      const updated = prevSets.map((s) =>
        s._id === updatedSet._id ? updatedSet : s,
      );
      localStorage.setItem("sets", JSON.stringify(updated));
      return updated;
    });
  };

const deleteFolder = async (folderId) => {
  if (!window.confirm("Delete this folder?")) return;

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/folder/${folderId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      setFolders(prev => prev.filter(f => String(f._id || f.id) !== String(folderId)));
    }
  } catch (err) {
    console.error("Error", err);
  }
};

  return (
    <LibraryContext.Provider
      value={{
        savedSets,
        folders,
        handleUpdateSet,
        handleSaveSet,
        handleAddSetToFolder,
        deleteFolder,
        deleteCardSet,
        setFolders,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}