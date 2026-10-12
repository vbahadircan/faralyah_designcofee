import {
  adminMenuSchema,
  MENU_LIMITS,
  parsePriceInput,
  type AdminCategory,
  type AdminMenuItem,
} from '@faralyah/shared';
import { useCallback, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { CheckboxField, TextField } from '@/components/ui/field';
import { tr } from '@/content/tr';
import { useFetch } from '@/hooks/use-fetch';
import { useAdmin } from './admin-context';
import { priceToInput, RowActions, useAdminAction, type RunAction } from './admin-ui';

const t = tr.admin;

export function MenuAdminPage() {
  const { call } = useAdmin();
  const load = useCallback(
    async (signal: AbortSignal) => adminMenuSchema.parse(await call('/menu', { signal })),
    [call],
  );
  const { state, reload, refresh } = useFetch(load);
  const run = useAdminAction(refresh);

  return (
    <>
      <h1 className="text-2xl font-bold">{t.menu.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t.menu.intro}</p>

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
          {state.data.categories.length === 0 ? (
            <p className="py-6">{t.menu.noCategories}</p>
          ) : null}
          {state.data.categories.map((category, index) => (
            <CategoryBlock
              key={category.id}
              category={category}
              first={index === 0}
              last={index === state.data.categories.length - 1}
              run={run}
            />
          ))}
          <NewCategoryForm run={run} />
        </>
      ) : null}
    </>
  );
}

type Run = RunAction;

function CategoryBlock({
  category,
  first,
  last,
  run,
}: {
  category: AdminCategory;
  first: boolean;
  last: boolean;
  run: Run;
}) {
  const { call } = useAdmin();
  const [name, setName] = useState(category.name);
  const [active, setActive] = useState(category.active);

  function save(event: FormEvent) {
    event.preventDefault();
    void run(
      () => call(`/categories/${category.id}`, { method: 'PATCH', json: { name, active } }),
      t.common.saved,
    );
  }

  return (
    <section
      aria-label={category.name}
      className="mt-6 rounded-md border border-rule bg-background p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-xl font-bold">{category.name}</h2>
        <RowActions
          name={category.name}
          first={first}
          last={last}
          onMove={(direction) =>
            void run(
              () =>
                call(`/categories/${category.id}/move`, { method: 'POST', json: { direction } }),
              t.common.saved,
            )
          }
          onDelete={() =>
            void run(
              () => call(`/categories/${category.id}`, { method: 'DELETE' }),
              t.common.deleted,
              {
                category_not_empty: t.menu.categoryNotEmpty,
              },
            )
          }
          deleteDisabledReason={category.items.length > 0 ? t.menu.categoryNotEmpty : undefined}
        />
      </div>
      <form onSubmit={save} className="mt-2 flex flex-wrap items-end gap-3">
        <TextField
          className="min-w-48 flex-1"
          label={t.menu.categoryName}
          value={name}
          maxLength={MENU_LIMITS.nameMax}
          required
          onChange={(e) => setName(e.target.value)}
        />
        <CheckboxField
          label={t.menu.categoryActive}
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        <Button type="submit" variant="secondary" disabled={!name.trim()}>
          {t.common.save}
        </Button>
      </form>

      {category.items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{t.menu.emptyCategory}</p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-rule border-y border-rule">
          {category.items.map((item, index) => (
            <li key={item.id} className="py-3">
              <ItemEditor
                item={item}
                first={index === 0}
                last={index === category.items.length - 1}
                run={run}
              />
            </li>
          ))}
        </ul>
      )}
      <NewItemForm categoryId={category.id} categoryName={category.name} run={run} />
    </section>
  );
}

function ItemEditor({
  item,
  first,
  last,
  run,
}: {
  item: AdminMenuItem;
  first: boolean;
  last: boolean;
  run: Run;
}) {
  const { call } = useAdmin();
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(priceToInput(item.priceKurus));
  const [description, setDescription] = useState(item.description ?? '');
  const [visible, setVisible] = useState(item.visible);
  const [priceError, setPriceError] = useState<string>();

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
        call(`/items/${item.id}`, {
          method: 'PATCH',
          json: { name, priceKurus, description, visible },
        }),
      t.common.saved,
    );
  }

  return (
    <form onSubmit={save}>
      <fieldset className="flex flex-col gap-3">
        <legend className="sr-only">{item.name}</legend>
        <div className="flex flex-wrap items-end gap-3">
          <TextField
            className="min-w-48 flex-[2]"
            label={t.menu.itemName}
            value={name}
            maxLength={MENU_LIMITS.nameMax}
            required
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            className="w-32"
            label={t.menu.price}
            value={price}
            inputMode="decimal"
            required
            error={priceError}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <TextField
          label={t.menu.description}
          value={description}
          maxLength={MENU_LIMITS.descriptionMax}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <CheckboxField
              label={t.menu.visible}
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
            />
            <Button type="submit" disabled={!name.trim()}>
              {t.common.save}
            </Button>
          </div>
          <RowActions
            name={item.name}
            first={first}
            last={last}
            onMove={(direction) =>
              void run(
                () => call(`/items/${item.id}/move`, { method: 'POST', json: { direction } }),
                t.common.saved,
              )
            }
            onDelete={() =>
              void run(() => call(`/items/${item.id}`, { method: 'DELETE' }), t.common.deleted)
            }
          />
        </div>
      </fieldset>
    </form>
  );
}

function NewItemForm({
  categoryId,
  categoryName,
  run,
}: {
  categoryId: string;
  categoryName: string;
  run: Run;
}) {
  const { call } = useAdmin();
  const [name, setName] = useState('');
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
      () => call('/items', { method: 'POST', json: { name, priceKurus, categoryId } }),
      t.common.added,
    );
    if (ok) {
      setName('');
      setPrice('');
    }
  }

  return (
    <form onSubmit={add} className="mt-4">
      <fieldset className="flex flex-wrap items-end gap-3">
        <legend className="mb-2 text-base font-semibold">
          {t.menu.newItem}: {categoryName}
        </legend>
        <TextField
          className="min-w-48 flex-[2]"
          label={t.menu.itemName}
          value={name}
          maxLength={MENU_LIMITS.nameMax}
          required
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          className="w-32"
          label={t.menu.price}
          value={price}
          inputMode="decimal"
          required
          error={priceError}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Button type="submit" variant="secondary" disabled={!name.trim() || !price.trim()}>
          {t.menu.addItem}
        </Button>
      </fieldset>
    </form>
  );
}

function NewCategoryForm({ run }: { run: Run }) {
  const { call } = useAdmin();
  const [name, setName] = useState('');

  async function add(event: FormEvent) {
    event.preventDefault();
    const ok = await run(
      () => call('/categories', { method: 'POST', json: { name } }),
      t.common.added,
    );
    if (ok) setName('');
  }

  return (
    <form onSubmit={add} className="mt-8 rounded-md border border-dashed border-rule p-4">
      <fieldset className="flex flex-wrap items-end gap-3">
        <legend className="mb-2 text-base font-semibold">{t.menu.newCategory}</legend>
        <TextField
          className="min-w-48 flex-1"
          label={t.menu.categoryName}
          value={name}
          maxLength={MENU_LIMITS.nameMax}
          required
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit" variant="secondary" disabled={!name.trim()}>
          {t.menu.addCategory}
        </Button>
      </fieldset>
    </form>
  );
}
