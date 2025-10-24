import { TestBed } from '@angular/core/testing';

import { GuessesService } from './guesses.service';

describe('GuessesService', () => {
    let service: GuessesService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GuessesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
