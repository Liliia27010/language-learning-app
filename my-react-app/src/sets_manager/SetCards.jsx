import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useLibrary } from "../context/LibraryContext";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function SetCards() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const { savedSets, folders, handleAddSetToFolder } = useLibrary();

  const [setName, setSetName] = useState("");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState([
    { id: Date.now(), term: "", definition: "", color: "#ffffff" },
  ]);

  const [aiInput , setAiInput] = useState("");
  const [aiPreview, setAiPreview] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  const [isFolderModalOpen, setIsFolderMadalOpen] = useState(false);
  const [createdSetId, setCreatedSetId] = useState(null);

  useEffect(() => {
    if (setId && savedSets?.length > 0) {
      const setToEdit = savedSets.find(
        (s) => String(s._id || s.id) === String(setId)
      );

      if (setToEdit) {
        setSetName(setToEdit.name || "");
        setDescription(setToEdit.description || "");

        const mappedCards = setToEdit.cards?.map(c => ({
          id: c._id || Math.random(),
          term: c.term,
          definition: c.definition,
          color: c.color || "#ffffff"
        })) || [];

        setCards(mappedCards.length > 0 ? mappedCards : [{ id: Date.now(), term: "", definition: "", color: "#ffffff" }]);
      }
    }
  }, [setId, savedSets]);

  const addCard = () => {
    setCards([
      ...cards,
      { id: Date.now(), term: "", definition: "", color: "#ffffff" }
    ]);
  };

  const updateCard = (id, field, value) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id ? { ...card, [field]: value } : card
      )
    );
  };
  const handleTranslate = async (cardId, text) => {
    if (!text) return;
    try {
      const fromLang = "en";
      const toLang = "fi";
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.responseData) {
        updateCard(cardId, "definition", data.responseData.translatedText);
      }
    } catch (error) {
      console.error("Translation error:", error);
    }
  };

  const deleteCard = (id) => {
    if (cards.length === 1) {
      alert("You must have at least one card!");
      return;
    }
    setCards(cards.filter((card) => card.id !== id));
  };

  const handleSave = async () => {
    if (!setName.trim()) return alert("Name is required");

    try {
      const token = localStorage.getItem("token");
      const fullSetData = {
        name: setName,
        description: description,
        cards: cards.filter(c => c.term.trim() || c.definition.trim())
      };

      const method = setId ? "PUT" : "POST";
      const url = setId ? `/api/setcards/${setId}` : "/api/setcards";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(fullSetData),
      });

      const data = await response.json();

      if (response.ok) {
        if (!setId) {
          setCreatedSetId(data.id);
          setIsFolderMadalOpen(true);
        } else {
          navigate("/library");
        }
      } else {
        alert("Save failed");
      }
    } catch (error) {
      console.error("Error saving set:", error);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiInput) return;
    setIsAiLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `Create a list of vocabulary cards for: ${aiInput}. 
      Format: return ONLY a JSON array of objects with "term" (English) and "definition" (Finnish). 
      Example: [{"term": "Apple", "definition": "Omena"}]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonStr = text.match(/\[.*\]/s)[0]; 
      const parsedCards = JSON.parse(jsonStr);
      setAiPreview(parsedCards);
    } catch (error) {
      console.error("AI Error:", error);
      alert("AI failed to generate cards.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const addAiCardsToSet = () => {
    const newCards = aiPreview.map(c => ({
      id: Math.random(),
      term: c.term,
      definition: c.definition,
      color: "#ffffff"
    }));
    const filteredCurrent = cards.filter(c => c.term || c.definition);
    setCards([...filteredCurrent, ...newCards]);
    setAiPreview([]);
    setAiInput("");
    setShowAiAssistant(false);
  };

  return (
    <>
      <div className="create-set">
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=delete,palette,translate"
        />

        <div className="create-header">
          <h1>{setId ? "Edit Set" : "Create New Set"}</h1>
        </div>

        {showAiAssistant && (
          <div className="ai-window-overlay">
            <div className="ai-window-header">
              <h3>AI Assistant</h3>
            </div>
            
            <div className="ai-window-body">
              <div className="ai-input-group">
                <input style={{background: 'rgba(123, 124, 124, 0.2)'}}
                  type="text" 
                  placeholder="10 fruits" 
                  className="card-input"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                />
                <button onClick={handleAiGenerate} disabled={isAiLoading} className="create-btn">
                  {isAiLoading ? "wait..." : "Gen"}
                </button>
              </div>

              {aiPreview.length > 0 && (
                <div className="ai-preview-table-container">
                  <table className="ai-preview-table">
                    <thead>
                      <tr>
                        <th>Term</th>
                        <th>Definition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aiPreview.map((card, i) => (
                        <tr key={i}>
                          <td>{card.term}</td>
                          <td>{card.definition}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button onClick={addAiCardsToSet} className="ai-add-all-btn">
                    ADD ALL TO SET
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        <button 
            className="ai-floating-btn" 
            onClick={() => setShowAiAssistant(!showAiAssistant)}
            
          >
            {showAiAssistant ? "Close AI Assistant" : " AI Creator"}
          </button>

        <div className="editor-placeholder">
          <input
            type="text"
            placeholder="Name"
            className="card-input"
            value={setName}
            onChange={(e) => setSetName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Add description..."
            className="card-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="cards-list">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className="card-preview"
                style={{ backgroundColor: card.color }}
              >
                <div className="card-top-bar">
                  <div className="card-index">{index + 1}</div>
                  <div className="card-controls">
                    <div className="card-color-picker">
                      <button
                        className="material-symbols-outlined palette-icon"
                        style={{ color: "white" }}
                      >
                        palette
                      </button>
                      <input
                        type="color"
                        value={card.color}
                        onChange={(e) => updateCard(card.id, "color", e.target.value)}
                      />
                    </div>

                    <button
                      className="material-symbols-outlined translate-icon"
                      onClick={() => handleTranslate(card.id, card.term)}
                    >
                      translate
                    </button>
                    <button
                      className="material-symbols-outlined delete-card-icon"
                      onClick={() => deleteCard(card.id)}
                    >
                      delete
                    </button>
                  </div>
                </div>

                <div className="card-inputs-row">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="TERM.."
                      className="card-inner-input"
                      value={card.term}
                      onChange={(e) =>
                        updateCard(card.id, "term", e.target.value)
                      }
                    />
                  </div>

                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="DEFINITION.."
                      className="card-inner-input"
                      value={card.definition}
                      onChange={(e) =>
                        updateCard(card.id, "definition", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="add-card-btn" onClick={addCard}>
            + ADD CARD
          </button>

          <button className="create-btn" onClick={handleSave}>
            {setId ? "Update" : "Create"}
          </button>
        </div>
      </div>

      {isFolderModalOpen && (
        <div className="overlay">
          <div className="backdop" onClick={() => navigate("/library")} />
          <div className="modal">
            <div className="box-header">
              <h2>Categorize your Set</h2>
              <p>"{setName}" is saved! Want to add it to a folder?</p>
            </div>

            <div className="modal-body">
              <button
                className="create-btn"
                onClick={() => navigate("/library")}>
                No, just keep in Library
              </button>
              <div className="folder-selection-list">
                {folders.length > 0 ? (
                  folders.map((folder) => (
                    <div key={folder._id} className="set-selection-row">
                      <span>{folder.name}</span>
                      <button
                        className="add-action-btn"
                        onClick={async () => {
                          await handleAddSetToFolder(folder._id, { _id: createdSetId, name: setName });
                          navigate("/library");
                        }}
                      >
                        Add
                      </button>
                    </div>
                  ))
                ) : (
                  <p>You have no folders created yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
