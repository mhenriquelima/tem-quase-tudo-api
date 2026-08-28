const cModel = require('../models/carrinho');
const pModel = require('../models/products');

async function ver(req, res, next) {
  try {
    const carrinho = await cModel.obterOuCriarCarrinho(req.user.id);
    const itens = await cModel.listarItens(carrinho.id);
    const total = itens.reduce((soma, item) => soma + Number(item.subtotal), 0);

    res.json({ carrinho_id: carrinho.id, itens, total });
  } catch (err) {
    next(err);
  }
}

async function adicionar(req, res, next) {
  try {
    const { produto_id, quantidade = 1 } = req.body;

    const produto = await pModel.buscarPorId(produto_id);
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

    const carrinho = await cModel.obterOuCriarCarrinho(req.user.id);
    await cModel.adicionarItem(carrinho.id, produto_id, quantidade);

    const itens = await cModel.listarItens(carrinho.id);
    res.status(201).json({ carrinho_id: carrinho.id, itens });
  } catch (err) {
    next(err);
  }
}

async function atualizar(req, res, next) {
  try {
    const { quantidade } = req.body;
    const produto_id = req.params.produtoId;

    const carrinho = await cModel.obterOuCriarCarrinho(req.user.id);
    const item = await cModel.atualizarQuantidade(carrinho.id, produto_id, quantidade);

    if (!item) return res.status(404).json({ erro: 'Item não está no carrinho' });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function remover(req, res, next) {
  try {
    const produto_id = req.params.produtoId;
    const carrinho = await cModel.obterOuCriarCarrinho(req.user.id);

    const removido = await cModel.removerItem(carrinho.id, produto_id);
    if (!removido) return res.status(404).json({ erro: 'Item não está no carrinho' });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { ver, adicionar, atualizar, remover };
