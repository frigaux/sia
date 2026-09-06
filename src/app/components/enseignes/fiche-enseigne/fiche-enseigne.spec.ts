import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FicheEnseigne } from './fiche-enseigne';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('FicheEnseigne', () => {
  let component: FicheEnseigne;
  let fixture: ComponentFixture<FicheEnseigne>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FicheEnseigne],
      providers: [provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(FicheEnseigne);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  describe('GIVEN data referential', () => {
    beforeEach(async () => {
      const testRequest = httpMock.expectOne(
        'http://localhost:4200/informatique/angular/sia/json/NAFREV2.json',
      );
      expect(testRequest.request.method).toBe('GET');
      testRequest.flush([
        {
          'ACTIVITÉS EXTRA-TERRITORIALES': {
            'Activités des organisations et organismes extraterritoriaux': {
              'Activités des organisations et organismes extraterritoriaux': {
                '99.00': 'Activités des organisations et organismes extraterritoriaux',
              },
            },
          },
        },
      ]);
    });

    it('WHEN #nafRev2 observer is called THEN the component is defined', () => {
      expect(component).toBeDefined();
      expect(component.activiteParCodeNAF?.size).toBe(1);
    });
  });
});
