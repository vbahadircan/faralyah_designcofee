import { SETTINGS_LIMITS, siteSettingsSchema, type SiteSettings } from '@faralyah/shared';
import { useCallback, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/field';
import { tr } from '@/content/tr';
import { useFetch } from '@/hooks/use-fetch';
import { useAdmin } from './admin-context';
import { useAdminAction } from './admin-ui';

const t = tr.admin;

/** Site-wide settings: for now the Wi-Fi password shown on the landing page. */
export function SettingsAdminPage() {
  const { call } = useAdmin();
  const load = useCallback(
    async (signal: AbortSignal) => siteSettingsSchema.parse(await call('/settings', { signal })),
    [call],
  );
  const { state, reload, refresh } = useFetch(load);

  return (
    <>
      <h1 className="text-2xl font-bold">{t.settings.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t.settings.intro}</p>

      {state.status === 'loading' ? (
        <p aria-busy="true" className="py-6">
          {t.common.loading}
        </p>
      ) : null}
      {state.status === 'error' ? (
        <div role="alert" className="py-6">
          <p>{t.common.loadError}</p>
          <Button variant="secondary" className="mt-4" onClick={reload}>
            {t.common.retry}
          </Button>
        </div>
      ) : null}
      {state.status === 'ready' ? <SettingsForm settings={state.data} onSaved={refresh} /> : null}
    </>
  );
}

function SettingsForm({ settings, onSaved }: { settings: SiteSettings; onSaved: () => void }) {
  const { call } = useAdmin();
  const run = useAdminAction(onSaved);
  const [wifiPassword, setWifiPassword] = useState(settings.wifiPassword ?? '');

  function save(event: FormEvent) {
    event.preventDefault();
    void run(() => call('/settings', { method: 'PATCH', json: { wifiPassword } }), t.common.saved);
  }

  return (
    <form
      onSubmit={save}
      className="mt-6 flex flex-col gap-3 rounded-md border border-rule bg-background p-4 shadow-sm"
    >
      <TextField
        label={t.settings.wifiPassword}
        value={wifiPassword}
        maxLength={SETTINGS_LIMITS.wifiPasswordMax}
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => setWifiPassword(e.target.value)}
      />
      <p className="text-sm text-muted-foreground">{t.settings.wifiHint}</p>
      <div>
        <Button type="submit">{t.common.save}</Button>
      </div>
    </form>
  );
}
