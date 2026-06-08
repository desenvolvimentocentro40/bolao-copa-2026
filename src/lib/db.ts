import mysql from 'mysql2/promise';

// Configuração do pool de conexões
const poolConfig: mysql.PoolOptions = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'bolao_copa_2026',
  //port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  //enableKeepAlive: true,
  //keepAliveInitialDelay: 0
};

// Evita a criação de múltiplos pools em ambiente de desenvolvimento
const globalForMysql = globalThis as unknown as {
  pool: mysql.Pool | undefined;
};

export const pool = globalForMysql.pool ?? mysql.createPool(poolConfig);

if (process.env.NODE_ENV !== 'production') {
  globalForMysql.pool = pool;
}

/**
 * Função utilitária para executar queries no banco de dados.
 * Garante tipagem básica e libera a conexão automaticamente de volta para o pool.
 */
// export async function query<T = any>(sql: string, values?: any[]): Promise<T> {
//   try {
//     const [rows] = await pool.execute(sql, values);
//     return rows as T;
//   } catch (error) {
//     console.error('Erro na execução da query:', error);
//     throw error;
//   }
// }
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  const [results] = await pool.execute(sql, params);
  return results as T;
}