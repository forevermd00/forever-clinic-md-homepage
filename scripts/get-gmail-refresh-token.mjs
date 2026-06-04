#!/usr/bin/env node
/**
 * Gmail OAuth2 refresh token 재발급 스크립트 (일회용)
 *
 * 사용법:
 *   node scripts/get-gmail-refresh-token.mjs
 *
 * 사전 조건:
 *   - .env.local 에 GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET 존재
 *   - Google Cloud > 클라이언트 > 승인된 리디렉션 URI 에
 *     http://localhost:4567/oauth2callback 등록되어 있어야 함
 *   - OAuth 동의 화면이 "프로덕션" 게시 상태여야 토큰이 만료되지 않음
 *
 * 동작:
 *   1) 브라우저로 열 인증 URL 출력
 *   2) 로그인/동의 후 localhost:4567 로 리디렉트되며 code 수신
 *   3) code 를 refresh_token 으로 교환하여 출력
 */
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = join(__dirname, '..', '.env.local');
const PORT = 4567;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;
// 메일 발송에 필요한 최소 스코프
const SCOPE = 'https://www.googleapis.com/auth/gmail.send';

function readEnv(key) {
  const txt = readFileSync(ENV_PATH, 'utf8');
  const line = txt.split('\n').find((l) => l.startsWith(`${key}=`));
  if (!line) throw new Error(`${key} not found in .env.local`);
  return line
    .slice(key.length + 1)
    .trim()
    .replace(/^["']|["']$/g, '');
}

const CLIENT_ID = readEnv('GMAIL_CLIENT_ID');
const CLIENT_SECRET = readEnv('GMAIL_CLIENT_SECRET');

const authUrl =
  'https://accounts.google.com/o/oauth2/v2/auth?' +
  new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent', // 항상 새 refresh_token 발급
  }).toString();

console.log('\n=== 1단계: 아래 URL을 브라우저에서 열어 로그인/동의하세요 ===\n');
console.log(authUrl);
console.log('\n(발송에 사용할 Gmail 계정으로 로그인해야 합니다)\n');
console.log('대기 중... 동의 완료를 기다립니다.\n');

const server = http.createServer(async (req, res) => {
  if (!req.url.startsWith('/oauth2callback')) {
    res.writeHead(404);
    res.end();
    return;
  }
  const url = new URL(req.url, REDIRECT_URI);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<h2>인증 실패: ${error}</h2>`);
    console.error('\n❌ 인증 거부됨:', error);
    server.close();
    process.exit(1);
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }).toString(),
    });
    const data = await tokenRes.json();

    if (!data.refresh_token) {
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h2>refresh_token 미수신. 터미널 확인.</h2>');
      console.error('\n❌ refresh_token 없음. 응답:', data);
      server.close();
      process.exit(1);
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(
      '<h2>완료! 터미널로 돌아가세요.</h2><p>이 창은 닫아도 됩니다.</p>',
    );

    console.log('\n=== 2단계: 새 refresh token 발급 완료 ===\n');
    console.log('GMAIL_REFRESH_TOKEN=' + data.refresh_token);
    console.log('\nscope:', data.scope);
    console.log(
      '\n이 값을 .env.local 과 Vercel 프로덕션 env 양쪽에 반영하세요.\n',
    );
    server.close();
    process.exit(0);
  } catch (e) {
    res.writeHead(500);
    res.end('error');
    console.error('\n❌ 토큰 교환 실패:', e);
    server.close();
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log(`로컬 콜백 서버 실행 중: ${REDIRECT_URI}\n`);
});
