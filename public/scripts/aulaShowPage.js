let string = aula.slice(1, aula.length - 1)
let pArray = []
let startPOINT = 0
function howToDisplay(str) {
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '\r') {
            pArray.push(str.slice(startPOINT, i))
            startPOINT = i + 2
        }
        if (i === str.length - 1 && i !== '\r' && !pArray.length) {
            pArray.push(str.slice(0, str.length))
        }
    }

    return displayP(pArray)
}
howToDisplay(string)

function displayP(array) {
    const textDIV = document.querySelector('.textDIV22')
    let str = ''
    for (let p of array) {
        str = str + `<p>${p}</p>`
    }
    return textDIV.innerHTML = str
}
