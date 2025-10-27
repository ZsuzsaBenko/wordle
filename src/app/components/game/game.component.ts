import { NgClass } from '@angular/common';
import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionType, GameType } from '../../enums';
import { GuessesService } from '../../services/guesses.service';
import { WORDS } from '../../words';
import { BoardComponent } from '../board/board.component';
import { GameOverComponent } from '../game-over/game-over.component';
import { KeyboardComponent } from '../keyboard/keyboard.component';

@Component({
    selector: 'app-game',
    imports: [
        BoardComponent,
        GameOverComponent,
        KeyboardComponent,
        NgClass
    ],
    templateUrl: './game.component.html',
    styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit {
    readonly gameType = signal<GameType>(GameType.WORDLE);
    readonly wordsToGuess = signal<Array<string>>([]);
    readonly boardGameOvers = signal<Array<string>>([]);
    readonly gameTypeCssClass = computed(() => this.gameType().toLowerCase());

    lineNumber = 0;

    private readonly allowedCharacters = [
        'a', 'á', 'b', 'c', 'd', 'e', 'é', 'f', 'g', 'h', 'i', 'í', 'j', 'k', 'l', 'm', 'n', 'o',
        'ó', 'ö', 'ő', 'p', 'q', 'r', 's', 't', 'u', 'ú', 'ü', 'ű', 'v', 'x', 'y', 'z'
    ];
    private readonly guessesService = inject(GuessesService);
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly router = inject(Router);

    @HostListener('document:keydown', [ '$event' ])
    handleKeyboardEvent(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.guessesService.updateGuesses({ action: ActionType.SUBMIT });
        } else if (event.key === 'Backspace') {
            event.preventDefault();
            this.guessesService.updateGuesses({ action: ActionType.DELETE });
        } else {
            if (this.allowedCharacters.includes(event.key)) {
                this.guessesService.updateGuesses({ letter: event.key.toUpperCase(), action: ActionType.ADD });
            }
        }
    }

    ngOnInit(): void {
        this.activatedRoute.queryParams.subscribe(params => {
            this.gameType.set(params['gameType']);
            switch (this.gameType()) {
                case GameType.WORDLE:
                    this.updateWordsToGuess(1);
                    this.lineNumber = 6;
                    break;
                case GameType.DORDLE:
                    this.updateWordsToGuess(2);
                    this.lineNumber = 7;
                    break;
                case GameType.QUORDLE:
                    this.updateWordsToGuess(4);
                    this.lineNumber = 9;
                    break;
                default:
                    console.error('Unknown game type!');
            }
        });
    }

    startNewGame(): void {
        this.router.navigate([ '' ]).then(() => {
            this.guessesService.clearState();
        });
    }

    handleGameOver(lastWord: string): void {
        this.boardGameOvers.set([ ...this.boardGameOvers(), lastWord ]);
    }

    private updateWordsToGuess(boardNumber: number): void {
        const words = [];
        for (let i = 0; i < boardNumber; i++) {
            words.push(this.getWordToGuess());
        }
        this.wordsToGuess.set(words);
    }

    private readonly getWordToGuess = (): string => {
        const alphabet = 'AÁBCDEÉFGHIÍJKLMNOÓÖŐPRSTUÚÜŰVZ';
        const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
        const wordsWithRandomLetter = (WORDS as { [key: string]: Array<string> })[randomLetter];

        return wordsWithRandomLetter[Math.floor(Math.random() * wordsWithRandomLetter.length)];
    };
}
