const pModel = require ('../models/products');

async function index(req, res, next) {
    try {
        const pagina = Number.parseInt(req.query.page ?? '1', 10) || 1;
        const limite = Number.parseInt(req.query.limit ?? '10', 10) || 10;
        const busca = req.query.busca?.trim() || undefined;
        const categoria_id = Number.parseInt(req.query.categoria_id, 10) || undefined;
        const produtos = await pModel.listarTodos({ pagina, limite, busca, categoria_id });
        res.json(produtos)
    } catch (err) {
        next(err);
    }
};

async function show(req, res, next) {
    try {
        const produto = await pModel.buscarPorId(req.params.id);
        if (!produto)
            return res.status(404).json({erro: 'Produto não encontrado'});
        res.json(produto);
    } catch (err) {
        next(err);
    }
};

async function store(req, res, next) {
  try {
    const novoProduto = await pModel.criar(req.body);
    res.status(201).json(novoProduto);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const produtoAtualizado = await pModel.atualizar(req.params.id, req.body);
    if (!produtoAtualizado) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(produtoAtualizado);
  } catch (err) {
    next(err);
  }
};

async function patch(req, res, next) {
  try {
    const produtoAtualizado = await pModel.atualizar(req.params.id, req.body);
    if (!produtoAtualizado) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(produtoAtualizado);
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    const removido = await pModel.remover(req.params.id);
    if (!removido) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { index, show, store, update, patch, destroy };