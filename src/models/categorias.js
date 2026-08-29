const pool = require('../config/db');

const CAMPOS_PERMITIDOS = new Set(['nome']);

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

async function atualizar(id, dados) {
  const campos = Object.entries(dados || {}).filter(
    ([campo, valor]) => CAMPOS_PERMITIDOS.has(campo) && valor !== undefined && valor !== null
  );

  if (campos.length === 0) {
    return buscarPorId(id);
  }

  const colunas = campos.map(([campo], index) => `${campo} = $${index + 1}`).join(', ');
  const valores = campos.map(([, valor]) => valor);

  const { rows } = await pool.query(
    `UPDATE categorias SET ${colunas} WHERE id = $${campos.length + 1} RETURNING *`,
    [...valores, id]
  );

  return rows[0];
}

async function remover(id) {
  const { rowCount } = await pool.query('DELETE FROM categorias WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { listarTodas, buscarPorId, criar, atualizar, remover };
