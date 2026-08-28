const pool = require('../config/db');

async function listarTodas() {
  const { rows } = await pool.query('SELECT * FROM categorias ORDER BY nome');
  return rows;
}

async function buscarPorId(id) {
  const { rows } = await pool.query('SELECT * FROM categorias WHERE id = $1', [id]);
  return rows[0];
}

async function criar({ nome }) {
  const { rows } = await pool.query(
    'INSERT INTO categorias (nome) VALUES ($1) RETURNING *',
    [nome]
  );
  return rows[0];
}

async function atualizar(id, { nome }) {
  const { rows } = await pool.query(
    'UPDATE categorias SET nome = $1 WHERE id = $2 RETURNING *',
    [nome, id]
  );
  return rows[0];
}

async function remover(id) {
  const { rowCount } = await pool.query('DELETE FROM categorias WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { listarTodas, buscarPorId, criar, atualizar, remover };
