import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameType } from '../../enums';
import { GuessesService } from '../../services/guesses.service';

@Component({
    selector: 'app-home',
    imports: [
        ReactiveFormsModule
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    readonly gameTypeEnum = GameType;
    readonly control = new FormControl<GameType>(GameType.WORDLE, { nonNullable: true });
    private readonly router = inject(Router);
    private readonly guessesService = inject(GuessesService);

    startGame(): void {
        this.guessesService.clearState();
        this.router.navigate([ 'game' ], { queryParams: { gameType: this.control.value } });
    }

}
