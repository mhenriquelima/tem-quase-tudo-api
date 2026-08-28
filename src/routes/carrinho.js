const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const cController = require('../controllers/carrinho');
const { autenticar } = require('../middlewares/auth');

const router = Router();

const validarItem = [
  body('produto_id').isInt().withMessage('produto_id é obrigatório'),
  body('quantidade').optional().isInt({ min: 1 }).withMessage('quantidade deve ser positiva'),
];

const validarQuantidade = [
  body('quantidade').isInt({ min: 1 }).withMessage('quantidade deve ser um inteiro positivo'),
];

function checarValidacao(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array() });
  }
  next();
}

// Todas as rotas de carrinho exigem usuário logado
router.use(autenticar);

router.get('/', cController.ver);
router.post('/itens', validarItem, checarValidacao, cController.adicionar);
router.put('/itens/:produtoId', validarQuantidade, checarValidacao, cController.atualizar);
router.delete('/itens/:produtoId', cController.remover);

module.exports = router;
