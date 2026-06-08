import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    await transporter.sendMail({
      from: `"Bolão 4.0 - SENAI" <${process.env.SMTP_USER}>`,
      to,
      subject: '⚽ Bem-vindo à Arena do Bolão 4.0!',
      html: `
        <div style="font-family: sans-serif; color: #002244; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #004b8d;">Olá, ${name}!</h2>
          <p>Seu cadastro no <strong>Bolão da Copa 2026 - Senai Centro 4.0</strong> foi realizado com sucesso.</p>
          <p>Prepare seus palpites e fique de olho no ranking. Que vença o melhor!</p>
          <hr style="border: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="font-size: 0.8rem; color: #666;">Equipe de Organização - Senai Centro 4.0</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Erro ao enviar e-mail de boas-vindas:', error);
    // Não vamos quebrar a aplicação se o e-mail falhar, mas logamos o erro
  }
}