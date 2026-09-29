import { describe, it, expect, vi } from 'vitest';
<<<<<<< HEAD
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MergeUsersDialog, type MergeUsersDialogProps } from './MergeUsersDialog';
import type { MergeCandidate } from './mergeSelection';
=======
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MergeUsersDialog,
  type MergeCandidate,
  type MergeUsersDialogProps,
} from './MergeUsersDialog';
>>>>>>> e10e89cd (Limit image ownership changes to writable data)

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/hooks/useServerColorMap', () => ({
  useServerColorMap: () => new Map(),
}));

const candidates: [MergeCandidate, MergeCandidate] = [
  {
    userId: 'user-a',
    displayName: 'Bob (Plex)',
    username: 'bob',
<<<<<<< HEAD
    emails: ['bob@example.com'],
    loginCapable: false,
    lastActivityAt: '2026-01-01T00:00:00.000Z',
    sessionCount: 12,
=======
    loginCapable: false,
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
    serverUsers: [],
  },
  {
    userId: 'user-b',
    displayName: 'Bob (Jellyfin)',
    username: 'bob-jf',
<<<<<<< HEAD
    emails: [],
    loginCapable: false,
    lastActivityAt: null,
    sessionCount: 3,
=======
    loginCapable: false,
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
    serverUsers: [],
  },
];

<<<<<<< HEAD
function renderDialog(overrides: Partial<MergeUsersDialogProps> = {}) {
  const onConfirm = vi.fn();
  const props: MergeUsersDialogProps = {
    open: true,
    onOpenChange: vi.fn(),
    candidates,
    defaultTargetUserId: 'user-b',
    requiredTargetUserId: null,
    match: { type: 'email', value: 'bob@example.com', onUsername: false },
    sameServer: null,
    isLoading: false,
    onConfirm,
    ...overrides,
  };
  const view = render(<MergeUsersDialog {...props} />);
  return { onConfirm, props, ...view };
}

const kept = () => within(screen.getByRole('region', { name: 'pages:users.mergeKeep' }));
const confirmButton = () => screen.getByRole('button', { name: 'pages:users.mergeConfirmInto' });
const swapButton = () => screen.getByRole('button', { name: 'pages:users.mergeSwap' });
const acknowledgement = () =>
  screen.getByRole('checkbox', { name: 'pages:users.mergeIrreversibleAcknowledge' });

describe('MergeUsersDialog', () => {
  it('keeps the suggested identity by default and merges the other into it', async () => {
    const { onConfirm } = renderDialog();

    expect(kept().getByText('Bob (Jellyfin)')).toBeInTheDocument();
    await userEvent.click(confirmButton());
=======
type PlainOverrides = Partial<
  Omit<MergeUsersDialogProps, 'sameServerWarning' | 'sameServerName'>
> & {
  sameServerWarning?: false;
  sameServerName?: string | null;
};

type SameServerOverrides = Partial<
  Omit<MergeUsersDialogProps, 'sameServerWarning' | 'sameServerName'>
> & {
  sameServerName?: string;
};

function renderDialog(overrides: PlainOverrides = {}) {
  const onConfirm = vi.fn();
  render(
    <MergeUsersDialog
      open
      onOpenChange={vi.fn()}
      candidates={candidates}
      requiredTargetUserId={null}
      onConfirm={onConfirm}
      isLoading={false}
      sameServerWarning={false}
      sameServerName={null}
      {...overrides}
    />
  );
  return { onConfirm };
}

function renderSameServerDialog(overrides: SameServerOverrides = {}) {
  const onConfirm = vi.fn();
  render(
    <MergeUsersDialog
      open
      onOpenChange={vi.fn()}
      candidates={candidates}
      requiredTargetUserId={null}
      onConfirm={onConfirm}
      isLoading={false}
      sameServerWarning={true}
      sameServerName="Living Room Plex"
      {...overrides}
    />
  );
  return { onConfirm };
}

describe('MergeUsersDialog', () => {
  it('lets the admin pick the primary between two plain identities', async () => {
    const { onConfirm } = renderDialog();

    await userEvent.click(screen.getByRole('radio', { name: /Bob \(Jellyfin\)/ }));
    await userEvent.click(screen.getByRole('button', { name: 'pages:users.mergeConfirm' }));
>>>>>>> e10e89cd (Limit image ownership changes to writable data)

    expect(onConfirm).toHaveBeenCalledWith({
      sourceUserId: 'user-a',
      targetUserId: 'user-b',
      confirmSameServerCombine: false,
    });
  });

<<<<<<< HEAD
  it('swaps which identity is kept', async () => {
    const { onConfirm } = renderDialog();

    await userEvent.click(swapButton());
    expect(kept().getByText('Bob (Plex)')).toBeInTheDocument();
    await userEvent.click(confirmButton());

    expect(onConfirm).toHaveBeenCalledWith({
      sourceUserId: 'user-b',
      targetUserId: 'user-a',
      confirmSameServerCombine: false,
    });
  });

  it('keeps a login-capable identity over the suggested default and locks the swap', () => {
=======
  it('forces a login-capable identity as the target', () => {
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
    renderDialog({
      candidates: [{ ...candidates[0], loginCapable: true }, candidates[1]],
      requiredTargetUserId: 'user-a',
    });

<<<<<<< HEAD
    expect(kept().getByText('Bob (Plex)')).toBeInTheDocument();
    expect(swapButton()).toBeDisabled();
    expect(screen.getByText('pages:users.mergeRequired')).toBeInTheDocument();
  });

  it('asks about a suggestion with its reason and highlights the shared email', () => {
    renderDialog();

    expect(screen.getByText('pages:users.mergeTitleSuggestion')).toBeInTheDocument();
    expect(screen.getByText('pages:users.mergeReasonEmail')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com').tagName).toBe('MARK');
    expect(screen.getByText('pages:users.mergeDeleted')).toBeInTheDocument();
  });

  it('does not repeat an email that is the username, and highlights the username instead', () => {
    renderDialog({
      candidates: [
        candidates[0],
        { ...candidates[1], username: 'Bob@Example.com', emails: ['bob@example.com'] },
      ],
    });

    const jellyfin = within(screen.getByRole('region', { name: 'pages:users.mergeKeep' }));
    expect(jellyfin.getByText('Bob@Example.com').tagName).toBe('MARK');
    expect(jellyfin.queryByText('bob@example.com')).not.toBeInTheDocument();
  });

  it('gives the username reason when the shared email is an account username', () => {
    renderDialog({ match: { type: 'email', value: 'bob@example.com', onUsername: true } });

    expect(screen.getByText('pages:users.mergeReasonEmailUsername')).toBeInTheDocument();
    expect(screen.queryByText('pages:users.mergeReasonEmail')).not.toBeInTheDocument();
  });

  it('asks the bulk question without a reason and skips unknown session counts', () => {
    renderDialog({
      match: null,
      candidates: [
        { ...candidates[0], sessionCount: undefined },
        { ...candidates[1], sessionCount: undefined },
      ],
    });

    expect(screen.getByText('pages:users.mergeTitleBulk')).toBeInTheDocument();
    expect(screen.queryByText('pages:users.mergeReasonEmail')).not.toBeInTheDocument();
    expect(screen.queryByText(/pages:users\.mergeSessions/)).not.toBeInTheDocument();
    expect(screen.getByText('pages:users.mergeMovesNoCount')).toBeInTheDocument();
  });

  it('requires the acknowledgement before a same-server combine, naming the server', async () => {
    const { onConfirm } = renderDialog({ sameServer: { serverName: 'Living Room Plex' } });

    expect(screen.getAllByRole('alertdialog')).toHaveLength(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('pages:users.mergeIrreversibleTitle')).toBeInTheDocument();
    expect(screen.getByText('Living Room Plex')).toBeInTheDocument();
    expect(screen.getByText('pages:users.mergeRulesKept')).toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();

    await userEvent.click(acknowledgement());
    await userEvent.click(confirmButton());

    expect(onConfirm).toHaveBeenCalledWith({
      sourceUserId: 'user-a',
      targetUserId: 'user-b',
=======
    expect(screen.getByRole('radio', { name: /Bob \(Plex\)/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Bob \(Jellyfin\)/ })).toBeDisabled();
    expect(screen.getByText('pages:users.mergePrimaryForced')).toBeInTheDocument();
  });

  it('does not show the destructive confirmation button when there is no same-server conflict', () => {
    renderDialog();

    expect(screen.queryByText('pages:users.mergeSameServerWarning')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'pages:users.mergeConfirm' })).toBeEnabled();
  });

  it('requires a distinct alert-dialog acknowledgement before a same-server combine, naming the server', async () => {
    const { onConfirm } = renderSameServerDialog({ sameServerName: 'Living Room Plex' });

    // The destructive confirmation is loud, explicit, and names the affected server.
    expect(screen.getByText('pages:users.mergeSameServerWarningTitle')).toBeInTheDocument();
    expect(screen.getByText('pages:users.mergeSameServerWarning')).toBeInTheDocument();
    expect(screen.getByText('Living Room Plex')).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: 'pages:users.mergeConfirm' });
    expect(confirmButton).toBeDisabled();

    const acknowledgeCheckbox = screen.getByRole('checkbox', {
      name: 'pages:users.mergeSameServerAcknowledge',
    });
    expect(acknowledgeCheckbox).not.toBeChecked();

    await userEvent.click(acknowledgeCheckbox);
    expect(confirmButton).toBeEnabled();

    await userEvent.click(confirmButton);
    expect(onConfirm).toHaveBeenCalledWith({
      sourceUserId: 'user-b',
      targetUserId: 'user-a',
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
      confirmSameServerCombine: true,
    });
  });

<<<<<<< HEAD
  it('falls back to generic copy when the same-server name is unknown', () => {
    renderDialog({ sameServer: { serverName: null } });

    expect(screen.getByText('pages:users.mergeServerUnknown')).toBeInTheDocument();
  });

  it('disables the swap, acknowledgement and confirm while the merge is pending', () => {
    renderDialog({ sameServer: { serverName: 'Living Room Plex' }, isLoading: true });

    expect(swapButton()).toBeDisabled();
    expect(acknowledgement()).toBeDisabled();
    expect(confirmButton()).toBeDisabled();
  });

  it('keeps the acknowledgement when a re-render passes the same pair as a new array', async () => {
    const { props, rerender } = renderDialog({ sameServer: { serverName: 'Living Room Plex' } });

    await userEvent.click(acknowledgement());
    rerender(
      <MergeUsersDialog {...props} candidates={[{ ...candidates[0] }, { ...candidates[1] }]} />
    );

    expect(acknowledgement()).toBeChecked();
  });

  it('marks an identity as removed only when every account is removed', () => {
=======
  it('falls back to generic copy when the same-server name is a runtime-empty string', () => {
    renderSameServerDialog({ sameServerName: '' });

    expect(screen.getByText('pages:users.mergeSameServerFallbackName')).toBeInTheDocument();
  });

  it('renders exactly one dialog root in the same-server state', () => {
    renderSameServerDialog();

    expect(screen.getAllByRole('alertdialog')).toHaveLength(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('labels a removed server account as historical with a muted badge', () => {
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
    renderDialog({
      candidates: [
        {
          ...candidates[0],
          serverUsers: [
            {
              id: 'su-1',
<<<<<<< HEAD
              serverId: 's1',
              serverName: 'Plex',
=======
              serverId: 'srv-1',
              serverName: 'Living Room Plex',
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
              removedAt: '2026-01-01T00:00:00.000Z',
            },
          ],
        },
<<<<<<< HEAD
        {
          ...candidates[1],
          serverUsers: [
            {
              id: 'su-2',
              serverId: 's1',
              serverName: 'Plex',
              removedAt: '2026-01-01T00:00:00.000Z',
            },
            { id: 'su-3', serverId: 's2', serverName: 'Jellyfin', removedAt: null },
          ],
        },
      ],
    });

    expect(screen.getAllByText('pages:users.mergeServerAccountRemoved')).toHaveLength(1);
=======
        candidates[1],
      ],
    });

    expect(screen.getByText('pages:users.mergeServerAccountRemoved')).toBeInTheDocument();
  });

  it('disables the primary-picker radios and the acknowledgement checkbox while the merge mutation is pending', () => {
    renderSameServerDialog({ isLoading: true });

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    for (const radio of radios) {
      expect(radio).toBeDisabled();
    }

    expect(
      screen.getByRole('checkbox', { name: 'pages:users.mergeSameServerAcknowledge' })
    ).toBeDisabled();
  });

  it('keeps the acknowledgement checked when a parent re-render passes a new candidates array reference', async () => {
    const onConfirm = vi.fn();
    const initialCandidates: [MergeCandidate, MergeCandidate] = [
      { ...candidates[0] },
      { ...candidates[1] },
    ];

    const { rerender } = render(
      <MergeUsersDialog
        open
        onOpenChange={vi.fn()}
        candidates={initialCandidates}
        requiredTargetUserId={null}
        onConfirm={onConfirm}
        isLoading={false}
        sameServerWarning={true}
        sameServerName="Living Room Plex"
      />
    );

    const acknowledgeCheckbox = screen.getByRole('checkbox', {
      name: 'pages:users.mergeSameServerAcknowledge',
    });
    await userEvent.click(acknowledgeCheckbox);
    expect(acknowledgeCheckbox).toBeChecked();

    const sameCandidatesNewReference: [MergeCandidate, MergeCandidate] = [
      { ...candidates[0] },
      { ...candidates[1] },
    ];

    rerender(
      <MergeUsersDialog
        open
        onOpenChange={vi.fn()}
        candidates={sameCandidatesNewReference}
        requiredTargetUserId={null}
        onConfirm={onConfirm}
        isLoading={false}
        sameServerWarning={true}
        sameServerName="Living Room Plex"
      />
    );

    expect(
      screen.getByRole('checkbox', { name: 'pages:users.mergeSameServerAcknowledge' })
    ).toBeChecked();
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
  });
});
