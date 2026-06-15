// frontend/src/pages/Recommend.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for routing
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Recommend() {
  const [step, setStep] = useState(0); 
  const [answers, setAnswers] = useState({});
  const [recommendations, setRecommendations] = useState([]);

  const questions = [
    {
      id: 'vibe',
      text: 'What vibe are you going for tonight?',
      options: ['Lighthearted & Fun', 'Edge of my seat', 'Mind-bending', 'Emotional rollercoaster']
    },
    {
      id: 'setting',
      text: 'Which setting sounds best right now?',
      options: ['Outer space / Future', 'Gritty reality', 'Fantasy realm', 'Historical past']
    },
    {
      id: 'format',
      text: 'What kind of commitment are we talking?',
      options: ['Just a Movie', 'A new TV Show', 'Surprise me with either']
    }
  ];

  const handleOptionClick = (questionId, answer) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    
    if (step < questions.length) {
      setStep(step + 1);
    } else {
      generateRecommendations(newAnswers, false);
    }
  };

  const generateRecommendations = async (finalAnswers, isSurprise) => {
    setStep(questions.length + 1); 
    try {
      const payload = isSurprise ? { surpriseMe: true } : { answers: finalAnswers };
      const response = await axios.post('/api/recommend', payload);
      
      if (response.data.success) {
        setRecommendations(response.data.data.results); 
        setStep(questions.length + 2); 
      }
    } catch (error) {
      console.error(error);
      toast.error('The Sensei is meditating. Please try again later.');
      setStep(0);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setRecommendations([]);
    setStep(0);
  };

  return (
    <div className="recommend-wrapper">
      <div className="recommend-bg-glow glow-1"></div>
      <div className="recommend-bg-glow glow-2"></div>

      <div className="page-container recommend-content">
        
        {step === 0 && (
          <div className="recommend-intro animate-fade-in">
            <h1 className="recommend-hero-title">Ask the Sensei</h1>
            <p className="recommend-hero-subtitle">Bypass the endless scrolling. Let our AI analyze your mood and curate the perfect watch.</p>
            
            <div className="recommend-actions">
              <button className="btn-crimson btn-action-large" onClick={() => setStep(1)}>
                Start the Quiz
              </button>
              <button className="btn-outline-play btn-action-large" onClick={() => generateRecommendations({}, true)}>
                Surprise Me ✨
              </button>
            </div>
          </div>
        )}

        {step > 0 && step <= questions.length && (
          <div className="recommend-quiz animate-fade-in">
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{width: `${(step / questions.length) * 100}%`}}></div>
            </div>
            <p className="quiz-step-text">Question {step} of {questions.length}</p>
            
            <h2 className="quiz-question-text">{questions[step - 1].text}</h2>
            
            <div className="quiz-options-grid">
              {questions[step - 1].options.map((opt, idx) => (
                <button 
                  key={idx} 
                  className="quiz-glass-btn"
                  onClick={() => handleOptionClick(questions[step - 1].id, opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === questions.length + 1 && (
          <div className="recommend-loading animate-fade-in">
            <div className="ai-pulse-ring"></div>
            <h2 className="loading-title">Consulting the Oracle...</h2>
            <p className="loading-subtitle">Synthesizing millions of data points to find your match.</p>
          </div>
        )}

        {step === questions.length + 2 && (
          <div className="recommend-results animate-fade-in">
            <div className="results-header">
              <h2 className="results-hero-title">Your Curated Picks</h2>
              <button className="btn-outline-play-small" onClick={resetQuiz}>&#8634; Restart</button>
            </div>
            
            <div className="results-dossier-grid">
              {recommendations.map((item, idx) => {
                // If TMDB ID exists, make it a link. Otherwise, just a div.
                const CardWrapper = item.id ? Link : 'div';
                const linkProps = item.id ? { to: `/media/${item.media_type}/${item.id}` } : {};

                return (
                  <CardWrapper key={idx} className="ai-dossier-card has-poster" {...linkProps}>
                    
                    {/* Poster Section */}
                    <div className="dossier-poster-container">
                      {item.poster_url ? (
                        <img src={item.poster_url} alt={item.title} className="dossier-poster" />
                      ) : (
                        <div className="dossier-poster-placeholder">No Image</div>
                      )}
                    </div>

                    {/* Info Section */}
                    <div className="dossier-info-container">
                      <div className="dossier-header">
                        <div>
                          <h3 className="dossier-title">{item.title}</h3>
                          <span className="dossier-year">{item.year}</span>
                        </div>
                        <span className="dossier-badge">{item.type}</span>
                      </div>
                      <div className="dossier-body">
                        <span className="dossier-label">The Sensei's Reasoning:</span>
                        <p className="dossier-reason">{item.reason}</p>
                      </div>
                    </div>

                  </CardWrapper>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}