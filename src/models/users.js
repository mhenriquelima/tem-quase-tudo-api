const pool = require('../config/db');

async function buscarPorId(id) {
    const { rows } = await pool.query(
        'SELECT id, nome, email, papel, criado_em FROM usuarios WHERE id = $1',
        [id]
    );
    return rows[0];
}

async function buscarPorEmail(email) {
    const { rows } = await pool.query(
        'SELECT id, nome, email, senha_hash, papel, criado_em FROM usuarios WHERE email = $1',
        [email]
    );
    return rows[0];
}

async function criar({ nome, email, senha_hash, papel }) {
    const { rows } = await pool.query(
        `INSERT INTO usuarios (nome, email, senha_hash, papel)
         VALUES ($1, $2, $3, COALESCE($4, 'cliente'))
         RETURNING id, nome, email, papel, criado_em`,
        [nome, email, senha_hash, papel]
    );
    return rows[0];
}

module.exports = { buscarPorId, buscarPorEmail, criar };