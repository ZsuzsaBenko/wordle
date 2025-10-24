import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';

interface Result {
    guessed: Array<boolean>;
    state: string;
}

@Component({
    selector: 'app-game-over',
    imports: [
        NgClass
    ],
    templateUrl: './game-over.component.html',
    styleUrl: './game-over.component.scss'
})
export class GameOverComponent {
    readonly wordsToGuess = input.required<Array<string>>();
    readonly boardGameOvers = input.required<Array<string>>();
    readonly result = computed<Result>(() => this.computeResult());

    private computeResult(): Result {
        const guessed: Array<boolean> = [];
        this.wordsToGuess().forEach(word => {
            guessed.push(this.boardGameOvers().includes(word));
        });

        if (guessed.every(item => item)) {
            return { guessed, state: 'SUCCESS' };
        } else if (guessed.every(item => !item)) {
            return { guessed, state: 'FAIL' };
        }
        return { guessed, state: 'ALMOST' };
    }
}
