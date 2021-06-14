const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/wrapAsync.js')
const User = require('../models/user.js')
const Event = require('../models/event.js')
const { isLoggedIn, isInstructor, isUser, isAdmin } = require('../middleware.js')
const ExpressError = require('../utils/ExpressError.js')
const { validateEvent } = require('../utils/validateEvent.js')
const Spot = require('../models/spots.js')
//functions//

let date = []
function getDateArray(dateStart, dateEnd) {
    date = []
    if (!dateStart.length || !dateEnd.length) return date.push('Invalid Date')
    let currentDate = new Date(Date.now())
    let currentYear = currentDate.getFullYear()
    let currentMonth = currentDate.getMonth()
    let currentDay = currentDate.getDate()
    let currentDatestr = `${currentDay} ${currentMonth} ${currentYear}`
    let currentDatejs = Date.parse(currentDatestr)
    let months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
    let day = dateStart.substring(0, 2)
    let month = dateStart.substring(3, 5)
    let year = dateStart.substring(6, 10)

    if (day[0] === '0') {
        day = day.replace('0', '')
    }
    if (month[0] === '0') {
        month = month.replace('0', '')
    }
    let validationDate = new Date(year, month - 1, day)
    let startMonth = months[month - 1]
    let startDatestr = `${startMonth}/${day}/${year}`
    let startDatejs = Date.parse(`${month}/${day}/${year}`)
    //End date//

    let day1 = dateEnd.substring(0, 2)
    let month1 = dateEnd.substring(3, 5)
    if (day1[0] === '0') {
        day1 = day1.replace('0', '')
    }
    if (month1[0] === '0') {
        month1 = month1.replace('0', '')
    }
    let endMonth = months[month1 - 1]
    let year1 = dateEnd.substring(6, 10)
    let endDatestr = `${endMonth}/${day1}/${year1}`
    if (currentDatejs > startDatejs) return date.push('Invalid Date - To Late')
    if (startDatestr === endDatestr) return date.push(startDatestr)
    if (day1 >= day && month1 >= month && year1 > year) return date.push('Invalid Date - To Large')
    if (parseInt(day1) < parseInt(day) && parseInt(month1) <= parseInt(month) && parseInt(year1) === parseInt(year) || parseInt(month1) < parseInt(month) && parseInt(year1) === parseInt(year) || parseInt(year) > parseInt(year1)) return date.push('Invalid Date')
    date.push(startDatestr)
    date.push(endDatestr)

}

let validHour = true
let isNull = false
function validateHour(startHour, endHour, date) {
    isNull = false
    if (!endHour.length || !startHour.length) return isNull = true
    if (date.length === 1) {
        let hour1 = startHour.substring(0, 2)
        let hour2 = endHour.substring(0, 2)
        if (hour1 > 24 || hour2 > 24) return validHour = false
        if (hour2 < hour1) return validHour = false
        let min1 = startHour.substring(3, 5)
        let min2 = endHour.substring(3, 5)
        if (min1 > 59 || min2 > 59) return validHour = false
        if (min2 < min1 && hour1 === hour2) return validHour = false
    }
    return validHour = true
}

canBeWhiteListed = true
function validateWhiteList(date, date2) {
    console.log(date, date2)
    let currentDate = new Date(Date.now())
    let currentYear = currentDate.getFullYear()
    let currentMonth = currentDate.getMonth()
    let currentDay = currentDate.getDate()
    let currentHour = currentDate.getHours()
    let currentMinute = currentDate.getMinutes()
    let currentDatestr = `${currentDay}/${currentMonth}/${currentYear} ${currentHour}: ${currentMinute}`


    let currentDatejs = Date.parse(currentDatestr)
    let whiteListDatejs = Date.parse(date)

    let day = date.substring(0, 2)
    let month = date.substring(3, 5)
    let hour = date.substring(11, 13)
    let min = date.substring(14, 16)
    if (day[0] === '0') {
        day = day.replace('0', '')
    }
    if (month[0] === '0') {
        month = month.replace('0', '')
    }
    if (hour[0] === '0') {
        hour = hour.replace('0', '')
    }
    if (min[0] === '0') {
        min = min.replace('0', '')
    }
    let year = date.substring(6, 10)

    let hour1 = date2.substring(11, 13)
    let min1 = date2.substring(14, 16)
    let day1 = date2.substring(0, 2)
    let month1 = date2.substring(3, 5)
    if (day1[0] === '0') {
        day1 = day1.replace('0', '')
    }
    if (month1[0] === '0') {
        month1 = month1.replace('0', '')
    }
    if (hour1[0] === '0') {
        hour1 = hour1.replace('0', '')
    }
    if (min1[0] === '0') {
        min1 = min1.replace('0', '')
    }
    console.log(hour, min, hour1, min1)

    let year1 = date2.substring(6, 10)
    if (
        parseInt(min1) < parseInt(min) && parseInt(hour1) <= parseInt(hour) && parseInt(day1) <= parseInt(day) && parseInt(month1) <= parseInt(month) && parseInt(year1) === parseInt(year) ||
        parseInt(hour1) < parseInt(hour) && parseInt(day1) <= parseInt(day) && parseInt(month1) <= parseInt(month) && parseInt(year1) === parseInt(year) ||
        parseInt(day1) < parseInt(day) && parseInt(month1) <= parseInt(month) && parseInt(year1) === parseInt(year) || parseInt(month1) < parseInt(month) && parseInt(year1) === parseInt(year) ||
        parseInt(year) > parseInt(year1))
        return canBeWhiteListed = false
    if (currentDatejs > whiteListDatejs) return canBeWhiteListed = false

    return canBeWhiteListed = true

}
let EnddateJs = null
function getEndJsDate (date, hour){
    EnddateJs = null
    let day = date.substring(0, 2)
    let month = date.substring(3, 5)
    let year = date.substring(6, 10)
    let hour = hour.substring(0, 2)
    let min = hour.substring(3, 5)
    const enddateJs = Date.parse(`${month}/${day}/${year} ${hour}:${min}`)
    EnddateJs = enddateJs
    
}
///////

router.get('/api/allEvents', catchAsync(async (req, res) => {
    const events = await Event.find({ isWhiteListed: { whiteListed: false } })
    let calendarEvents = [

    ]

    for (let e of events) {
        let date = e.date
        if (date.length === 1) {
            date = [e.date[0], e.date[0]]
        }
        const obj = {
            id: e._id,
            name: e.name,
            date: date,
            type: e.type,
            description: e.description,
        }
        calendarEvents.push(obj)
    }
    return res.status(200).json({
        calendarEvents
    });
}))

router.get('/new/event', (req, res) => {
    res.render('events/newEvent')
})




router.post('/new/event', validateEvent, catchAsync(async (req, res) => {
    const { name, description, type, location, startDate, endDate, startHour, endHour, whiteListDate, whiteListHour } = req.body
    let { freeSpaces, sendEmail } = req.body;

    if (req.body.sendMail = 'true') sendEmail = true
    if (!req.body.sendMail) sendEmail = false
    if (!req.body.freeSpaces.length) {
        freeSpaces = -1
    }
    const newEvent = await new Event({ name, description, type, freeSpaces, sendEmail })
    console.log(newEvent.sendEmail)
    getDateArray(startDate, endDate)
    if (date[0] === 'Invalid Date - To Late' || date[0] === 'Invalid Date - To Large' || date[0] === 'Invalid Date') {
        req.flash('error', 'Data inválida!')
        return res.redirect('/new/event')
    }
    validateHour(startHour, endHour, date)

    if (!validHour || isNull) {
        req.flash('error', 'Horas inválidas!')
        return res.redirect('/new/event')
    }
    newEvent.hour.startHour = startHour
    newEvent.hour.endHour = endHour
    newEvent.date = date
    newEvent.jsPostDate = Date.now()
    newEvent.EndDate = endDate
    getEndJsDate(EndDate, endHour)
    newEvent.endJsDate = EnddateJs
    newEvent.vagas = []
    validateWhiteList(`${whiteListDate} ${whiteListHour}`, `${startDate} ${startHour}`)
    if (!canBeWhiteListed) {
        req.flash('error', 'Data de publicação errada!')
        return res.redirect('/new/event')
    }
    if (!req.body.whiteListDate) {
        newEvent.isWhiteListed.whiteListed = false
        newEvent.isWhiteListed.jsDate = null
    }
    if (req.body.whiteListDate) {
        newEvent.isWhiteListed.whiteListed = true
        let day = whiteListDate.substring(0, 2)
        let month = whiteListDate.substring(3, 5)
        let year = whiteListDate.substring(6, 10)
        let rigthDate = `${month}, ${day}, ${year}`
        newEvent.isWhiteListed.Date = Date.parse(`${rigthDate} ${whiteListHour}`)
    }

    if (location.includes('https://www.google.pt/maps/@')) {
        newEvent.location.link = location
        newEvent.location.spot = null

    }
    else {
        newEvent.location.spot = location
        newEvent.location.link = null

    }
    //   await newEvent.save()
    //  console.log(newEvent)
    //req.flash('success', 'Evento marcado com sucesso!')
    //return res.redirect('/agenda')
}))
module.exports = router
