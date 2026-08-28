const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const { autenticar, somenteAdmin } = require('../middlewares/auth');
const pController = require('../controllers/products');

const router = Router();

const validarProduto = [
  body('nome').isString().trim().notEmpty().withMessage('Nome é obrigatório'),
  body('preco').isFloat({ min: 0 }).withMessage('Preço deve ser um número positivo'),
  body('estoque').optional().isInt({ min: 0 }).withMessage('Estoque deve ser um inteiro positivo'),
  body('categoria_id').optional().isInt({ min: 1 }).withMessage('Categoria inválida'),
];

const validarProdutoParcial = [
  body('nome').optional().isString().trim().notEmpty().withMessage('Nome é obrigatório'),
  body('preco').optional().isFloat({ min: 0 }).withMessage('Preço deve ser um número positivo'),
  body('estoque').optional().isInt({ min: 0 }).withMessage('Estoque deve ser um inteiro positivo'),
  body('categoria_id').optional().isInt({ min: 1 }).withMessage('Categoria inválida'),
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
router.patch('/:id', autenticar, somenteAdmin, validarProdutoParcial, checarValidacao, pController.patch);
router.delete('/:id', autenticar, somenteAdmin, pController.destroy);

module.exports = router;