import React from "react";
import { useNavigate } from "react-router";
import "./App.css";

import Live from "./images/Live.gif";
import interactive from "./images/interactive.gif";
import tests from "./images/tests.gif";

import FeatureItem from "./components/Feature-item";
import FeatureContainer from "./components/Feature-container";
import Button from "./components/Button.jsx";

export default function Home({ isLoggedIn, onOpenLogin }) {
  const navigate = useNavigate();

  const handleCreateClick = () => {
    if (isLoggedIn) {
      navigate("/create-set");
    } else {
      onOpenLogin();
    }
  };

  return (
    <>
      <FeatureContainer
        title="Welcome to FINLEARN"
        subtitle="The all-in-one study platform designed for high achievers. Build custom flashcard decks or explore millions of expert-verified sets. Learn at your own pace, on any device, completely for free."
      />

      <FeatureItem
        image={interactive}
        title="Interactive Flashcards"
        description="Turn your notes into digital flashcards in seconds. Whether you’re memorizing vocabulary or complex formulas, our free flashcard maker helps you organize your study material so you can review anytime, anywhere."
      />

      <FeatureItem
        image={tests}
        title="Smart Practice Tests"
        description="Ready for the exam? Convert your study sets into practice test that simulate the real thing."
      />

      <FeatureItem
        image={Live}
        title="FINLEARN Live"
        description="Experience the classroom like never before. Teachers can launch high-energy, competitive games using any study set."
      />
    </>
  );
}
