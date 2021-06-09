const express = require('express')
const router = express.Router()

const catchAsync = require('../utils/wrapAsync.js')
const User = require('../models/user.js')
const { isValidated, hasTitle, isLoggedIn, isAdmin, isInstructor, isUser } = require('../middleware.js')

router.get('/permissions/admin', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const users = await User.find({})
    res.render('admin', { users })
}))

router.post('/admin/admin/:id', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user.isAdmin) {
        user.isAdmin = true
        await user.save()
        return res.redirect('/permissions/admin')
    }
    console.log(user)
    return res.redirect('/permissions/admin')
}))

router.post('/admin/instructor/:id', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user.isInstructor) {
        user.isInstructor = true
    }
    else {
        user.isInstructor = false
    }
    console.log(user)
    await user.save()
    return res.redirect('/permissions/admin')
}))

router.post('/admin/intermidiate/:id', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user.level.isIntermidiate) {
        user.level.isIntermidiate = true
    }
    else {
        user.level.isIntermidiate = false
    }
    console.log(user, 'swsws')
    await user.save()
    return res.redirect('/permissions/admin')
}))

router.post('/admin/advanced/:id', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user.level.isAdvanced) {
        user.level.isAdvanced = true
    }
    else {
        user.level.isAdvanced = false
    }
    console.log(user)
    await user.save()
    return res.redirect('/permissions/admin')
}))

module.exports = router