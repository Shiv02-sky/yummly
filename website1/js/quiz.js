// Quiz Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const quizStart = document.getElementById('quizStart');
    const quizContainer = document.getElementById('quizContainer');
    const quizResults = document.getElementById('quizResults');
    const startQuizBtn = document.getElementById('startQuizBtn');
    const nextQuestionBtn = document.getElementById('nextQuestionBtn');
    const retryQuizBtn = document.getElementById('retryQuizBtn');
    const shareQuizBtn = document.getElementById('shareQuizBtn');
    
    const currentQuestionElement = document.getElementById('currentQuestion');
    const totalQuestionsElement = document.getElementById('totalQuestions');
    const currentScoreElement = document.getElementById('currentScore');
    const questionTextElement = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    const finalScoreElement = document.getElementById('finalScore');
    const maxScoreElement = document.getElementById('maxScore');
    const resultMessageElement = document.getElementById('resultMessage');
    
    let allQuestions = []; // Full question bank from JSON
    let questions = []; // Selected 5 random questions
    let currentQuestionIndex = 0;
    let score = 0;
    let quizCompleted = false;
    
    // Load questions from JSON file
    fetch('data/quiz.json')
        .then(response => response.json())
        .then(data => {
            allQuestions = data.questions;
            totalQuestionsElement.textContent = allQuestions.length; // initial total
            maxScoreElement.textContent = allQuestions.length * 5;
        })
        .catch(error => {
            console.error('Error loading quiz questions:', error);
            showNotification('Failed to load quiz questions. Please try again later.', 'error');
        });
    
    // Start quiz
    startQuizBtn.addEventListener('click', startQuiz);
    
    // Next question
    nextQuestionBtn.addEventListener('click', nextQuestion);
    
    // Retry quiz
    retryQuizBtn.addEventListener('click', startQuiz);
    
    // Share quiz results
    shareQuizBtn.addEventListener('click', shareResults);
    
    function startQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        quizCompleted = false;
        
        // ✅ Select 5 random questions each time
        questions = shuffleArray([...allQuestions]).slice(0, 5);
        totalQuestionsElement.textContent = questions.length;
        maxScoreElement.textContent = questions.length * 5;
        
        // Hide start and results, show quiz
        quizStart.classList.add('hidden');
        quizResults.classList.add('hidden');
        quizContainer.classList.remove('hidden');
        
        // Reset UI
        currentScoreElement.textContent = score;
        nextQuestionBtn.classList.add('hidden');
        
        // Load first question
        loadQuestion();
    }
    
    function loadQuestion() {
        if (currentQuestionIndex >= questions.length) {
            endQuiz();
            return;
        }
        
        const question = questions[currentQuestionIndex];
        currentQuestionElement.textContent = currentQuestionIndex + 1;
        questionTextElement.textContent = question.question;
        
        // Clear previous options
        optionsContainer.innerHTML = '';
        
        // Shuffle answer options
        const allOptions = [...question.incorrect_answers, question.correct_answer];
        shuffleArray(allOptions);
        
        // Create option buttons
        allOptions.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            
            button.addEventListener('click', function() {
                selectAnswer(option, question.correct_answer);
            });
            
            optionsContainer.appendChild(button);
        });
    }
    
    function selectAnswer(selectedOption, correctAnswer) {
        if (quizCompleted) return;
        
        const optionButtons = document.querySelectorAll('.option-btn');
        
        // Disable all buttons and mark correct/incorrect
        optionButtons.forEach(button => {
            button.disabled = true;
            if (button.textContent === correctAnswer) {
                button.classList.add('correct');
            }
            if (button.textContent === selectedOption && selectedOption !== correctAnswer) {
                button.classList.add('incorrect');
            }
        });
        
        // Check if answer is correct
        if (selectedOption === correctAnswer) {
            score += 5;
            currentScoreElement.textContent = score;
        }
        
        // Show next button
        nextQuestionBtn.classList.remove('hidden');
        quizCompleted = true;
    }
    
    function nextQuestion() {
        currentQuestionIndex++;
        quizCompleted = false;
        loadQuestion();
        nextQuestionBtn.classList.add('hidden');
    }
    
    function endQuiz() {
        quizContainer.classList.add('hidden');
        quizResults.classList.remove('hidden');
        
        finalScoreElement.textContent = score;
        
        // Set result message based on score
        const percentage = (score / (questions.length * 5)) * 100;
        let message = '';
        
        if (percentage >= 80) {
            message = 'Amazing! You\'re a true food expert! 🍴🌟';
        } else if (percentage >= 60) {
            message = 'Great job! You know your food well! 😋';
        } else if (percentage >= 40) {
            message = 'Not bad! Keep exploring the food world! 🍕';
        } else {
            message = 'Keep trying! The kitchen is your playground! 👨‍🍳';
        }
        
        resultMessageElement.textContent = message;
        
        // Save high score (optional: store only highest score)
        let highScore = localStorage.getItem('quizHighScore') || 0;
        if (score > highScore) {
            localStorage.setItem('quizHighScore', score);
        }
    }
    
    function shareResults() {
        const shareText = `I scored ${score}/${questions.length * 5} on the Flavor Fiesta Food Quiz! Can you beat my score? 🍕🍔🍣`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Flavor Fiesta Quiz Results',
                text: shareText,
                url: window.location.href
            }).catch(err => {
                console.log('Error sharing:', err);
                copyToClipboard(shareText);
            });
        } else {
            copyToClipboard(shareText);
        }
    }
    
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Results copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
            showNotification('Failed to share results.', 'error');
        });
    }
    
    // Helper function to shuffle array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Simple fallback notification if not defined elsewhere
    function showNotification(message, type = 'info') {
        alert(message);
    }
});
