const User = require('./models/user.js')
const Class = require('./models/aulas.js')
const { classSchema, spotSchema } = require('./JoiSchemas.js')
const ExpressError = require('./utils/ExpressError');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'Precisa de estar connectado com a sua conta com a sua conta Parkour Algarve')
        return res.redirect('/login')
    }
    return next()
}

module.exports.isInstructor = (req, res, next) => {
    if (!req.user.isInstructor) {
        req.flash('error', 'Precisa de ser instrutor para aceder a essa página. Se tem certificado fale com um admin')
        return res.redirect('/sobreNos')
    }
    return next()
}

module.exports.isUser = async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id)
    if (!user._id.equals(req.user._id)) {
        req.flash('error', 'Não tem permissão para fazer isso!');
        return res.redirect(`/user/${id}`);
    }
    return next()
}

module.exports.isValidated = async (req, res, next) => {
    const { username } = req.body
    const user = await User.findOne({ username })
    if (!user) {
        req.flash('error', 'Credenciais erradas')
        return res.redirect('/login')
    }
    if (user.status === "Pending") {
        req.flash('error', "Conta por confirmar. Por favor confirme o seu email!")
        return res.redirect('/login')
    };
    return next()
}

module.exports.unVerified = async (req, res, next) => {
    const user = await User.findOne({
        confirmationCode: req.params.confirmationCode,
    })
    if (user.status === 'Active') {
        req.flash('error', 'Esta conta já foi confirmada')
        req.redirect('/sobreNos')
    }
    return next()
}

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params
    const aula = await Class.findById(id)
    console.log(req.params, aula)
    if (!req.user._id.equals(aula.instructor)) {
        req.flash('error', 'Não tem premissão para aceder a essa página!');
        return res.redirect(`/class/${id}`);
    }
    return next()
}

module.exports.validateClass = async (req, res, next) => {
    const { error } = classSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        next(new ExpressError(msg, 400))
    } else {
        next();
    }
}

module.exports.validateSpot = async (req, res, next) => {
    const { error } = spotSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        next(new ExpressError(msg, 400))
    } else {
        next();
    }
}

module.exports.isAdmin = async (req, res, next) => {
    const { id } = req.user
    const user = await User.findById(id)
    if (!user.isAdmin) {
        req.flash('error', 'Não tem permissão para aceder a essa página!')
        res.redirect('/sobreNos')
    }
    return next()
}