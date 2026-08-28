const pool = require('../config/db');

async function obterOuCriarCarrinho(usuario_id) {
  const existente = await pool.query(
    'SELECT * FROM carrinhos WHERE usuario_id = $1',
    [usuario_id]
  );
  if (existente.rows[0]) return existente.rows[0];

  const { rows } = await pool.query(
    'INSERT INTO carrinhos (usuario_id) VALUES ($1) RETURNING *',
    [usuario_id]
  );
  return rows[0];
}

async function listarItens(carrinho_id) {
  const { rows } = await pool.query(
    `SELECT ic.id, ic.quantidade, p.id AS produto_id, p.nome, p.preco,
            (ic.quantidade * p.preco) AS subtotal
     FROM itens_carrinho ic
     JOIN produtos p ON p.id = ic.produto_id
     WHERE ic.carrinho_id = $1
     ORDER BY ic.id`,
    [carrinho_id]
  );
  return rows;
}

async function adicionarItem(carrinho_id, produto_id, quantidade) {
  const { rows } = await pool.query(
    `INSERT INTO itens_carrinho (carrinho_id, produto_id, quantidade)
     VALUES ($1, $2, $3)
     ON CONFLICT (carrinho_id, produto_id)
     DO UPDATE SET quantidade = itens_carrinho.quantidade + EXCLUDED.quantidade
     RETURNING *`,
    [carrinho_id, produto_id, quantidade]
  );
  return rows[0];
}

async function atualizarQuantidade(carrinho_id, produto_id, quantidade) {
  const { rows } = await pool.query(
    `UPDATE itens_carrinho SET quantidade = $1
     WHERE carrinho_id = $2 AND produto_id = $3
     RETURNING *`,
    [quantidade, carrinho_id, produto_id]
  );
  return rows[0];
}

async function removerItem(carrinho_id, produto_id) {
  const { rowCount } = await pool.query(
    'DELETE FROM itens_carrinho WHERE carrinho_id = $1 AND produto_id = $2',
    [carrinho_id, produto_id]
  );
  return rowCount > 0;
}

async function esvaziar(carrinho_id) {
  await pool.query('DELETE FROM itens_carrinho WHERE carrinho_id = $1', [carrinho_id]);
}

module.exports = { obterOuCriarCarrinho, listarItens, adicionarItem, atualizarQuantidade, removerItem, esvaziar };
