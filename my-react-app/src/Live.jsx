import React from "react";
import { useNavigate } from "react-router";
import Integration from "./images/Integration.gif";
import Energize from "./images/Energize.gif";
import master from "./images/master.gif";
import FeatureItem from "./components/Feature-item";
import Button from "./components/Button";
import FeatureContainer from "./components/Feature-container";
import "./App.css";

export default function Live({ isLoggedIn, onOpenLogin }) {
  const navigate = useNavigate();

  const handleCreateClick = () => {
    if (isLoggedIn) {
      navigate("/create-set");
    } else {
      onOpenLogin();
    }
  };
  return (
    <div className="flashcards-container">
      <FeatureContainer
        title="FINLEARN Live"
        subtitle="Turn lesson reviews into an epic classroom challenge! Ignite student participation with a fast-paced, collaborative game that brings your specific lesson content to life through friendly competition."
      />

      <FeatureItem
        image={Integration}
        title="Seamless Integration"
        description="A FINLEARN Live game in seconds using your existing study sets - no extra prep required."
      />

      <FeatureItem
        image={Energize}
        title="Energize the Room"
        description="Spark active participation and teamwork by turning your curriculum into a high-stakes classroom challenge."
      />

      <FeatureItem
        image={master}
        title="Master the Material"
        description="Boost long-term retention through fast-paced active recall that makes vocabulary and concepts stick."
      />

      <Button label="+ Create a Live game" onClick={handleCreateClick} />
    </div>
  );
}
