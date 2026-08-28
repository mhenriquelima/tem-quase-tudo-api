const { Router } = require('express');
const pController = require('../controllers/pedido');
const { autenticar, somenteAdmin } = require('../middlewares/auth');

const router = Router();

router.use(autenticar);

router.post('/checkout', pController.checkout);
router.get('/', pController.meusPedidos);
router.get('/:id', pController.detalhe);
router.put('/:id/status', somenteAdmin, pController.atualizarStatus);
router.put('/:id/cancelar', pController.cancelar);

module.exports = router;