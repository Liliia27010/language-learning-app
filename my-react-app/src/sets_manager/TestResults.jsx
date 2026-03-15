import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";

export default function TestResults() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/tests/${testId}/results`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await response.json();
        if (data.success) {
          setResults(data.results);
        }
      } catch (err) {
        console.error("Failed to fetch results", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [testId]);

  const formatTime = (totalSeconds) => {
    if (!totalSeconds && totalSeconds !== 0) return "0:00";
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (loading) return <div className="loader">Loading results...</div>;

  return (
    <div className="library-container">
        <button className="create-btn" onClick={() => navigate("/library")}>
          ^ back to the Library
        </button>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Student Results</h2>
      </div>

      {results.length > 0 ? (
        <table className="results-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Score (Points)</th>
              <th>Time Used</th>
              <th>Completion Date</th>
            </tr>
          </thead>
          <tbody>
            {results.map((res) => (
              <tr key={res._id}>
                <td><strong>{res.studentName || "Unknown Student"}</strong></td>
                <td>{res.score} points</td>
                <td>{formatTime(res.timeTaken)} min</td>
                <td>{new Date(res.completedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          <p>No students have completed this test yet.</p>
        </div>
      )}
    </div>
  );
}