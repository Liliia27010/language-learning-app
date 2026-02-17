import React from "react";
import { useNavigate } from "react-router";
import "./App.css";

import importGif from "./images/import.gif";
import customizeGif from "./images/customize.gif";
import starGif from "./images/star.gif";
import FeatureItem from "../components/Feature-item";
import FeatureContainer from "../components/Feature-container";
import Button from "../components/Button";

export default function Flashcards({ isLoggedIn, onOpenLogin }) {
  const navigate = useNavigate();

  const handleCreateClick = () => {
    if (isLoggedIn) {
      navigate("/SetCards");
    } else {
      onOpenLogin();
    }
  };

  return (
    <div className="flashcards-container">
      <FeatureContainer
        title="The easiest way to make and study flashcards"
        subtitle="Creating your own set of flashcards is simple with our free flashcard maker — just add a term and definition. Once your flashcard set is complete, you can study and share it with friends."
      />

      <FeatureItem
        image={importGif}
        title="Import"
        description="Easily make your notes into flashcards."
      />

      <FeatureItem
        image={customizeGif}
        title="Customize"
        description="Take existing flashcards and make them your own."
      />

      <FeatureItem
        image={starGif}
        title="Star"
        description="Only study the flashcards you want to focus on."
      />

      <Button label="+ Create a flashcard set" onClick={handleCreateClick} />
    </div>
  );
}
