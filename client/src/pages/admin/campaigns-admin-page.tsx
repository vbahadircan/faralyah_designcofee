import {
  adminCampaignListSchema,
  CAMPAIGN_LIMITS,
  parsePriceInput,
  type AdminCampaign,
} from '@faralyah/shared';
import { ImageOff } from 'lucide-react';
import { useCallback, useId, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { CheckboxField, TextField } from '@/components/ui/field';
import { tr } from '@/content/tr';
import { useFetch } from '@/hooks/use-fetch';
import { useAdmin } from './admin-context';
import { priceToInput, RowActions, useAdminAction, type RunAction } from './admin-ui';

const t = tr.admin;
const IMAGE_ERRORS = {
  image_too_large: t.campaigns.imageTooLarge,
  invalid_image: t.campaigns.invalidImage,
  image_required: t.campaigns.invalidImage,
};

export function CampaignsAdminPage() {
  const { call } = useAdmin();
  const load = useCallback(
    async (signal: AbortSignal) =>
      adminCampaignListSchema.parse(await call('/campaigns', { signal })),
    [call],
  );
  const { state, reload, refresh } = useFetch(load);

  const run = useAdminAction(refresh);

  return (
    <>
      <h1 className="text-2xl font-bold">{t.campaigns.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t.campaigns.intro}</p>
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
      {state.status === 'ready' ? (
        <>
          {state.data.campaigns.length === 0 ? <p className="py-6">{t.campaigns.empty}</p> : null}
          <ul className="flex flex-col gap-6 pt-6">
            {state.data.campaigns.map((campaign, index) => (
              <li key={campaign.id}>
                <CampaignEditor
                  campaign={campaign}
                  first={index === 0}
                  last={index === state.data.campaigns.length - 1}
                  run={run}
                />
              </li>
            ))}
          </ul>
          <NewCampaignForm run={run} />
        </>
      ) : null}
    </>
  );
}

type Run = RunAction;

function CampaignEditor({
  campaign,
  first,
  last,
  run,
}: {
  campaign: AdminCampaign;
  first: boolean;
  last: boolean;
  run: Run;
}) {
  const { call } = useAdmin();
  const fileId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(campaign.title);
  const [price, setPrice] = useState(priceToInput(campaign.priceKurus));
  const [description, setDescription] = useState(campaign.description ?? '');
  const [published, setPublished] = useState(campaign.published);
  const [priceError, setPriceError] = useState<string>();
  const [uploading, setUploading] = useState(false);

  function save(event: FormEvent) {
    event.preventDefault();
    const priceKurus = parsePriceInput(price);
    if (priceKurus === null) {
      setPriceError(t.common.invalidPrice);
      return;
    }
    setPriceError(undefined);
    void run(
      () =>
        call(`/campaigns/${campaign.id}`, {
          method: 'PATCH',
          json: { title, priceKurus, description, published },
        }),
      t.common.saved,
    );
  }

  async function upload(file: File) {
    const form = new FormData();
    form.append('image', file);
    setUploading(true);
    await run(
      () => call(`/campaigns/${campaign.id}/image`, { method: 'PUT', form }),
      t.campaigns.imageSaved,
      IMAGE_ERRORS,
    );
    setUploading(false);
    if (fileInput.current) fileInput.current.value = '';
  }

  return (
    <article
      aria-label={campaign.title}
      className="overflow-hidden rounded-md border border-rule bg-background shadow-sm md:flex"
    >
      <div className="md:w-72 md:shrink-0">
        {campaign.imageUrl ? (
          <img src={campaign.imageUrl} alt="" className="aspect-[4/3] w-full object-cover" />
        ) : (
          <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 bg-tint text-muted-foreground">
            <ImageOff className="size-8" aria-hidden="true" />
            <span className="text-sm">{t.campaigns.noImage}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-2 p-3">
          <input
            ref={fileInput}
            id={fileId}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <Button
            variant="secondary"
            loading={uploading}
            aria-label={`${campaign.title}: ${campaign.imageUrl ? t.campaigns.changeImage : t.campaigns.chooseImage}`}
            onClick={() => fileInput.current?.click()}
          >
            {campaign.imageUrl ? t.campaigns.changeImage : t.campaigns.chooseImage}
          </Button>
          {campaign.imageUrl ? (
            <Button
              variant="ghost"
              aria-label={`${campaign.title}: ${t.campaigns.removeImage}`}
              onClick={() =>
                void run(
                  () => call(`/campaigns/${campaign.id}/image`, { method: 'DELETE' }),
                  t.campaigns.imageRemoved,
                )
              }
            >
              {t.campaigns.removeImage}
            </Button>
          ) : null}
        </div>
      </div>
      <form onSubmit={save} className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <TextField
            className="min-w-48 flex-[2]"
            label={t.campaigns.campaignTitle}
            value={title}
            maxLength={CAMPAIGN_LIMITS.titleMax}
            required
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            className="w-32"
            label={t.campaigns.price}
            value={price}
            inputMode="decimal"
            required
            error={priceError}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <TextField
          label={t.campaigns.description}
          multiline
          value={description}
          maxLength={CAMPAIGN_LIMITS.descriptionMax}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <CheckboxField
              label={t.campaigns.published}
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            <Button type="submit" disabled={!title.trim()}>
              {t.common.save}
            </Button>
          </div>
          <RowActions
            name={campaign.title}
            first={first}
            last={last}
            onMove={(direction) =>
              void run(
                () =>
                  call(`/campaigns/${campaign.id}/move`, { method: 'POST', json: { direction } }),
                t.common.saved,
              )
            }
            onDelete={() =>
              void run(
                () => call(`/campaigns/${campaign.id}`, { method: 'DELETE' }),
                t.common.deleted,
              )
            }
          />
        </div>
      </form>
    </article>
  );
}

function NewCampaignForm({ run }: { run: Run }) {
  const { call } = useAdmin();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [priceError, setPriceError] = useState<string>();

  async function add(event: FormEvent) {
    event.preventDefault();
    const priceKurus = parsePriceInput(price);
    if (priceKurus === null) {
      setPriceError(t.common.invalidPrice);
      return;
    }
    setPriceError(undefined);
    const ok = await run(
      () => call('/campaigns', { method: 'POST', json: { title, priceKurus } }),
      t.common.added,
    );
    if (ok) {
      setTitle('');
      setPrice('');
    }
  }

  return (
    <form onSubmit={add} className="mt-8 rounded-md border border-dashed border-rule p-4">
      <fieldset className="flex flex-wrap items-end gap-3">
        <legend className="mb-2 text-base font-semibold">{t.campaigns.newCampaign}</legend>
        <TextField
          className="min-w-48 flex-[2]"
          label={t.campaigns.campaignTitle}
          value={title}
          maxLength={CAMPAIGN_LIMITS.titleMax}
          required
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          className="w-32"
          label={t.campaigns.price}
          value={price}
          inputMode="decimal"
          required
          error={priceError}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Button type="submit" variant="secondary" disabled={!title.trim() || !price.trim()}>
          {t.campaigns.add}
        </Button>
      </fieldset>
    </form>
  );
}
