import { NgClass } from '@angular/common';
import { Component, computed, inject, input, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tdesignDelete1 as deleteIcon, tdesignEnter as enterIcon } from '@ng-icons/tdesign-icons';
import { ActionType } from '../../enums';
import { Key } from '../../interfaces';
import { GuessesService } from '../../services/guesses.service';

@Component({
    selector: 'app-keyboard',
    imports: [
        NgClass, NgIcon
    ],
    templateUrl: './keyboard.component.html',
    styleUrl: './keyboard.component.scss',
    viewProviders: [ provideIcons({ deleteIcon, enterIcon }) ]
})
export class KeyboardComponent {
    readonly wordsToGuess = input.required<Array<string>>();
    readonly keyboard: WritableSignal<Array<Key>> = signal([]);
    private readonly keyboardCharacters = 'AÁBCDEÉFGHIÍJKLMNOÓÖŐPRSTUÚÜŰVXYZ';
    private readonly guessesService = inject(GuessesService);
    private readonly extendedWordsToGuess: Signal<Array<string>> = computed(() => this.extendWordsToGuess());

    constructor() {
        this.initKeyboard();
        this.guessesService.guessesState
            .pipe(takeUntilDestroyed())
            .subscribe(state => {
                if (state.lastAction === ActionType.ACCEPT) {
                    this.updateKeyboard(state.guesses);
                }
            });
    }

    addLetter(key: Key): void {
        this.guessesService.updateGuesses({ action: ActionType.ADD, letter: key.value });
    }

    deleteLetter(): void {
        this.guessesService.updateGuesses({ action: ActionType.DELETE });
    }

    submit(): void {
        this.guessesService.updateGuesses({ action: ActionType.SUBMIT });
    }

    preventDefault = (event: Event): void => {
        event.preventDefault();
    };

    private extendWordsToGuess(): Array<string> {
        const words = [ ...this.wordsToGuess() ];
        if (words.length === 1) {
            words.push(words[0], words[0], words[0]);
        } else if (words.length === 2) {
            words.push(words[0], words[1]);
        }

        return words;
    }

    private initKeyboard(): void {
        const keyboard = this.keyboardCharacters
            .split('')
            .map(char => ({
                    value: char,
                    statuses: [ 'UNKNOWN', 'UNKNOWN', 'UNKNOWN', 'UNKNOWN' ]
                } as unknown as Key)
            );
        this.keyboard.set(keyboard);
    }

    private updateKeyboard(guesses: Array<string>): void {
        const updatedKeyboard = this.keyboard();
        const guess = guesses[guesses.length - 2];

        guess.split('').forEach((letter, letterIndex) => {
            const key = this.getKey(updatedKeyboard, letter);
            if (key) {
                this.extendedWordsToGuess().forEach((word, boardIndex) => {
                    if (key.statuses[boardIndex] !== 'CORRECT') {
                        if (word.includes(letter)) {
                            if (key.value === word[letterIndex].toUpperCase()) {
                                key.statuses[boardIndex] = 'CORRECT';
                            } else {
                                key.statuses[boardIndex] = 'CONTAINED';
                            }
                        } else {
                            key.statuses[boardIndex] = 'ABSENT';
                        }
                    }
                });
            }
        });

        this.keyboard.set(updatedKeyboard);

    }

    private readonly getKey = (keyboard: Array<Key>, letter: string):
        Key | undefined => keyboard.find(key => key.value === letter);

}
