<<<<<<< HEAD
import type { Newsletter } from '@tracearr/shared';
import { useCreateNewsletter, useUpdateNewsletter } from '@/hooks/queries';
=======
import { useQueryClient } from '@tanstack/react-query';
import type { Newsletter } from '@tracearr/shared';
import { newsletterKeys, useCreateNewsletter, useUpdateNewsletter } from '@/hooks/queries';
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
import { deepEqual, diffPatch, type NewsletterFormState } from './newsletterForm';

interface UseNewsletterSaveArgs {
  newsletterId: string | null;
  seed: NewsletterFormState;
  state: NewsletterFormState;
  valid: boolean;
  onSaved: (row: Newsletter, saved: NewsletterFormState) => void;
}

/** Create posts the whole object; edit patches the keys that moved. Nothing else on the page saves. */
export function useNewsletterSave({
  newsletterId,
  seed,
  state,
  valid,
  onSaved,
}: UseNewsletterSaveArgs) {
<<<<<<< HEAD
=======
  const queryClient = useQueryClient();
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
  const create = useCreateNewsletter();
  const update = useUpdateNewsletter();
  const dirty = !deepEqual(seed, state);
  const pending = create.isPending || update.isPending;

  const save = () => {
    if (!valid || pending) return;
    const saved = state;
    if (newsletterId === null) {
      create.mutate(saved, { onSuccess: (row) => onSaved(row, saved) });
      return;
    }
    update.mutate(
      { id: newsletterId, data: diffPatch(seed, saved) },
<<<<<<< HEAD
      { onSuccess: (row) => onSaved(row, saved) }
=======
      {
        onSuccess: (row) => {
          void queryClient.invalidateQueries({ queryKey: newsletterKeys.recipients(newsletterId) });
          onSaved(row, saved);
        },
      }
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
    );
  };

  return { dirty, pending, save };
}
