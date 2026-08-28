const pool = require('../config/db');

const CAMPOS_PERMITIDOS = new Set([
  'nome',
  'descricao',
  'preco',
  'estoque',
  'categoria_id'
]);

async function listarTodos({ pagina = 1, limite = 10 } = {}) {
    const page = Number(pagina) > 0 ? Number(pagina) : 1;
    const limit = Number(limite) > 0 ? Number(limite) : 10;
    const offset = (page - 1) * limit;

    const [{ rows: totalRows }] = await Promise.all([
        pool.query('SELECT COUNT(*)::int AS total FROM produtos')
    ]);

    const { rows } = await pool.query(
        'SELECT * FROM produtos ORDER BY id LIMIT $1 OFFSET $2',
        [limit, offset]
    );

    const total = Number(totalRows[0]?.total ?? 0);

    return {
        itens: rows,
        pagina: page,
        limite: limit,
        total,
        totalPaginas: Math.ceil(total / limit) || 1
    };
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

async function atualizar(id, campos) {
  const dados = Object.entries(campos || {}).filter(
    ([campo, valor]) => CAMPOS_PERMITIDOS.has(campo) && valor !== undefined && valor !== null
  );

  if (dados.length === 0) {
    return buscarPorId(id);
  }

  const colunas = dados.map(([campo], index) => `${campo} = $${index + 1}`).join(', ');
  const valores = dados.map(([, valor]) => valor);

  const { rows } = await pool.query(
    `UPDATE produtos
     SET ${colunas}
     WHERE id = $${dados.length + 1} RETURNING *`,
    [...valores, id]
  );

  return rows[0];
}

async function remover(id) {
  const { rowCount } = await pool.query('DELETE FROM produtos WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { listarTodos, buscarPorId, criar, atualizar, remover };