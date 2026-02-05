import React from "react";

export default function FeatureItem({
  image,
  title,
  description,
  buttonText,
  onButtonClick,
}) {
  return (
    <div className="feature-item">
      {image && <img src={image} className="image" alt={title} />}
      <div className="feature-content">
        <h2 className="feature-title">{title}</h2>
        <p className="feature-description">{description}</p>
      </div>
    </div>
  );
}
