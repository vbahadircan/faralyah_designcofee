import { adminSessionSchema } from '@faralyah/shared';
import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/field';
import { StickerLogo } from '@/components/ui/sticker-logo';
import { tr } from '@/content/tr';
import { adminRequest, ApiError } from '@/lib/admin-api';

const t = tr.admin;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const expired = (location.state as { expired?: boolean } | null)?.expired === true;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(expired ? t.common.sessionExpired : null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = await adminRequest('/login', { method: 'POST', json: { email, password } });
      adminSessionSchema.parse(body);
      navigate('/admin', { replace: true });
    } catch (err) {
      setPassword('');
      if (err instanceof ApiError && err.status === 401) setError(t.login.invalid);
      else if (err instanceof ApiError && err.status === 429) setError(t.login.tooMany);
      else setError(t.login.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-[400px] flex-col justify-center px-4">
      <StickerLogo className="mx-auto size-32" />
      <h1 className="mt-4 text-center text-2xl font-bold">{t.login.title}</h1>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
        {error ? (
          <p role="alert" className="rounded-md bg-tint p-3 text-base text-danger">
            {error}
          </p>
        ) : null}
        <TextField
          label={t.login.email}
          type="email"
          name="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label={t.login.password}
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" size="lg" loading={busy} disabled={!email || !password}>
          {t.login.submit}
        </Button>
      </form>
    </main>
  );
}
