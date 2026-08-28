const pool = require('../config/db');

async function listarTodos() {
    const { rows } = await pool.query('SELECT * FROM produtos ORDER BY id')
    return rows;
}

async function buscarPorId(id) {
    const { rows } = await pool.query('SELECT * FROM produtos WHERE id = $1', [id])
    return rows[0];
}

async function criar({nome, descricao, preco, estoque, categoria_id}) {
    const { rows } = await pool.query(
        `INSERT INTO produtos (nome, descricao, preco, estoque, categoria_id)
        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [nome, descricao, preco, estoque, categoria_id ?? null]
    );
    return rows[0];
}

async function atualizar(id, { nome, descricao, preco, estoque, categoria_id }) {
  const { rows } = await pool.query(
    `UPDATE produtos
     SET nome = $1, descricao = $2, preco = $3, estoque = $4, categoria_id = $5
     WHERE id = $6 RETURNING *`,
    [nome, descricao, preco, estoque, categoria_id ?? null, id]
  );
  return rows[0];
}

async function remover(id) {
  const { rowCount } = await pool.query('DELETE FROM produtos WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { listarTodos, buscarPorId, criar, atualizar, remover };