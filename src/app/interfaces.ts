import { ActionType, LineStatus } from './enums';

export type LetterStatus = 'UNKNOWN' | 'CONTAINED' | 'CORRECT' | 'ABSENT';

export interface Board {
    lines: Array<Line>;
    activeLineIndex: number;
    gameOver?: boolean;
}

export interface Line {
    word: Array<Letter>;
    status: LineStatus;
}

export interface Letter {
    value: string;
    status: LetterStatus;
}

export interface Key {
    value: string;
    statuses: Array<LetterStatus>;
}

export interface GuessesState {
    guesses: Array<string>;
    lastAction?: ActionType;
}

export interface Update {
    letter?: string;
    action: ActionType;
}
