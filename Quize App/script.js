// Utkarsh Kumar
// Question Data & Quiz Logic

const questions = [
    {
        question:"Which language is used for web page structure?",
        options:["Java","HTML","Python","C++"],
        answer:"HTML"
    },
    {
        question:"Which CSS property changes text color?",
        options:["font-size","background","color","padding"],
        answer:"color"
    },
    {
        question:"Which keyword declares a variable in JavaScript?",
        options:["var","print","echo","input"],
        answer:"var"
    },
    {
        question:"Which company developed JavaScript?",
        options:["Microsoft","Netscape","Google","Apple"],
        answer:"Netscape"
    },
    {
        question:"Which method is used to select an element by ID?",
        options:[
            "querySelectorAll",
            "getElementById",
            "getClassName",
            "innerHTML"
        ],
        answer:"getElementById"
    }
];

const questionText = document.getElementById("question");
const optionButtons = document.querySelectorAll(".option");

let currentQuestion = 0;
let score = 0;

function loadQuestion(){

    const data = questions[currentQuestion];

    questionText.textContent = data.question;

    optionButtons.forEach((button,index)=>{
        button.textContent = data.options[index];
        button.disabled = false;
        button.classList.remove("correct","wrong");
    });

}

loadQuestion();


// Bharat Sharma
// Score Calculation

function checkAnswer(selected){

    const correctAnswer = questions[currentQuestion].answer;

    optionButtons.forEach(button=>{

        button.disabled = true;

        if(button.textContent === correctAnswer){
            button.classList.add("correct");
        }

        if(
            button.textContent === selected &&
            selected !== correctAnswer
        ){
            button.classList.add("wrong");
        }

    });

    if(selected === correctAnswer){
        score++;
    }

}

optionButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        checkAnswer(button.textContent);

    });

});


// Rahul Verma
// Quiz UI Management

const nextBtn = document.getElementById("nextBtn");

nextBtn.addEventListener("click",()=>{

    currentQuestion++;

    if(currentQuestion < questions.length){

        loadQuestion();

    }else{

        showResult();

    }

});


// Aryan Singh
// Result Screen

const quiz = document.getElementById("quiz");
const resultBox = document.getElementById("resultBox");
const scoreText = document.getElementById("scoreText");
const restartBtn = document.getElementById("restartBtn");

function showResult(){

    quiz.classList.add("hidden");
    resultBox.classList.remove("hidden");

    const percentage = Math.round(
        (score / questions.length) * 100
    );

    scoreText.textContent =
        `Score: ${score}/${questions.length} (${percentage}%)`;

}

restartBtn.addEventListener("click",()=>{

    currentQuestion = 0;
    score = 0;

    quiz.classList.remove("hidden");
    resultBox.classList.add("hidden");

    loadQuestion();

});