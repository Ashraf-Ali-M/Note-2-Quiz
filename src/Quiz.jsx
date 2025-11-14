import React, { useState } from 'react';

function Quiz({ quizData }) {
  const questions = quizData.questions;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(''); 

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionClick = (option) => {
    if (selectedOption) return; 

    setSelectedOption(option); 

    if (option === currentQuestion.answer) {
      setScore(score + 1);
      setFeedback('Correct!');
    } else {
      setFeedback(`Wrong. The correct answer was: ${currentQuestion.answer}`);
    }
  };

  const handleNextQuestion = () => {
    setFeedback('');
    setSelectedOption(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const getOptionClass = (option) => {
    if (!selectedOption) return 'quiz-option'; 

    if (option === currentQuestion.answer) {
      return 'quiz-option correct'; 
    }
    if (option === selectedOption && option !== currentQuestion.answer) {
      return 'quiz-option incorrect'; 
    }
    return 'quiz-option';
  };

  return (
    <div className="quiz-container">
      <h2>Your Generated Quiz</h2>

      {showResults ? (
        <div className="quiz-results">
          <h3>Quiz Complete!</h3>
          <p>You scored {score} out of {questions.length}</p>
        </div>
      ) : (
        <div className="question-card">
          <h4>Question {currentQuestionIndex + 1} / {questions.length}</h4>
          <p className="difficulty">({currentQuestion.difficulty})</p>
          <h3>{currentQuestion.question}</h3>
          
          <div className="options-container">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={getOptionClass(option)}
                onClick={() => handleOptionClick(option)}
                disabled={!!selectedOption} 
              >
                {option}
              </button>
            ))}
          </div>

          {feedback && (
            <div className="feedback-section">
              <p>{feedback}</p>
              <button onClick={handleNextQuestion} className="next-button">
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Quiz;