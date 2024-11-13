import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Timer, RefreshCw, Repeat, Award } from 'lucide-react';

const TypingSpeedTest = () => {
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isActive, setIsActive] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [mistakes, setMistakes] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);

  const timerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchText();
    return () => clearInterval(timerRef.current);
  }, []);

  const fetchText = async () => {
    try {
      const response = await axios.get('https://typing-speed-test-4reg.vercel.app/proxy-text');
      setText(response.data.text);
      resetTest();
    } catch (error) {
      console.error('Error fetching text:', error);
    }
  };

  const calculateGrossWPM = (typedChars, timeInMinutes) => {
    return Math.round((typedChars / 5) / timeInMinutes);
  };

  const calculateResults = () => {
    // Safety check
    if (!startTime || userInput.length === 0) return;

    // Calculate actual time taken in minutes (from start until now or end)
    const endTime = Date.now();
    const timeInMinutes = (endTime - startTime) / 60000; // Convert ms to minutes

    // Count all typed characters (including spaces)
    const typedCharacters = userInput.length;

    // Calculate Gross WPM
    const grossWPM = calculateGrossWPM(typedCharacters, timeInMinutes);

    // Count mistakes
    let errorCount = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] !== text[i]) {
        errorCount++;
      }
    }

    // Calculate accuracy
    const accuracyPercent = Math.round(
      ((typedCharacters - errorCount) / typedCharacters) * 100
    ) || 0;

    // Set the states with new calculations
    setSpeed(Math.max(0, grossWPM));
    setAccuracy(accuracyPercent);
    setMistakes(errorCount);
  };

  const startTest = () => {
    if (!isActive && userInput.length === 0) {
      setIsActive(true);
      const now = Date.now();
      setStartTime(now); // Set the exact start time
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            endTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const endTest = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsActive(false);
    calculateResults(); // Calculate final results
    setShowResults(true);
  };

  useEffect(() => {
    if (isActive && startTime) {
      calculateResults();
    }
  }, [userInput, timeLeft]);

  const resetTest = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setUserInput('');
    setTimeLeft(timeLimit);
    setIsActive(false);
    setSpeed(0);
    setAccuracy(100);
    setMistakes(0);
    setCurrentPosition(0);
    setShowResults(false);
    setStartTime(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    if (!isActive && inputValue.length === 1) {
      startTest();
    }
    if (isActive && inputValue.length <= text.length) {
      setUserInput(inputValue);
      setCurrentPosition(inputValue.length);
    }
  };

  const handleTimeLimitChange = (e) => {
    const newTimeLimit = Number(e.target.value);
    setTimeLimit(newTimeLimit);
    setTimeLeft(newTimeLimit);
    resetTest();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Typing Speed Test</h1>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Timer className="w-6 h-6" />
              <span className="text-2xl">{timeLeft}s</span>
            </div>
          </div>

          <div className="relative mb-6 p-4 bg-gray-50 rounded-lg text-lg leading-relaxed">
            {text.split('').map((char, index) => (
              <span
                key={index}
                className={`font-mono ${
                  index === currentPosition
                    ? 'bg-blue-200 border-b-2 border-blue-500'
                    : index < currentPosition
                    ? userInput[index] === char
                      ? 'text-gray-400'
                      : 'text-red-500 bg-red-100'
                    : ''
                }`}
              >
                {char}
              </span>
            ))}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
            placeholder="Start typing here..."
            disabled={!isActive && userInput.length > 0}
          />

          <div className="flex justify-between items-center mt-6">
            <div>
              <label className="mr-2 text-gray-700 font-medium">Time Limit:</label>
              <select
                value={timeLimit}
                onChange={handleTimeLimitChange}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                disabled={isActive}
              >
                <option value={15}>15 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>60 seconds</option>
              </select>
            </div>
            <div className="flex gap-4">
              <button
                onClick={resetTest}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Reset
              </button>
              <button
                onClick={fetchText}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Repeat className="w-5 h-5" />
                New Text
              </button>
            </div>
          </div>
        </div>

        {showResults && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Your Results</h2>
                <button
                  onClick={() => setShowResults(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Award className="w-6 h-6" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <h3 className="text-lg font-semibold text-blue-800">Speed</h3>
                  <p className="text-3xl font-bold text-blue-600">{speed} WPM</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <h3 className="text-lg font-semibold text-green-800">Accuracy</h3>
                  <p className="text-3xl font-bold text-green-600">{accuracy}%</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center col-span-2">
                  <h3 className="text-lg font-semibold text-red-800">Mistakes</h3>
                  <p className="text-3xl font-bold text-red-600">{mistakes}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TypingSpeedTest;