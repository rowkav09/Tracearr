<<<<<<< HEAD
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeftRight, ChevronDown, ChevronRight, TriangleAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
=======
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TriangleAlert } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
<<<<<<< HEAD
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ServerPillList } from './ServerPillList';
import type { MergeCandidate, MergeRequest } from './mergeSelection';

export interface MergeConfirmInput {
  sourceUserId: string;
  targetUserId: string;
  confirmSameServerCombine: boolean;
}

export type MergeUsersDialogProps = MergeRequest & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (input: MergeConfirmInput) => void;
  isLoading: boolean;
};

type MergeReviewProps = Omit<MergeUsersDialogProps, 'open' | 'onOpenChange'>;

export function MergeUsersDialog({ open, onOpenChange, ...review }: MergeUsersDialogProps) {
  const [first, second] = review.candidates;
  return (
    // A merge deletes a user and a same-server combine cannot be undone, so the flow
    // uses AlertDialog. Constraint: keep this a single modal root. Nesting a second
    // Dialog/AlertDialog root here broke under Radix's aria-hide-others (both modals'
    // content got marked aria-hidden).
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl"
        {...(review.match ? {} : { 'aria-describedby': undefined })}
      >
        {/* A new pair starts from its own default; a re-render of the same pair keeps the owner's choices. */}
        <MergeReview key={`${first.userId}:${second.userId}`} {...review} />
      </AlertDialogContent>
    </AlertDialog>
  );
}

function MergeReview({
  candidates,
  defaultTargetUserId,
  requiredTargetUserId,
  match,
  sameServer,
  onConfirm,
  isLoading,
}: MergeReviewProps) {
  const { t } = useTranslation(['pages', 'common']);
  const isMobile = useIsMobile();
  const acknowledgeId = useId();
  const [targetUserId, setTargetUserId] = useState(requiredTargetUserId ?? defaultTargetUserId);
  const [acknowledged, setAcknowledged] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [first, second] = candidates;
  const keep = targetUserId === second.userId ? second : first;
  const fold = keep === first ? second : first;
  const names = { keepName: keep.displayName, foldName: fold.displayName };
  const matchedEmail = match?.type === 'email' ? match.value.toLowerCase() : null;
  const detailsShown = !isMobile || detailsOpen;
  const whatHappens = t('pages:users.mergeWhatHappens');

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>
          {match ? t('pages:users.mergeTitleSuggestion') : t('pages:users.mergeTitleBulk')}
        </AlertDialogTitle>
        {match && (
          <AlertDialogDescription>
            {match.type === 'username'
              ? t('pages:users.mergeReasonUsername', { value: match.value })
              : match.onUsername
                ? t('pages:users.mergeReasonEmailUsername', { value: match.value })
                : t('pages:users.mergeReasonEmail', { value: match.value })}
          </AlertDialogDescription>
        )}
      </AlertDialogHeader>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <CandidatePanel
          label={t('pages:users.mergeKeep')}
          candidate={keep}
          matchedEmail={matchedEmail}
          kept
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="self-center justify-self-center"
          aria-label={t('pages:users.mergeSwap')}
          disabled={requiredTargetUserId !== null || isLoading}
          onClick={() => setTargetUserId(fold.userId)}
        >
          <ArrowLeftRight className="rotate-90 sm:rotate-0" />
        </Button>
        <CandidatePanel
          label={t('pages:users.mergeFoldIn')}
          candidate={fold}
          matchedEmail={matchedEmail}
          kept={false}
        />
      </div>
      {requiredTargetUserId !== null && (
        <p className="text-muted-foreground text-sm">
          {t('pages:users.mergeRequired', { name: keep.displayName })}
        </p>
      )}

      <Collapsible open={detailsShown} onOpenChange={setDetailsOpen}>
        {isMobile ? (
          <CollapsibleTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="-ml-3">
              {detailsShown ? <ChevronDown /> : <ChevronRight />}
              {whatHappens}
            </Button>
          </CollapsibleTrigger>
        ) : (
          <h3 className="text-sm font-medium">{whatHappens}</h3>
        )}
        <CollapsibleContent>
          <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>
              {fold.sessionCount === undefined
                ? t('pages:users.mergeMovesNoCount', names)
                : t('pages:users.mergeMoves', { ...names, count: fold.sessionCount })}
            </li>
            <li>{t('pages:users.mergeCarriesOver')}</li>
            <li>
              {sameServer
                ? t('pages:users.mergeRulesKept', names)
                : t('pages:users.mergeDeleted', names)}
            </li>
          </ul>
        </CollapsibleContent>
      </Collapsible>

      {sameServer && (
        <Alert className="[&>svg]:text-destructive">
          <TriangleAlert />
          <AlertTitle>{t('pages:users.mergeIrreversibleTitle')}</AlertTitle>
          <AlertDescription className="gap-2">
            <p>{t('pages:users.mergeIrreversibleBody')}</p>
            <p className="flex flex-wrap gap-x-2">
              <span>{t('pages:users.mergeServerLabel')}</span>
              <span className="text-foreground font-medium">
                {sameServer.serverName || t('pages:users.mergeServerUnknown')}
              </span>
            </p>
            <div className="flex items-start gap-2 pt-1">
              <Checkbox
                id={acknowledgeId}
                className="mt-0.5"
=======
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ServerColumnCell } from '@/components/server';
import { RemovedBadge } from './RemovedBadge';
import { cn } from '@/lib/utils';

export interface MergeCandidateServerAccount {
  id: string;
  serverId: string;
  serverName: string;
  removedAt: string | null;
}

export interface MergeCandidate {
  userId: string;
  displayName: string;
  username: string;
  loginCapable: boolean;
  serverUsers: MergeCandidateServerAccount[];
}

interface MergeUsersDialogBaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: [MergeCandidate, MergeCandidate];
  requiredTargetUserId: string | null;
  onConfirm: (input: {
    sourceUserId: string;
    targetUserId: string;
    confirmSameServerCombine: boolean;
  }) => void;
  isLoading: boolean;
}

export type MergeUsersDialogProps = MergeUsersDialogBaseProps &
  (
    | {
        /** The two identities share an account on the same server; requires a destructive confirmation. */
        sameServerWarning: true;
        /** Name of the server whose accounts will be fused, shown in the destructive confirmation. */
        sameServerName: string;
      }
    | {
        sameServerWarning: false;
        sameServerName?: string | null;
      }
  );

export function MergeUsersDialog(props: MergeUsersDialogProps) {
  const { open, onOpenChange, candidates, requiredTargetUserId, onConfirm, isLoading } = props;
  const { t } = useTranslation(['pages', 'common']);
  const [targetUserId, setTargetUserId] = useState(requiredTargetUserId ?? candidates[0].userId);
  const [acknowledged, setAcknowledged] = useState(false);

  const firstCandidateUserId = candidates[0].userId;
  const secondCandidateUserId = candidates[1].userId;

  useEffect(() => {
    setTargetUserId(requiredTargetUserId ?? firstCandidateUserId);
    setAcknowledged(false);
  }, [open, requiredTargetUserId, firstCandidateUserId, secondCandidateUserId]);

  const source = candidates.find((c) => c.userId !== targetUserId) ?? candidates[0];

  const submit = (confirmSameServerCombine: boolean) => {
    onConfirm({ sourceUserId: source.userId, targetUserId, confirmSameServerCombine });
  };

  const picker = (
    <fieldset
      className="space-y-2"
      role="radiogroup"
      aria-label={t('pages:users.mergePickPrimary')}
    >
      <legend className="text-sm font-medium">{t('pages:users.mergePickPrimary')}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {candidates.map((candidate) => {
          const forced = requiredTargetUserId !== null;
          const disabled = (forced && candidate.userId !== requiredTargetUserId) || isLoading;
          const isTarget = targetUserId === candidate.userId;
          return (
            <label
              key={candidate.userId}
              className={cn(
                'flex cursor-pointer flex-col gap-2 rounded-md border p-3 transition-colors has-disabled:cursor-not-allowed has-disabled:opacity-60',
                isTarget ? 'border-primary bg-primary/5' : 'border-border'
              )}
            >
              <span className="flex items-start justify-between gap-2">
                <span className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="merge-primary"
                    value={candidate.userId}
                    checked={isTarget}
                    disabled={disabled}
                    onChange={() => setTargetUserId(candidate.userId)}
                    aria-label={candidate.displayName}
                    className="mt-1"
                  />
                  <span className="flex flex-col gap-1">
                    <span className="font-medium">{candidate.displayName}</span>
                    <span className="text-muted-foreground text-xs">@{candidate.username}</span>
                  </span>
                </span>
                {isTarget && (
                  <Badge variant="outline" className="shrink-0 text-xs font-normal">
                    {t('pages:users.mergePrimaryBadge')}
                  </Badge>
                )}
              </span>
              {candidate.serverUsers.length > 0 && (
                <span className="flex flex-wrap items-center gap-1 pl-7">
                  {candidate.serverUsers.map((serverUser) => (
                    <span key={serverUser.id} className="flex items-center gap-1">
                      <ServerColumnCell
                        server={{ id: serverUser.serverId, name: serverUser.serverName }}
                      />
                      {serverUser.removedAt && <RemovedBadge removedAt={serverUser.removedAt} />}
                    </span>
                  ))}
                </span>
              )}
            </label>
          );
        })}
      </div>
      {requiredTargetUserId !== null && (
        <p className="text-muted-foreground text-xs">{t('pages:users.mergePrimaryForced')}</p>
      )}
    </fieldset>
  );

  // The same-server combine is destructive and irreversible: render the whole
  // flow through AlertDialog so the confirmation matches the repo's
  // destructive-confirm pattern rather than a checkbox bolted onto a plain Dialog.
  // Constraint: this branch must stay a single top-level modal root. Nesting a
  // second Dialog/AlertDialog root here previously broke under Radix's
  // aria-hide-others (both modals' content got marked aria-hidden); do not
  // reintroduce a nested modal root to render this state.
  if (props.sameServerWarning) {
    const sameServerName = props.sameServerName || t('pages:users.mergeSameServerFallbackName');
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <TriangleAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
              {t('pages:users.mergeSameServerWarningTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('pages:users.mergeSameServerDialogDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {picker}

          <div className="border-destructive/50 bg-destructive/10 space-y-3 rounded-md border p-3">
            <p className="text-destructive text-sm">{t('pages:users.mergeSameServerWarning')}</p>
            <p className="text-sm font-semibold">{sameServerName}</p>
            <div className="flex items-center gap-2">
              <Checkbox
                id="merge-same-server-ack"
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
                checked={acknowledged}
                disabled={isLoading}
                onCheckedChange={(value) => setAcknowledged(value === true)}
              />
<<<<<<< HEAD
              <Label htmlFor={acknowledgeId} className="text-foreground leading-snug font-normal">
                {t('pages:users.mergeIrreversibleAcknowledge')}
              </Label>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <AlertDialogFooter>
        <AlertDialogCancel disabled={isLoading}>{t('common:actions.cancel')}</AlertDialogCancel>
        <Button
          type="button"
          variant={sameServer ? 'destructive' : 'default'}
          className="max-w-full"
          disabled={isLoading || (sameServer !== null && !acknowledged)}
          onClick={() =>
            onConfirm({
              sourceUserId: fold.userId,
              targetUserId: keep.userId,
              confirmSameServerCombine: sameServer !== null,
            })
          }
        >
          <span className="truncate">
            {t('pages:users.mergeConfirmInto', { keepName: keep.displayName })}
          </span>
        </Button>
      </AlertDialogFooter>
    </>
  );
}

function highlightMatch(text: string, matchedEmail: string | null) {
  return text.toLowerCase() === matchedEmail ? (
    <mark className="bg-primary/20 text-foreground rounded-sm px-1">{text}</mark>
  ) : (
    text
  );
}

function CandidatePanel({
  label,
  candidate,
  matchedEmail,
  kept,
}: {
  label: string;
  candidate: MergeCandidate;
  matchedEmail: string | null;
  kept: boolean;
}) {
  const { t } = useTranslation(['pages']);
  const labelId = useId();
  const activity = candidate.lastActivityAt
    ? t('pages:users.mergeLastActive', {
        relative: formatDistanceToNow(new Date(candidate.lastActivityAt), { addSuffix: true }),
      })
    : t('pages:users.mergeNeverActive');

  return (
    <section
      aria-labelledby={labelId}
      className={cn(
        'flex min-w-0 flex-col gap-2 rounded-lg p-3',
        kept ? 'bg-primary/10' : 'bg-muted/50'
      )}
    >
      <h3
        id={labelId}
        className={cn('text-xs font-medium', kept ? 'text-foreground' : 'text-muted-foreground')}
      >
        {label}
      </h3>
      <div className="min-w-0">
        <p className="truncate font-medium" title={candidate.displayName}>
          {candidate.displayName}
        </p>
        <p className="text-muted-foreground truncate text-sm" title={`@${candidate.username}`}>
          @{highlightMatch(candidate.username, matchedEmail)}
        </p>
      </div>
      {candidate.emails
        .filter((email) => email.toLowerCase() !== candidate.username.toLowerCase())
        .map((email) => (
          <p key={email} className="text-muted-foreground truncate text-sm" title={email}>
            {highlightMatch(email, matchedEmail)}
          </p>
        ))}
      <ServerPillList accounts={candidate.serverUsers} />
      <p className="text-muted-foreground text-xs">
        {activity}
        {candidate.sessionCount !== undefined &&
          ` · ${t('pages:users.mergeSessions', { count: candidate.sessionCount })}`}
      </p>
    </section>
=======
              <Label htmlFor="merge-same-server-ack" className="text-sm">
                {t('pages:users.mergeSameServerAcknowledge')}
              </Label>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{t('common:actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              disabled={!acknowledged || isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => submit(true)}
            >
              {t('pages:users.mergeConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('pages:users.mergeDialogTitle')}</DialogTitle>
          <DialogDescription>{t('pages:users.mergeDialogDescription')}</DialogDescription>
        </DialogHeader>

        {picker}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t('common:actions.cancel')}
          </Button>
          <Button onClick={() => submit(false)} disabled={isLoading}>
            {t('pages:users.mergeConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
  );
}
