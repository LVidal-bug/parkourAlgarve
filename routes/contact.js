const express = require('express')
const router = express.Router();

router.get("/contactUs", (req,res)=>{
res.render("contact/contactFORM")
})

module.exports = router
