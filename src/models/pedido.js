const pool = require('../config/db');

class EstoqueInsuficienteError extends Error {
  constructor(produto_id, nome, disponivel) {
    super(`Estoque insuficiente para o produto "${nome}" (disponível: ${disponivel})`);
    this.status = 409;
    this.produto_id = produto_id;
  }
}

async function criarComItens({ usuario_id, itens }) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    // Trava as linhas dos produtos envolvidos (FOR UPDATE) para evitar
    // que dois checkouts simultâneos vendam o mesmo estoque duas vezes.
    for (const item of itens) {
      const { rows } = await client.query(
        'SELECT id, nome, estoque FROM produtos WHERE id = $1 FOR UPDATE',
        [item.produto_id]
      );
      const produto = rows[0];

      if (!produto || produto.estoque < item.quantidade) {
        throw new EstoqueInsuficienteError(
          item.produto_id,
          produto?.nome ?? `#${item.produto_id}`,
          produto?.estoque ?? 0
        );
      }
    }

    const total = itens.reduce((soma, item) => soma + item.quantidade * item.preco, 0);

    const pedidoResult = await client.query(
      `INSERT INTO pedidos (usuario_id, total) VALUES ($1, $2) RETURNING *`,
      [usuario_id, total]
    );
    const pedido = pedidoResult.rows[0];

    for (const item of itens) {
      await client.query(
        `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
         VALUES ($1, $2, $3, $4)`,
        [pedido.id, item.produto_id, item.quantidade, item.preco]
      );

      await client.query(
        `UPDATE produtos SET estoque = estoque - $1 WHERE id = $2`,
        [item.quantidade, item.produto_id]
      );
    }

    await client.query('COMMIT');
    return pedido;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function listarPorUsuario(usuario_id) {
  const { rows } = await pool.query(
    'SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY criado_em DESC',
    [usuario_id]
  );
  return rows;
}

async function buscarPorId(id) {
  const pedidoResult = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
  const pedido = pedidoResult.rows[0];
  if (!pedido) return null;

  const itensResult = await pool.query(
    `SELECT ip.produto_id, p.nome, ip.quantidade, ip.preco_unitario,
            (ip.quantidade * ip.preco_unitario) AS subtotal
     FROM itens_pedido ip
     JOIN produtos p ON p.id = ip.produto_id
     WHERE ip.pedido_id = $1`,
    [id]
  );

  return { ...pedido, itens: itensResult.rows };
}

async function atualizarStatus(id, status) {
  const { rows } = await pool.query(
    'UPDATE pedidos SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return rows[0];
}

async function cancelar(id) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const pedidoResult = await client.query(
      'SELECT * FROM pedidos WHERE id = $1 FOR UPDATE',
      [id]
    );
    const pedido = pedidoResult.rows[0];

    if (!pedido) {
      await client.query('ROLLBACK');
      return null;
    }

    if (pedido.status === 'cancelado') {
      await client.query('ROLLBACK');
      return pedido;
    }

    const itensResult = await client.query(
      'SELECT produto_id, quantidade FROM itens_pedido WHERE pedido_id = $1',
      [id]
    );

    for (const item of itensResult.rows) {
      await client.query(
        'UPDATE produtos SET estoque = estoque + $1 WHERE id = $2',
        [item.quantidade, item.produto_id]
      );
    }

    const atualizado = await client.query(
      "UPDATE pedidos SET status = 'cancelado' WHERE id = $1 RETURNING *",
      [id]
    );

    await client.query('COMMIT');
    return atualizado.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { criarComItens, listarPorUsuario, buscarPorId, atualizarStatus, cancelar, EstoqueInsuficienteError };
