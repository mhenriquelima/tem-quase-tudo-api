const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const cController = require('../controllers/categorias');
const { autenticar, somenteAdmin } = require('../middlewares/auth');

const router = Router();

const validarCategoria = [
  body('nome').isString().trim().notEmpty().withMessage('Nome é obrigatório'),
];

const validarCategoriaParcial = [
  body('nome').optional().isString().trim().notEmpty().withMessage('Nome é obrigatório'),
];

function checarValidacao(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array() });
  }
  next();
}

router.get('/', cController.index);
router.get('/:id', cController.show);
router.post('/', autenticar, somenteAdmin, validarCategoria, checarValidacao, cController.store);
router.put('/:id', autenticar, somenteAdmin, validarCategoria, checarValidacao, cController.update);
router.patch('/:id', autenticar, somenteAdmin, validarCategoriaParcial, checarValidacao, cController.patch);
router.delete('/:id', autenticar, somenteAdmin, cController.destroy);

module.exports = router;
