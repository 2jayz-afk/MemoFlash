
let flashcards = [];

try {
    flashcards = JSON.parse(localStorage.getItem("memoFlashCards")) || [];
} catch (error) {
    flashcards = [];
}

let editingId = null;

const navButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");

const flashcardForm = document.getElementById("flashcardForm");
const questionInput = document.getElementById("questionInput");
const answerInput = document.getElementById("answerInput");
const subjectInput = document.getElementById("subjectInput");

const addFlashcardBtn = document.getElementById("addFlashcardBtn");
const cancelFormBtn = document.getElementById("cancelFormBtn");
const flashcardList = document.getElementById("flashcardList");

const searchInput = document.getElementById("searchInput");
const subjectFilter = document.getElementById("subjectFilter");

const totalFlashcards = document.getElementById("totalFlashcards");
const totalSubjects = document.getElementById("totalSubjects");
const totalQuizzes = document.getElementById("totalQuizzes");

function saveToLocalStorage() {
    localStorage.setItem("memoFlashCards", JSON.stringify(flashcards));
}

function updateDashboard() {
    const subjects = [...new Set(
        flashcards.map(card => card.subject.toLowerCase())
    )];

    totalFlashcards.textContent = flashcards.length;
    totalSubjects.textContent = subjects.length;

    const quizResults = JSON.parse(
        localStorage.getItem("memoFlashResults") || "[]"
    );

    totalQuizzes.textContent = quizResults.length;
}

function showPage(pageId) {
    pages.forEach(page => {
        page.classList.remove("active");
    });

    navButtons.forEach(button => {
        button.classList.remove("active");
    });

    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    const selectedButton = document.querySelector(
        `.nav-btn[data-page="${pageId}"]`
    );

    if (selectedButton) {
        selectedButton.classList.add("active");
    }

    if (pageId === "study") {
        displayStudyCard();
    }

    if (pageId === "progress") {
        displayProgress();
    }
}

navButtons.forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });
});

function showFlashcardForm() {
    editingId = null;
    flashcardForm.reset();

    document.getElementById("formTitle").textContent =
        "Create Flashcard";

    document.getElementById("saveFlashcardBtn").textContent =
        "Save Flashcard";

    flashcardForm.hidden = false;
    questionInput.focus();
}

addFlashcardBtn.addEventListener("click", showFlashcardForm);

function hideFlashcardForm() {
    flashcardForm.hidden = true;
    flashcardForm.reset();
    editingId = null;
}

cancelFormBtn.addEventListener("click", hideFlashcardForm);

flashcardForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();
    const subject = subjectInput.value.trim();

    if (!question || !answer || !subject) {
        alert("Please complete all fields.");
        return;
    }

    if (editingId !== null) {
        const card = flashcards.find(
            item => item.id === editingId
        );

        if (card) {
            card.question = question;
            card.answer = answer;
            card.subject = subject;
        }

        alert("Flashcard updated successfully!");

    } else {
        const newFlashcard = {
            id: Date.now().toString(),
            question: question,
            answer: answer,
            subject: subject
        };

        flashcards.push(newFlashcard);

        alert("Flashcard added successfully!");
    }

    saveToLocalStorage();
    renderFlashcards();
    updateDashboard();
    hideFlashcardForm();
});

function renderFlashcards() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedSubject = subjectFilter.value;

    flashcardList.innerHTML = "";

    const filteredCards = flashcards.filter(card => {
        const matchesSearch =
            card.question.toLowerCase().includes(searchTerm) ||
            card.answer.toLowerCase().includes(searchTerm) ||
            card.subject.toLowerCase().includes(searchTerm);

        const matchesSubject =
            selectedSubject === "all" ||
            card.subject.toLowerCase() === selectedSubject.toLowerCase();

        return matchesSearch && matchesSubject;
    });

    if (filteredCards.length === 0) {
        const message = document.createElement("p");

        message.className = "empty-message";
        message.textContent = flashcards.length === 0
            ? "No flashcards added yet. Click Add Flashcard to get started!"
            : "No matching flashcards found.";

        flashcardList.appendChild(message);
        return;
    }

    filteredCards.forEach(card => {
        const cardElement = document.createElement("div");
        cardElement.className = "flashcard-item";

        const question = document.createElement("h3");
        question.textContent = card.question;

        const answer = document.createElement("p");
        answer.textContent = "Answer: " + card.answer;

        const subject = document.createElement("span");
        subject.className = "subject-tag";
        subject.textContent = card.subject;

        const actions = document.createElement("div");
        actions.className = "card-actions";

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            editFlashcard(card.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteFlashcard(card.id);
        });

        actions.append(editButton, deleteButton);

        cardElement.append(
            question,
            answer,
            subject,
            actions
        );

        flashcardList.appendChild(cardElement);
    });
}

function editFlashcard(id) {
    const card = flashcards.find(item => item.id === id);

    if (!card) return;

    editingId = id;

    questionInput.value = card.question;
    answerInput.value = card.answer;
    subjectInput.value = card.subject;

    document.getElementById("formTitle").textContent =
        "Edit Flashcard";

    document.getElementById("saveFlashcardBtn").textContent =
        "Update Flashcard";

    flashcardForm.hidden = false;
    questionInput.focus();
}

function deleteFlashcard(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this flashcard?"
    );

    if (!confirmed) return;

    flashcards = flashcards.filter(card => card.id !== id);

    saveToLocalStorage();
    renderFlashcards();
    updateDashboard();

    alert("Flashcard deleted successfully!");
}

searchInput.addEventListener("input", renderFlashcards);
subjectFilter.addEventListener("change", renderFlashcards);

function updateSubjectFilter() {
    const currentValue = subjectFilter.value;

    const subjects = [...new Set(
        flashcards.map(card => card.subject.trim())
    )].sort();

    subjectFilter.innerHTML = "";

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All Subjects";

    subjectFilter.appendChild(allOption);

    subjects.forEach(subject => {
        const option = document.createElement("option");

        option.value = subject;
        option.textContent = subject;

        subjectFilter.appendChild(option);
    });

    const matchingSubject = subjects.find(
        subject => subject.toLowerCase() === currentValue.toLowerCase()
    );

    subjectFilter.value =
        currentValue === "all" ? "all" : matchingSubject || "all";
}

function updateQuizSubjects() {
    const quizSubject = document.getElementById("quizSubject");
    const currentValue = quizSubject.value;

    quizSubject.innerHTML = "";

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All Subjects";

    quizSubject.appendChild(allOption);

    const subjects = [...new Set(
        flashcards.map(card => card.subject.trim())
    )].sort();

    subjects.forEach(subject => {
        const option = document.createElement("option");

        option.value = subject;
        option.textContent = subject;

        quizSubject.appendChild(option);
    });

    const matchingSubject = subjects.find(
        subject => subject.toLowerCase() === currentValue.toLowerCase()
    );

    quizSubject.value =
        currentValue === "all" ? "all" : matchingSubject || "all";
}

function refreshApp() {
    updateSubjectFilter();
    updateQuizSubjects();
    renderFlashcards();
    updateDashboard();
}

refreshApp();



let currentStudyIndex = 0;
let isAnswerVisible = false;
let studyFlashcards = [];

const studySubject = document.getElementById("studySubject");

function updateStudySubjects() {
    const currentSubject = studySubject.value;

    const subjects = [
        ...new Set(flashcards.map(card => card.subject))
    ];

    studySubject.innerHTML = '<option value="all">All Subjects</option>';

    subjects.forEach(subject => {
        const option = document.createElement("option");
        option.value = subject;
        option.textContent = subject;
        studySubject.appendChild(option);
    });

    studySubject.value = subjects.includes(currentSubject)
        ? currentSubject
        : "all";

    filterStudyCards();
}

function filterStudyCards() {
    const selectedSubject = studySubject.value;

    studyFlashcards = flashcards.filter(card =>
        selectedSubject === "all" ||
        card.subject === selectedSubject
    );

    currentStudyIndex = 0;
    isAnswerVisible = false;

    displayStudyCard();
}

function displayStudyCard() {
    const studyText = document.getElementById("studyText");
    const studyCounter = document.getElementById("studyCounter");

    if (studyFlashcards.length === 0) {
        studyText.textContent =
            "No flashcards available for this subject.";

        studyCounter.textContent = "0 of 0";
        return;
    }

    const card = studyFlashcards[currentStudyIndex];

    studyText.textContent = isAnswerVisible
        ? card.answer
        : card.question;

    studyCounter.textContent =
        `${currentStudyIndex + 1} of ${studyFlashcards.length}`;
}

function flipCard() {
    if (studyFlashcards.length === 0) return;

    isAnswerVisible = !isAnswerVisible;
    displayStudyCard();
}

function nextCard() {
    if (studyFlashcards.length === 0) return;

    currentStudyIndex =
        (currentStudyIndex + 1) % studyFlashcards.length;

    isAnswerVisible = false;
    displayStudyCard();
}

function previousCard() {
    if (studyFlashcards.length === 0) return;

    currentStudyIndex =
        (currentStudyIndex - 1 + studyFlashcards.length) %
        studyFlashcards.length;

    isAnswerVisible = false;
    displayStudyCard();
}

studySubject.addEventListener("change", filterStudyCards);

document.getElementById("flipCardBtn")
    .addEventListener("click", flipCard);

document.getElementById("nextCardBtn")
    .addEventListener("click", nextCard);

document.getElementById("previousCardBtn")
    .addEventListener("click", previousCard);

updateStudySubjects();



const startQuizBtn = document.getElementById("startQuizBtn");
const quizContainer = document.getElementById("quizContainer");

let currentQuizQuestions = [];
let currentQuizIndex = 0;
let quizScore = 0;
let answerLocked = false;

function shuffleArray(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

function startQuiz() {
    const selectedSubject = document.getElementById("quizSubject").value;

    const availableCards = flashcards.filter(card =>
        selectedSubject === "all" ||
        card.subject.toLowerCase() === selectedSubject.toLowerCase()
    );

    if (availableCards.length < 2) {
        alert("You need at least two flashcards to start a quiz.");
        return;
    }

    currentQuizQuestions = shuffleArray(availableCards);
    currentQuizIndex = 0;
    quizScore = 0;

    displayQuizQuestion();
}

function displayQuizQuestion() {
    quizContainer.innerHTML = "";
    answerLocked = false;

    if (currentQuizIndex >= currentQuizQuestions.length) {
        finishQuiz();
        return;
    }

    const card = currentQuizQuestions[currentQuizIndex];

    const questionTitle = document.createElement("h3");
    questionTitle.textContent =
        "Question " + (currentQuizIndex + 1) +
        " of " + currentQuizQuestions.length;

    const questionText = document.createElement("h2");
    questionText.textContent = card.question;

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "quiz-options";

    const otherAnswers = [
        ...new Set(
            currentQuizQuestions
                .filter(item => item.id !== card.id)
                .map(item => item.answer.trim())
                .filter(answer =>
                    answer.toLowerCase() !== card.answer.trim().toLowerCase()
                )
        )
    ];

    const options = shuffleArray([
        card.answer,
        ...shuffleArray(otherAnswers).slice(0, 3)
    ]);

    options.forEach(option => {
        const optionButton = document.createElement("button");
        optionButton.className = "quiz-option";
        optionButton.textContent = option;

        optionButton.addEventListener("click", () => {
            checkQuizAnswer(option, card.answer, optionButton);
        });

        optionsContainer.appendChild(optionButton);
    });

    const feedback = document.createElement("p");
    feedback.id = "quizFeedback";

    quizContainer.append(
        questionTitle,
        questionText,
        optionsContainer,
        feedback
    );
}

function checkQuizAnswer(selectedAnswer, correctAnswer, selectedButton) {
    if (answerLocked) return;

    answerLocked = true;

    const feedback = document.getElementById("quizFeedback");
    const optionButtons = document.querySelectorAll(".quiz-option");

    optionButtons.forEach(button => {
        button.disabled = true;

        if (button.textContent === correctAnswer) {
            button.style.background = "#d1fae5";
            button.style.color = "#166534";
        }
    });

    if (selectedAnswer === correctAnswer) {
        quizScore++;
        feedback.textContent = "Correct! Well done.";
        feedback.style.color = "#15803d";
    } else {
        feedback.textContent = "Incorrect. The correct answer is: " + correctAnswer;
        feedback.style.color = "#dc2626";
    }

    const nextButton = document.createElement("button");
    nextButton.textContent =
        currentQuizIndex === currentQuizQuestions.length - 1
            ? "Finish Quiz"
            : "Next Question";

    nextButton.addEventListener("click", () => {
        currentQuizIndex++;
        displayQuizQuestion();
    });

    quizContainer.appendChild(nextButton);
}

function finishQuiz() {
    const totalQuestions = currentQuizQuestions.length;
    const percentage = Math.round((quizScore / totalQuestions) * 100);

    const result = {
        score: quizScore,
        total: totalQuestions,
        percentage: percentage,
        subject: document.getElementById("quizSubject").value,
        date: new Date().toISOString()
    };

    let quizResults = [];

    try {
        quizResults = JSON.parse(
            localStorage.getItem("memoFlashResults") || "[]"
        );
    } catch (error) {
        quizResults = [];
    }

    quizResults.push(result);

    localStorage.setItem(
        "memoFlashResults",
        JSON.stringify(quizResults)
    );

    updateDashboard();

    quizContainer.innerHTML = "";

    const resultTitle = document.createElement("h2");
    resultTitle.textContent = "Quiz Completed!";

    const scoreText = document.createElement("h3");
    scoreText.textContent =
        "Your Score: " + quizScore + " / " + totalQuestions;

    const percentageText = document.createElement("p");
    percentageText.textContent =
        "Percentage: " + percentage + "%";

   const message = document.createElement("p");

message.textContent =
    percentage >= 80
        ? "Yun oh! Keep it up!"
        : percentage >= 50
            ? "Good effort! Practice lang bro!"
            : percentage >= 0
                ? "Aray mo"
                : "Bawi Next time! Review more!";

    const retryButton = document.createElement("button");
    retryButton.textContent = "Try Again";
    retryButton.addEventListener("click", startQuiz);

    quizContainer.append(
        resultTitle,
        scoreText,
        percentageText,
        message,
        retryButton
    );
}

startQuizBtn.addEventListener("click", startQuiz);


function displayProgress() {
    const progressContainer = document.getElementById("progressContainer");

    progressContainer.innerHTML = "";

    let quizResults = [];

    try {
        quizResults = JSON.parse(
            localStorage.getItem("memoFlashResults") || "[]"
        );
    } catch (error) {
        quizResults = [];
    }

    if (quizResults.length === 0) {
        progressContainer.textContent =
            "No quiz results yet. Complete a quiz to track your progress!";
        return;
    }

    const totalQuizzes = quizResults.length;

    const averageScore = Math.round(
        quizResults.reduce((total, result) => {
            return total + result.percentage;
        }, 0) / totalQuizzes
    );

    const bestScore = Math.max(
        ...quizResults.map(result => result.percentage)
    );

    const summary = document.createElement("div");
    summary.className = "progress-summary";

    const total = document.createElement("div");
    total.innerHTML = `
        <h3>${totalQuizzes}</h3>
        <p>Total Quizzes</p>
    `;

    const average = document.createElement("div");
    average.innerHTML = `
        <h3>${averageScore}%</h3>
        <p>Average Score</p>
    `;

    const best = document.createElement("div");
    best.innerHTML = `
        <h3>${bestScore}%</h3>
        <p>Best Score</p>
    `;

    summary.append(total, average, best);

    const historyTitle = document.createElement("h2");
    historyTitle.textContent = "Quiz History";

    const history = document.createElement("div");
    history.className = "quiz-history";

    quizResults.slice().reverse().forEach((result, index) => {
        const item = document.createElement("div");
        item.className = "history-item";

        const subject = document.createElement("h3");
        subject.textContent = result.subject === "all"
            ? "All Subjects"
            : result.subject;

        const score = document.createElement("p");
        score.textContent =
            `Score: ${result.score}/${result.total} (${result.percentage}%)`;

        const date = document.createElement("p");
        date.textContent = new Date(result.date).toLocaleString();

        item.append(subject, score, date);
        history.appendChild(item);
    });

    progressContainer.append(summary, historyTitle, history);
}

