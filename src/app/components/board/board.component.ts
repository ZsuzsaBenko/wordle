import { NgClass } from '@angular/common';
import { Component, DestroyRef, inject, input, OnInit, output, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { delay, EMPTY, of, skip } from 'rxjs';
import { ActionType, LineStatus } from '../../enums';
import { Board, GuessesState, Letter, Line } from '../../interfaces';
import { GuessesService } from '../../services/guesses.service';

@Component({
    selector: 'app-board',
    imports: [
        NgClass
    ],
    templateUrl: './board.component.html',
    styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit {
    readonly lineNumber = input.required<number>();
    readonly wordToGuess = input.required<string>();
    readonly boardNumber = input.required<number>();
    readonly gameOver = output<string>();
    readonly board: WritableSignal<Board> = signal({ lines: [], activeLineIndex: 0 });
    readonly showError = signal(false);
    readonly lineStatusEnum = LineStatus;

    private readonly guessesService = inject(GuessesService);
    private readonly destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        this.initBoard();
        this.guessesService.guessesState
            .pipe(takeUntilDestroyed(this.destroyRef), skip(1))
            .subscribe(state => this.updateBoard(state));
    }

    isSolution(word: Array<Letter>): boolean {
        return word.map(letter => letter.value).join('') === this.wordToGuess();
    }

    private initBoard(): void {
        const board: Board = { lines: [], activeLineIndex: 0 };

        for (let i = 0; i < this.lineNumber(); i++) {
            const word: Array<Letter> = [];
            for (let j = 0; j < 5; j++) {
                const letter: Letter = { value: '', status: 'UNKNOWN' };
                word.push(letter);
            }
            const line: Line = { word, status: i === 0 ? LineStatus.ACTIVE : LineStatus.INACTIVE };
            board.lines.push(line);
        }

        this.board.set(board);
    }

    private updateBoard(state: GuessesState): void {
        const board: Board = JSON.parse(JSON.stringify(this.board()));
        if (board.gameOver) {
            return;
        }

        const activeWord = state.guesses[board.activeLineIndex];

        if (state.lastAction === ActionType.DECLINE) {
            this.showError.set(true);
            of(EMPTY).pipe(delay(1500)).subscribe(() => {
                for (const letter of activeWord) {
                    this.guessesService.updateGuesses({ action: ActionType.DELETE });
                }
                this.showError.set(false);
            });
            return;
        } else if (state.lastAction === ActionType.ACCEPT) {
            board.lines[board.activeLineIndex] = { ...board.lines[board.activeLineIndex], status: LineStatus.FINISHED };

            const nextIndex = board.activeLineIndex + 1;
            if (nextIndex === this.lineNumber() || activeWord === this.wordToGuess()) {
                board.gameOver = true;
                this.gameOver.emit(activeWord);
            } else {
                board.activeLineIndex = nextIndex;
                board.lines[nextIndex] = { ...board.lines[nextIndex], status: LineStatus.ACTIVE };
            }
        } else {
            const letters = this.getLettersFromGuess(activeWord);
            board.lines[board.activeLineIndex] = { word: letters, status: LineStatus.ACTIVE };
        }

        this.board.set(board);
    }

    private getLettersFromGuess(guess: string | undefined): Array<Letter> {
        const letters: Array<Letter> = [];
        for (let i = 0; i < 5; i++) {
            if (guess && i < guess.length) {
                const character = guess[i];
                const letter: Letter = {
                    value: character,
                    status: this.wordToGuess().includes(character) ?
                        this.wordToGuess()[i] === character ? 'CORRECT' : 'CONTAINED' : 'ABSENT'
                };
                letters.push(letter);
            } else {
                letters.push({ value: '', status: 'UNKNOWN' });
            }
        }

        return letters;
    }
}
