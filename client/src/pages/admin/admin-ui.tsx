import { formatPrice } from '@faralyah/shared';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { tr } from '@/content/tr';
import { ApiError } from '@/lib/admin-api';
import { useAdmin } from './admin-context';

const t = tr.admin.common;

/** Up / down / delete buttons for one row. Each names the thing it acts on (DESIGN.md §4.7). */
export function RowActions({
  name,
  first,
  last,
  onMove,
  onDelete,
  deleteDisabledReason,
}: {
  name: string;
  first: boolean;
  last: boolean;
  onMove: (direction: 'up' | 'down') => void;
  onDelete: () => void;
  deleteDisabledReason?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        aria-label={`${name}: ${t.moveUp}`}
        disabled={first}
        onClick={() => onMove('up')}
      >
        <ArrowUp className="size-5" aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        aria-label={`${name}: ${t.moveDown}`}
        disabled={last}
        onClick={() => onMove('down')}
      >
        <ArrowDown className="size-5" aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        aria-label={`${name}: ${t.delete}`}
        title={deleteDisabledReason}
        disabled={deleteDisabledReason !== undefined}
        onClick={() => {
          if (window.confirm(`"${name}" ${t.confirmDelete}`)) onDelete();
        }}
      >
        <Trash2 className="size-5" aria-hidden="true" />
      </Button>
    </div>
  );
}

/** Turkish message for a failed admin call. */
export function errorText(error: unknown, messages: Record<string, string> = {}): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return t.sessionExpired;
    if (messages[error.code]) return messages[error.code]!;
  }
  return t.saveError;
}

export type RunAction = (
  action: () => Promise<unknown>,
  okText: string,
  messages?: Record<string, string>,
) => Promise<boolean>;

/** Runs an admin change, shows the result in the live region, then refreshes the list. */
export function useAdminAction(refresh: () => void): RunAction {
  const { notify } = useAdmin();
  return useCallback(
    async (action, okText, messages) => {
      try {
        await action();
        notify({ kind: 'ok', text: okText });
        refresh();
        return true;
      } catch (error) {
        notify({ kind: 'error', text: errorText(error, messages) });
        return false;
      }
    },
    [notify, refresh],
  );
}

/** 12550 kuruş → "125,50" for a price input (no ₺, no grouping, easy to edit). */
export function priceToInput(kurus: number): string {
  return formatPrice(kurus).replace(/\s?₺$/, '').replace(/\./g, '');
}
