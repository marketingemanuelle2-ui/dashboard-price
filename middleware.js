// Protege TODO o site (página e dados) com usuário e senha.
// Usuário e senha ficam nas variáveis de ambiente da Vercel:
//   DASHBOARD_USER      (ex: revolution)
//   DASHBOARD_PASSWORD  (a senha que você quiser)
export const config = { matcher: '/:path*' };

export default function middleware(request) {
  const user = process.env.DASHBOARD_USER || 'admin';
  const pass = process.env.DASHBOARD_PASSWORD;

  if (!pass) {
    return new Response(
      'Falta configurar a senha: crie a variavel DASHBOARD_PASSWORD na Vercel e faca um novo deploy.',
      { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }

  const auth = request.headers.get('authorization') || '';
  if (auth.startsWith('Basic ')) {
    try {
      const [u, ...rest] = atob(auth.slice(6)).split(':');
      if (u === user && rest.join(':') === pass) return; // liberado
    } catch (e) { /* cabeçalho inválido: cai no bloqueio abaixo */ }
  }

  return new Response('Acesso restrito', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Dashboard Revolution", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
