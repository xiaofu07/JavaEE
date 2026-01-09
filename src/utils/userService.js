export async function login(username, password) {
  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password })
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || body?.code !== 200) {
    throw new Error(body?.msg || '登录失败');
  }
  return body.data
}
