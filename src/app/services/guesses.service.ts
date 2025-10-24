import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActionType } from '../enums';
import { GuessesState, Update } from '../interfaces';
import { WORDS } from '../words';

@Injectable({
    providedIn: 'root'
})
export class GuessesService {
    guessesState: Observable<GuessesState>;
    private readonly state = new BehaviorSubject<GuessesState>({ guesses: [] });

    constructor() {
        this.guessesState = this.state.asObservable();
    }

    updateGuesses(update: Update): void {
        const state = this.state.value;
        const guesses = state.guesses;
        const action = update.action;

        if (action === ActionType.SUBMIT) {
            const isValid = this.isValidGuess(guesses[guesses.length - 1]);
            this.state.next({
                guesses: isValid ? [ ...guesses, '' ] : guesses,
                lastAction: isValid ? ActionType.ACCEPT : ActionType.DECLINE
            });
        } else {
            const letter = update.letter;
            const lastWordIndex = guesses.length - 1;

            if (action === ActionType.ADD && letter) {
                if (lastWordIndex === -1) {
                    guesses.push(letter);
                } else {
                    const activeWord = guesses[lastWordIndex];
                    guesses[lastWordIndex] = `${activeWord}${letter}`;
                }
            } else if (action === ActionType.DELETE && lastWordIndex !== -1) {
                const activeWord = guesses[lastWordIndex];
                if (activeWord?.length) {
                    guesses[lastWordIndex] = activeWord.substring(0, activeWord.length - 1);
                }
            }
            state.lastAction = action;

            this.state.next(state);
        }

    }

    clearState(): void {
        this.state.next({ guesses: [] });
    }

    private readonly isValidGuess = (guess: string): boolean => {
        if (!guess || guess.length !== 5) {
            return false;
        } else if (this.state.value.guesses.indexOf(guess) !== this.state.value.guesses.lastIndexOf(guess)) {
            return false;
        }

        const words = WORDS as { [key: string]: Array<string> };
        return words[guess[0]].includes(guess);
    };

}
