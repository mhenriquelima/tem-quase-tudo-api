const pModel = require('../models/pedido');
const cModel = require('../models/carrinho');

const STATUS_VALIDOS = ['pendente', 'pago', 'enviado', 'cancelado'];

async function checkout(req, res, next) {
  try {
    const carrinho = await cModel.obterOuCriarCarrinho(req.user.id);
    const itensCarrinho = await cModel.listarItens(carrinho.id);

    if (itensCarrinho.length === 0) {
      return res.status(400).json({ erro: 'Carrinho está vazio' });
    }

    const itens = itensCarrinho.map((item) => ({
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      preco: Number(item.preco),
    }));

    const pedido = await pModel.criarComItens({
      usuario_id: req.user.id,
      itens,
    });

    await cModel.esvaziar(carrinho.id);

    res.status(201).json(pedido);
  } catch (err) {
    next(err);
  }
}

async function meusPedidos(req, res, next) {
  try {
    const pedidos = await pModel.listarPorUsuario(req.user.id);
    res.json(pedidos);
  } catch (err) {
    next(err);
  }
}

async function detalhe(req, res, next) {
  try {
    const pedido = await pModel.buscarPorId(req.params.id);
    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });

    const ehDono = pedido.usuario_id === req.user.id;
    const ehAdmin = req.user.papel === 'admin';
    if (!ehDono && !ehAdmin) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    res.json(pedido);
  } catch (err) {
    next(err);
  }
}

async function atualizarStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!STATUS_VALIDOS.includes(status)) {
      return res.status(400).json({ erro: `Status deve ser um de: ${STATUS_VALIDOS.join(', ')}` });
    }

    const pedido = await pModel.atualizarStatus(req.params.id, status);
    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });

    res.json(pedido);
  } catch (err) {
    next(err);
  }
}

async function cancelar(req, res, next) {
  try {
    const pedido = await pModel.buscarPorId(req.params.id);
    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });

    const ehDono = pedido.usuario_id === req.user.id;
    const ehAdmin = req.user.papel === 'admin';
    if (!ehDono && !ehAdmin) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    if (['enviado', 'cancelado'].includes(pedido.status)) {
      return res.status(409).json({ erro: `Pedido não pode ser cancelado (status atual: ${pedido.status})` });
    }

    const cancelado = await pModel.cancelar(req.params.id);
    res.json(cancelado);
  } catch (err) {
    next(err);
  }
}

module.exports = { checkout, meusPedidos, detalhe, atualizarStatus, cancelar };
