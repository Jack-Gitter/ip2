/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { InteractableID } from './InteractableID';
import type { PlayerID } from './PlayerID';

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export type Pick_ConversationArea_Exclude_keyofConversationArea_type__ = {
    topic?: string;
    id: InteractableID;
    occupants: Array<PlayerID>;
};

