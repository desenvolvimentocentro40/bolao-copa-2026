import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'fallback-secret';

interface JWTPayload {
  id: number;
  nome: string;
  email: string;
  setor: string;
  tipo: 'admin' | 'user' | 'ia';
}

// Criptografa a senha para salvar no banco (Útil para a tela de cadastro)
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compara a senha digitada com o hash do banco
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Gera o token JWT com validade de 7 dias
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

// Verifica se o token é válido e retorna os dados do usuário
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}