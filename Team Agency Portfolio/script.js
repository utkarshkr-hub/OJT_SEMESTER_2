// Utkarsh Kumar
// Theme Toggle Section

const themeBtn = document.getElementById("themeBtn");

if(localStorage.getItem("theme") === "dark"){
    document.body.classList.add("dark");
    themeBtn.textContent = "☀️";
}

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){
        localStorage.setItem("theme","dark");
        themeBtn.textContent = "☀️";
    }else{
        localStorage.setItem("theme","light");
        themeBtn.textContent = "🌙";
    }
});


// Bharat Sharma
// Contact Form Validation

const form = document.getElementById("contactForm");
const result = document.getElementById("result");

form.addEventListener("submit",(e)=>{
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if(name === "" || email === "" || message === ""){
        result.textContent = "Please fill all fields";
        result.style.color = "red";
        return;
    }

    result.textContent = "Message Sent Successfully";
    result.style.color = "green";

    form.reset();
});


// Rahul Verma
// Team Section Managed


// Aryan Singh
// Project Showcase Managed