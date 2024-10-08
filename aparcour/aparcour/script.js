const infoLocBtn = document.querySelector('.infoLocBtn')
const img = document.querySelector('.loc-recinto-img')

infoLocBtn.addEventListener('click', ()=>{
    if (img.classList[1] == 'hide'){
        img.classList.remove('hide')
        img.classList.add('show')
        infoLocBtn.innerText = 'Mostrar menos'
    }else{
        img.classList.remove('show')
        img.classList.add('hide')
        infoLocBtn.innerText = 'Mostrar mais'

    }
})