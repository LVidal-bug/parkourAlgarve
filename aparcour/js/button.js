document.querySelector('.js-home-button').addEventListener("click", () => window.location.href = "index.html");
document.querySelector(".js-about-button").addEventListener("click", () => document.getElementById("about").scrollIntoView({ behavior: 'smooth' }));
document.querySelector(".js-info-button").addEventListener("click", () => window.location.href = "local.html");
document.querySelector(".js-register-button").addEventListener("click", () => window.open('https://docs.google.com/forms/d/e/1FAIpQLSd4xyxp3TCe1OJ0YBv7mRuyWCl4DCWe8NC6JrSygfE-Z3flIA/viewform' , '_blank'));