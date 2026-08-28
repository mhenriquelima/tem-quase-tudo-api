const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const aController = require('../controllers/auth');
const { autenticar } = require('../middlewares/auth');

const router = Router();

const validarRegistro = [
    body('nome').isString().trim().notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('E-mail inválido'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
];

const validarLogin = [
    body('email').isEmail().withMessage('E-mail inválido'),
    body('senha').notEmpty().withMessage('Senha é obrigatória'),
];

function checarValidacao(req, res, next) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
        return res.status(400).json({
            erros: erros.array()
        });
    }
    next();
};

router.post('/registro', validarRegistro, checarValidacao, aController.registro);
router.post('/login', validarLogin, checarValidacao, aController.login);
router.get('/me', autenticar, aController.me);

module.exports = router;