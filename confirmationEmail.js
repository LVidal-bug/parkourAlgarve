const nodemailer = require("nodemailer");
const User = require('./models/user.js')
const user = process.env.USER
const pass = process.env.PASSWORD
const ExpressError = require('./utils/ExpressError');

const transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: user,
        pass: pass,
    },
});

module.exports.sendConfirmationEmail = (name, email, confirmationCode) => {
    console.log("Check");
    transport.sendMail({
        from: user,
        to: email,
        subject: "Por favor confirme o seu email",
        html: `
       <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
<div
    style="width:30%;padding:2em; padding-bottom:0; font-family:'Roboto', sans-serif;    background:linear-gradient( to right, rgb(96, 149, 247),rgb(5, 30, 99));">
    <div>
        <img style="width:100%"
            src="https://res.cloudinary.com/dfaqpdtr4/image/upload/v1619696813/logosimplespng_iow5xm.png" alt="">
    </div>
    <div style="color:white">
        <h1>Confirme o seu email</h1>
        <h2>Olá ${name}!</h2>
        <p style=" font-size:18px">Obrigado por se registrar! Clique no link abaixo para confirmar o seu email </p>

        <a style="color: white; font-size:20px;" href="http://localhost:3000/confirm/${confirmationCode}"> Clique
            Aqui</a>
    </div>
    <div
        style="margin-top: 4em; color:white; font-size:17px; padding-bottom: 1em; ">
       <p> Email: <span style="background-color:white"> parkourAlgarve@gmail.com </span> </p>
       <div style=" display: flex; align-items:center;">
      
          <div style="display:flex; align-items:center">
    <a href="https://www.instagram.com/parkouralgarve/" style="color: white; margin:0.5em; margin-left:0;">
        Encontre-nos Instagram!
    </a>
    <a href="https://www.facebook.com/groups/1563288463946967/about" style="color: white;  margin:0.5em;">
        Encontre-nos Facebook!
    </a>
</div>

        </div>

    </div>
</div>`,
    }).catch(err => console.log(err));
};

module.exports.sendRecoverPasswordEmail = (email, token, user1) => {
    console.log("Check");
    const id = user1._id
    transport.sendMail({
        from: user,
        to: email,
        subject: "Recuperar Palavra-passe Parkour Algarve",
        html: `<link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
<div
    style="width:30%;padding:2em; padding-bottom:0; font-family:'Roboto', sans-serif;    background:linear-gradient( to right, rgb(96, 149, 247),rgb(5, 30, 99));">
    <div>
        <img style="width:100%"
            src="https://res.cloudinary.com/dfaqpdtr4/image/upload/v1619696813/logosimplespng_iow5xm.png" alt="">
    </div>
    <div style="color: white">
        <h2>Olá ${user1.username}!</h2>
        <p style=" font-size:18px">Clique no link abaixo para redefinir a sua palavra-passe </p>

        <a style="color: white; font-size:20px;" href="http://localhost:3000/replacePassword/${id}/${token}"> Clique
            Aqui</a>
    </div>


    <div style="margin-top: 4em; color:white; font-size:17px; padding-bottom: 1em; ">
        <p> Email: <span style="background-color:white"> parkourAlgarve@gmail.com </span> </p>
        <div style=" display: flex; align-items:center;">

            <div style="display:flex; align-items:center">
                <a href="https://www.instagram.com/parkouralgarve/" style="color: white; margin:0.5em; margin-left:0;">
                    Encontre-nos Instagram!
                </a>
                <a href="https://www.facebook.com/groups/1563288463946967/about" style="color: white;  margin:0.5em;">
                    Encontre-nos Facebook!
                </a>
            </div>

        </div>

    </div>
</div> `,
    }).catch(err => console.log(err));
};

exports.verifyUser = async (req, res, next) => {
    try {
        const user = await User.findOne({
            confirmationCode: req.params.confirmationCode,
        })
        if (!user) {
            next(new ExpressError('Página não encontrada', 404))
        }
        user.status = 'Active'
        await user.save()
        next()
    } catch (e) {
        next(new ExpressError(e, 500))
    }
};