import React from "react";

export default function FeatureContainer({ title, subtitle }) {
  return (
    <div className="title-container">
      <div className="text-content">
        <section className="intro-section">
          <h1 className="main-title">{title}</h1>
          <h2 className="intro-text">{subtitle}</h2>
        </section>
      </div>
    </div>
  );
}
