const menuBtn = document.querySelector('#hamburguer-button')
const menu = document.querySelector('.navcontent')
const hamburguer = document.querySelector('#hamburguer')
const x_button = document.querySelector('#X-button')

menuBtn.addEventListener('click', () =>{
    menu.classList.toggle('hide-nav')
    hamburguer.classList.toggle('hide-nav')
    x_button.classList.toggle('hide-nav')
})