import { TestBed } from '@angular/core/testing';
import { Referentiel } from './referentiel';

describe('Referentiel', () => {
  let service: Referentiel;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Referentiel);
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });
});
