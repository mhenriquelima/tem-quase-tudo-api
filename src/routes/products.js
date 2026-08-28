const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const { autenticar, somenteAdmin } = require('../middlewares/auth');
const pController = require('../controllers/products');

const router = Router();

const validarProduto = [
  body('nome').isString().trim().notEmpty().withMessage('Nome é obrigatório'),
  body('preco').isFloat({ min: 0 }).withMessage('Preço deve ser um número positivo'),
  body('estoque').optional().isInt({ min: 0 }).withMessage('Estoque deve ser um inteiro positivo'),
];

function checarValidacao(req, res, next) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
        return res.status(400).json({
            erros: erros.array()
        });
    }
    next();
}

router.get('/', pController.index);
router.get('/:id', pController.show);
router.post('/', autenticar, somenteAdmin, validarProduto, checarValidacao, pController.store);
router.put('/:id', autenticar, somenteAdmin, validarProduto, checarValidacao, pController.update);
router.delete('/:id', autenticar, somenteAdmin, pController.destroy);

module.exports = router;