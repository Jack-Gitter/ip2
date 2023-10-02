/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { InteractableID } from './InteractableID';
import type { PlayerID } from './PlayerID';

/**
 * From T, pick a set of properties whose keys are in the union K
 */
export type Pick_ViewingArea_Exclude_keyofViewingArea_type__ = {
    id: InteractableID;
    occupants: Array<PlayerID>;
    video?: string;
    isPlaying: boolean;
    elapsedTimeSec: number;
};

