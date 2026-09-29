/**
 * User Merge Routes
 *
<<<<<<< HEAD
 * POST   /:id/merge                                  - Merge the source identity :id into body.targetUserId
 * GET    /merge-suggestions                          - Possible duplicate identities across servers
 * GET    /merge-suggestions/dismissed                - Pairs marked as not the same person, newest first
 * POST   /merge-suggestions/dismissals               - Mark body.userIds as not the same person
 * DELETE /merge-suggestions/dismissals/:userA/:userB - Restore a dismissed pair, in either order
=======
 * POST /:id/merge          - Merge the source identity :id into body.targetUserId
 * GET  /merge-suggestions  - Possible duplicate identities across servers
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
 *
 * IMPORTANT: :id here is a users.id (identity). Sibling routes in this
 * directory use server_users ids. The web client passes row.userId.
 * Owner only. Same-server combines are destructive and are refused with
 * 409 until confirmSameServerCombine is sent.
 */

import type { FastifyPluginAsync } from 'fastify';
import {
  mergeUsersBodySchema,
  mergeUserParamSchema,
<<<<<<< HEAD
  mergeSuggestionDismissalSchema,
  mergeSuggestionPairParamSchema,
=======
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
  MERGE_SAME_SERVER_CONFIRMATION_REQUIRED,
} from '@tracearr/shared';
import {
  mergeUsers,
  getMergeSuggestions,
<<<<<<< HEAD
  getDismissedMergeSuggestions,
  dismissMergeSuggestion,
  restoreMergeSuggestion,
=======
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
  MergeValidationError,
  SameServerCombineNotConfirmedError,
} from '../../services/mergeService.js';
import { UserNotFoundError } from '../../services/userService.js';

export const mergeRoutes: FastifyPluginAsync = async (app) => {
  app.get('/merge-suggestions', { preHandler: [app.requireOwner] }, async () => {
    const data = await getMergeSuggestions();
    return { data };
  });

<<<<<<< HEAD
  app.get('/merge-suggestions/dismissed', { preHandler: [app.requireOwner] }, async () => {
    const data = await getDismissedMergeSuggestions();
    return { data };
  });

  app.post(
    '/merge-suggestions/dismissals',
    { preHandler: [app.requireOwner] },
    async (request, reply) => {
      const body = mergeSuggestionDismissalSchema.safeParse(request.body);
      if (!body.success) {
        return reply.badRequest('Invalid request body');
      }

      try {
        await dismissMergeSuggestion(body.data.userIds, request.user.userId);
      } catch (error) {
        if (error instanceof UserNotFoundError) {
          return reply.notFound(error.message);
        }
        throw error;
      }
      return reply.code(204).send();
    }
  );

  app.delete(
    '/merge-suggestions/dismissals/:userA/:userB',
    { preHandler: [app.requireOwner] },
    async (request, reply) => {
      const params = mergeSuggestionPairParamSchema.safeParse(request.params);
      if (!params.success) {
        return reply.badRequest('Invalid user ID');
      }

      await restoreMergeSuggestion(params.data.userA, params.data.userB);
      return reply.code(204).send();
    }
  );

=======
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
  app.post('/:id/merge', { preHandler: [app.requireOwner] }, async (request, reply) => {
    const params = mergeUserParamSchema.safeParse(request.params);
    if (!params.success) {
      return reply.badRequest('Invalid user ID');
    }
    const body = mergeUsersBodySchema.safeParse(request.body);
    if (!body.success) {
      return reply.badRequest('Invalid request body');
    }

    try {
      return await mergeUsers(params.data.id, body.data.targetUserId, request.user.userId, {
        confirmSameServerCombine: body.data.confirmSameServerCombine,
      });
    } catch (error) {
      if (error instanceof SameServerCombineNotConfirmedError) {
        return reply.conflict(MERGE_SAME_SERVER_CONFIRMATION_REQUIRED);
      }
      if (error instanceof MergeValidationError) {
        return reply.badRequest(error.message);
      }
      if (error instanceof UserNotFoundError) {
        return reply.notFound(error.message);
      }
      throw error;
    }
  });
};
