const inputSelect = document.querySelector('.select')
const label = document.querySelector('.label')
const form = document.querySelector('.back')
inputSelect.addEventListener('change', function (e) {
    console.log('todos')
    label.innerText = ''
    label.append(`${e.target.value}`)
    document.submitForm.submit()
})
