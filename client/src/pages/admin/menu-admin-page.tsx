import { adminMenuSchema, MENU_LIMITS } from '@faralyah/shared';
import { useEffect, useState, type FormEvent } from 'react';
import { MenuCategoryBox } from '@/components/admin/menu-category-box';
import { SortableList, SortableRow } from '@/components/admin/sortable-list';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/field';
import { tr } from '@/content/tr';
import { useAdmin } from './admin-context';
import { errorText } from './admin-ui';
import {
  addCategory,
  addItem,
  draftFromMenu,
  draftKey,
  draftToSave,
  newDraftId,
  removeCategory,
  removeItem,
  reorderById,
  reorderItems,
  updateCategory,
  updateItem,
  type Draft,
  type DraftCategory,
} from './menu-draft';

const t = tr.admin;

/** The saved menu (`baseline`) and what the panel shows (`draft`). They differ until Kaydet. */
type Menu = { baseline: Draft; draft: Draft };

/**
 * Menu editor. Categories start collapsed. Rows are reordered by dragging their grip handle.
 * Every change lands in the draft; one Kaydet button at the bottom saves the whole menu, and the
 * bar only shows while there is something to save.
 */
export function MenuAdminPage() {
  const { call, notify } = useAdmin();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Loads the saved menu on mount, on retry, and after every save (so new rows get real ids).
  useEffect(() => {
    const controller = new AbortController();
    call('/menu', { signal: controller.signal })
      .then((body) => {
        const draft = draftFromMenu(adminMenuSchema.parse(body));
        setMenu({ baseline: draft, draft });
        setLoadFailed(false);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error(error);
        setLoadFailed(true);
        notify({ kind: 'error', text: t.common.loadError });
      });
    return () => controller.abort();
  }, [call, notify, attempt]);

  if (menu === null) {
    return loadFailed ? (
      <div role="alert" className="py-6">
        <p>{t.common.loadError}</p>
        <Button variant="secondary" className="mt-4" onClick={() => setAttempt((n) => n + 1)}>
          {t.common.retry}
        </Button>
      </div>
    ) : (
      <p aria-busy="true" className="py-6">
        {t.common.loading}
      </p>
    );
  }

  const { draft } = menu;
  const dirty = draftKey(draft) !== draftKey(menu.baseline);
  const editing = editingItemId !== null || renamingId !== null;

  function updateDraft(change: (current: Draft) => Draft) {
    setMenu((current) => (current ? { ...current, draft: change(current.draft) } : current));
  }

  function toggleExpanded(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addNewCategory(event: FormEvent) {
    event.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;
    const id = newDraftId();
    updateDraft((current) => addCategory(current, id, name));
    setNewCategoryName('');
  }

  function deleteCategory(category: DraftCategory) {
    if (!window.confirm(t.menu.confirmDeleteCategory(category.name, category.items.length))) {
      return;
    }
    updateDraft((current) => removeCategory(current, category.id));
    if (renamingId === category.id) setRenamingId(null);
    if (category.items.some((item) => item.id === editingItemId)) setEditingItemId(null);
  }

  function addNewItem(categoryId: string) {
    const id = newDraftId();
    updateDraft((current) => addItem(current, categoryId, id));
    setExpanded((current) => new Set(current).add(categoryId));
    setEditingItemId(id);
  }

  function deleteItem(categoryId: string, itemId: string) {
    updateDraft((current) => removeItem(current, categoryId, itemId));
    if (editingItemId === itemId) setEditingItemId(null);
  }

  function discard() {
    setMenu((current) => (current ? { ...current, draft: current.baseline } : current));
    setEditingItemId(null);
    setRenamingId(null);
  }

  async function save() {
    const input = draftToSave(draft);
    if (!input) {
      notify({ kind: 'error', text: t.common.saveError });
      return;
    }
    setSaving(true);
    try {
      await call('/menu', { method: 'PUT', json: input });
      notify({ kind: 'ok', text: t.common.saved });
      setAttempt((n) => n + 1);
    } catch (error) {
      notify({ kind: 'error', text: errorText(error) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold">{t.menu.title}</h1>

      <form onSubmit={addNewCategory} className="mt-4 flex flex-wrap items-end gap-3">
        <TextField
          className="min-w-48 flex-1"
          label={t.menu.newCategoryName}
          value={newCategoryName}
          maxLength={MENU_LIMITS.nameMax}
          onChange={(event) => setNewCategoryName(event.target.value)}
        />
        <Button type="submit" variant="secondary" disabled={!newCategoryName.trim()}>
          {t.menu.addCategory}
        </Button>
      </form>

      {draft.length === 0 ? <p className="mt-6">{t.menu.noCategories}</p> : null}

      <SortableList
        ids={draft.map((category) => category.id)}
        onReorder={(activeId, overId) =>
          updateDraft((current) => reorderById(current, activeId, overId))
        }
        className="mt-6 flex flex-col gap-3"
      >
        {draft.map((category) => (
          <SortableRow
            key={category.id}
            id={category.id}
            label={`${category.name}: ${t.menu.reorder}`}
          >
            {(handle) => (
              <MenuCategoryBox
                category={category}
                handle={handle}
                expanded={expanded.has(category.id)}
                renaming={renamingId === category.id}
                editingItemId={editingItemId}
                onToggle={() => toggleExpanded(category.id)}
                onRename={() =>
                  setRenamingId((current) => (current === category.id ? null : category.id))
                }
                onChange={(patch) =>
                  updateDraft((current) => updateCategory(current, category.id, patch))
                }
                onDelete={() => deleteCategory(category)}
                onAddItem={() => addNewItem(category.id)}
                onEditItem={(itemId) => setEditingItemId(itemId)}
                onChangeItem={(itemId, patch) =>
                  updateDraft((current) => updateItem(current, category.id, itemId, patch))
                }
                onReorderItem={(activeId, overId) =>
                  updateDraft((current) => reorderItems(current, category.id, activeId, overId))
                }
                onDeleteItem={(itemId) => deleteItem(category.id, itemId)}
                onFinishItem={() => setEditingItemId(null)}
              />
            )}
          </SortableRow>
        ))}
      </SortableList>

      {dirty ? (
        <div className="sticky bottom-0 -mx-4 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-rule bg-background px-4 py-3">
          <p className="text-sm font-semibold">{editing ? t.menu.finishEditing : t.menu.unsaved}</p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" disabled={saving} onClick={discard}>
              {t.menu.discard}
            </Button>
            <Button loading={saving} disabled={editing} onClick={() => void save()}>
              {t.common.save}
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
