const title = document.querySelector('.title')
const text = document.querySelector('.text')
const body = document.querySelector('body')
const about = document.querySelector('.about')
const img = document.querySelector('.carouselIMAGE')
const profile = document.querySelector('.perfil')

const tl = new TimelineMax()

let run = true

function animate(run) {
    if (!run) return null
    tl.fromTo(title, 0.5, { opacity: 0, x: 30 }, { opacity: 1, x: 0, ease: Power2.easeInOut },)
        .fromTo(text, 0.5, { opacity: 0, x: 100 }, { opacity: 1, x: 0, ease: Power2.easeInOut })
        .fromTo(img, 1, { y: '-100%' }, { y: '0%', ease: Power2.easeInOut }, "-=0.5")
        .fromTo(profile, 1, { opacity: 0, y: '-100%' }, { opacity: 1, y: '0%' }, "-=0.5")
}


if (noVideo) {
    window.addEventListener('scroll', () => {
        if (window.scrollY >= 150 && window.scrollY <= 200) {
            animate(run)
            run = false
            console.log('oi')
        }
    })
}







