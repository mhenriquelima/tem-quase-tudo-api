const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function migrar() {
  const sql = fs.readFileSync(
    path.join(__dirname, '../src/config/schema.sql'),
    'utf-8'
  );

  const ajusteProdutos = `
    ALTER TABLE produtos
      ADD COLUMN IF NOT EXISTS categoria_id INTEGER;

    ALTER TABLE produtos
      DROP CONSTRAINT IF EXISTS fk_produtos_categoria;

    ALTER TABLE produtos
      ADD CONSTRAINT fk_produtos_categoria
      FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL;

    CREATE INDEX IF NOT EXISTS idx_produtos_categoria_id
      ON produtos (categoria_id);
  `;

  try {
    await pool.query(sql);
    await pool.query(ajusteProdutos);
    console.log('Tabelas criadas/atualizadas com sucesso.');
  } catch (err) {
    console.error('Erro ao rodar migração:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrar();
