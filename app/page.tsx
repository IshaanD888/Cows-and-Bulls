"use client";


// --- Cows and Bulls Game Logic ---

// Generate a random 4-digit number with no repeating digits
function generateSecretNumber(): string {
  const digits = Array.from({ length: 10 }, (_, i) => i.toString());
  let result = "";
  while (result.length < 4) {
    const idx = Math.floor(Math.random() * digits.length);
    // First digit can't be zero
    if (result.length === 0 && digits[idx] === "0") continue;
    result += digits[idx];
    digits.splice(idx, 1);
  }
  return result;
}

// Validate guess: must be 4 unique digits
function validateGuess(guess: string): string | null {
  if (!/^[0-9]{4}$/.test(guess)) return "Input must be a 4-digit number.";
  if (new Set(guess).size !== 4) return "Digits must not repeat.";
  return null;
}

// Calculate bulls (right digit, right place) and cows (right digit, wrong place)
function getBullsAndCows(secret: string, guess: string): { bulls: number; cows: number } {
  let bulls = 0, cows = 0;
  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) bulls++;
    else if (secret.includes(guess[i])) cows++;
  }
  return { bulls, cows };
}

import React, { useState } from "react";

// --- Main Game Component ---
export default function CowsAndBulls() {
  // State variables
  const [secret, setSecret] = useState(generateSecretNumber()); // Secret number
  const [guess, setGuess] = useState(""); // Current guess
  const [history, setHistory] = useState<{ guess: string; bulls: number; cows: number }[]>([]); // Guess history
  const [attempts, setAttempts] = useState(0); // Attempt count
  const [message, setMessage] = useState(""); // Feedback message
  const [gameOver, setGameOver] = useState(false); // Game over flag
  const [feedbackType, setFeedbackType] = useState<'none' | 'success' | 'fail' | 'invalid'>("none");

  // Sound effects
  function playSound(type: 'success' | 'fail' | 'invalid') {
    let url = '';
    if (type === 'success') url = 'https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae6c2.mp3'; // win
    if (type === 'fail') url = 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b7b7e.mp3'; // lose
    if (type === 'invalid') url = 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b7b7e.mp3'; // error
    if (url) {
      const audio = new Audio(url);
      audio.volume = 0.25;
      audio.play();
    }
  }

  // Handle guess submission
  function handleGuess(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (gameOver) return;
    const error = validateGuess(guess);
    if (error) {
      setMessage(error);
      setFeedbackType('invalid');
      playSound('invalid');
      return;
    }
    const { bulls, cows } = getBullsAndCows(secret, guess);
    const newHistory = [...history, { guess, bulls, cows }];
    setHistory(newHistory);
    setAttempts(attempts + 1);
    setMessage(`${bulls} bulls, ${cows} cows`);
    setGuess("");
    if (bulls === 4) {
      setGameOver(true);
      setMessage("Congratulations! You guessed the number! 🎉");
      setFeedbackType('success');
      playSound('success');
    } else if (attempts + 1 >= 10) {
      setGameOver(true);
      setMessage(`Game over! The number was ${secret}.`);
      setFeedbackType('fail');
      playSound('fail');
    } else {
      setFeedbackType('fail');
      playSound('fail');
    }
  }

  // Handle replay (reset game)
  function handleReplay() {
    setSecret(generateSecretNumber());
    setGuess("");
    setHistory([]);
    setAttempts(0);
    setMessage("");
    setGameOver(false);
    setFeedbackType('none');
  }

  // --- UI ---
  return (
    <>
      {/* Google Fonts are loaded in _document.js for best practice */}
      <div className="cb-modern-bg">
        <div className="cb-modern-container">
          <h1 className="cb-modern-title">Cows &amp; Bulls</h1>
          <p className="cb-modern-desc">
            <span>Guess the <b>secret 4-digit number</b>.<br /></span>
            <span>No repeating digits.<br /></span>
            <span>After each guess, you&apos;ll get feedback in the form of <b>bulls</b> (correct digit, correct place) and <b>cows</b> (correct digit, wrong place).<br /></span>
            <span>You have <b>10 attempts</b>!</span>
          </p>
          <form onSubmit={handleGuess} className="cb-modern-form">
            <input
              type="text"
              value={guess}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuess(e.target.value)}
              maxLength={4}
              disabled={gameOver}
              className="cb-modern-input"
              placeholder="Enter 4 digits"
              inputMode="numeric"
              pattern="[0-9]{4}"
              autoFocus
            />
            <button
              type="submit"
              disabled={gameOver}
              className="cb-modern-btn"
            >
              Guess
            </button>
          </form>
          {message && (
            <div
              className={`cb-modern-message${gameOver ? ' cb-modern-message-final' : ''}`}
              style={{
                background:
                  feedbackType === 'success' ? 'linear-gradient(90deg,#bbf7d0 0%,#f0fdfa 100%)' :
                  feedbackType === 'fail' ? 'linear-gradient(90deg,#fee2e2 0%,#f0fdfa 100%)' :
                  feedbackType === 'invalid' ? 'linear-gradient(90deg,#fef9c3 0%,#f0fdfa 100%)' :
                  'none',
                color:
                  feedbackType === 'success' ? '#059669' :
                  feedbackType === 'fail' ? '#dc2626' :
                  feedbackType === 'invalid' ? '#b45309' :
                  undefined,
                borderRadius: '8px',
                padding: '0.5em 0.7em',
                marginBottom: '0.7rem',
                fontWeight: 700,
                boxShadow: feedbackType !== 'none' ? '0 2px 8px #e0e7ff' : undefined,
                transition: 'all 0.2s',
              }}
            >
              {message}
            </div>
          )}
          <div className="cb-modern-attempts">Attempts: <b>{attempts}</b> / 10</div>
          <ul className="cb-modern-history">
            {history.map((h, i) => {
              let rowClass = "cb-modern-history-item";
              if (i === history.length - 1) {
                if (feedbackType === 'success') rowClass += ' cb-success';
                else if (feedbackType === 'fail') rowClass += ' cb-fail';
                else if (feedbackType === 'invalid') rowClass += ' cb-invalid';
              }
              return (
                <li key={i} className={rowClass}>
                  <span className="cb-modern-history-num">#{i + 1}</span>
                  <span className="cb-modern-history-guess">{h.guess}</span>
                  <span className="cb-modern-history-feedback">
                    {h.bulls} bulls, {h.cows} cows
                  </span>
                </li>
              );
            })}
          </ul>
          {gameOver && (
            <button
              onClick={handleReplay}
              className="cb-modern-btn cb-modern-replay"
            >
              Play Again
            </button>
          )}
        </div>
      </div>
    </>
  );
}
