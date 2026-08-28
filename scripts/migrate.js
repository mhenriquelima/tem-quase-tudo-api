const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function migrar() {
  const sql = fs.readFileSync(
    path.join(__dirname, '../src/config/schema.sql'),
    'utf-8'
  );

  try {
    await pool.query(sql);
    console.log('Tabelas criadas/atualizadas com sucesso.');
  } catch (err) {
    console.error('Erro ao rodar migração:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrar();
