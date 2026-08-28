const categoriaModel = require('../models/categorias');

async function index(req, res, next) {
  try {
    const categorias = await categoriaModel.listarTodas();
    res.json(categorias);
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const categoria = await categoriaModel.buscarPorId(req.params.id);
    if (!categoria) return res.status(404).json({ erro: 'Categoria não encontrada' });
    res.json(categoria);
  } catch (err) {
    next(err);
  }
}

async function store(req, res, next) {
  try {
    const nova = await categoriaModel.criar(req.body);
    res.status(201).json(nova);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ erro: 'Categoria já existe' });
    }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const atualizada = await categoriaModel.atualizar(req.params.id, req.body);
    if (!atualizada) return res.status(404).json({ erro: 'Categoria não encontrada' });
    res.json(atualizada);
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    const removida = await categoriaModel.remover(req.params.id);
    if (!removida) return res.status(404).json({ erro: 'Categoria não encontrada' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { index, show, store, update, destroy };
