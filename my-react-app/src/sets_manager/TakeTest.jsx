import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import "../styles/App.css"; 

export default function TakeTest() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const res = await fetch(`/api/tests/${testId}`);
        const data = await res.json();
        
        if (data.success) {
          setTest(data.test);
          const setRes = await fetch(`/api/setcards/${data.test.setId}`);
          const setData = await setRes.json();
          
          if (setData.cards) {
            generateQuestions(setData.cards);
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchTestData();
  }, [testId]);


  const generateQuestions = (cards) => {
    if (!cards || cards.length === 0) return;

    const formatted = cards.map((card) => {
      const currentId = card._id || card.id;
      let wrongOptions = cards
        .filter((c) => (c._id || c.id) !== currentId)
        .map((c) => c.definition);

      wrongOptions = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 3);

      const allOptions = [...wrongOptions, card.definition].sort(
        () => Math.random() - 0.5
      );

      return {
        term: card.term,
        correct: card.definition,
        options: allOptions,
      };
    });
    setQuestions(formatted);
  };

  const handleAnswer = (answer) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);

    setTimeout(() => {
      if (answer === questions[currentIdx].correct) {
        setScore((prev) => prev + 1);
      }

      if (currentIdx + 1 < questions.length) {
        setCurrentIdx((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        setIsFinished(true);
      }
    }, 800);
  };

  if (!test || questions.length === 0) return <div className="loader">Loading test...</div>;

  if (isFinished) {
    return (
      <div className="test-container result-screen">
        <h1>Test Completed!</h1>
        <p className="final-score">Score: {score} / {questions.length}</p>
        <button className="create-btn" onClick={() => navigate("/library")}>
          Return to Library
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="test-page-container">
      <div className="test-header">
        <span className="question-count">Question {currentIdx + 1} / {questions.length}</span>
        <span className="test-timer">Time: {test.timeLimit} min</span>
      </div>

      <div className="question-card">
        <h2 className="term-display">{currentQ.term}</h2>
      </div>

      <div className="options-list">
        {currentQ.options.map((opt, i) => {
          const isCorrect = opt === currentQ.correct;
          const isSelected = opt === selectedAnswer;
          
          const statusClass = isSelected 
            ? (isCorrect ? "correct" : "incorrect") 
            : "";

          return (
            <button
              key={i}
              className={`option-button ${statusClass}`}
              onClick={() => handleAnswer(opt)}
              disabled={!!selectedAnswer}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}