import React from "react";
import { useNavigate } from "react-router";
import "./App.css";

import questionsGif from "./images/questions.gif";
import getGif from "./images/get.gif";
import takeGif from "./images/take.gif";
import FeatureItem from "../components/Feature-item";
import Button from "../components/Button";
import FeatureContainer from "../components/Feature-container";

export default function Test({ isLoggedIn, onOpenLogin }) {
  const navigate = useNavigate();

  const handleCreateClick = () => {
    if (isLoggedIn) {
      navigate("/create-set");
    } else {
      onOpenLogin();
    }
  };
  return (
    <div className="test-container">
      <FeatureContainer
        title="Make the material stick with Test mode"
        subtitle="Get graded on practice test to check how much you know and prepare for your next big exam."
      />

      <FeatureItem
        image={questionsGif}
        title="Questions formatted your way"
        description="Test yourself with multiple choice, true/false, and other question types to better learn the material."
      />

      <FeatureItem
        image={getGif}
        title="Get graded on your responses"
        description="With auto-grading, get feedback on what you know and where you need to spend more time studying."
      />

      <FeatureItem
        image={takeGif}
        title="Take a test, anywhere"
        description="With Test Mode available on both iOS and Android, you can get practice in wherever you go."
      />
      <Button label="+ Create a Test" onClick={handleCreateClick} />
    </div>
  );
}
