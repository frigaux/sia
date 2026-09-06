import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarteEnseignes } from './carte-enseignes';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('CarteEnseignes', () => {
  let component: CarteEnseignes;
  let fixture: ComponentFixture<CarteEnseignes>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarteEnseignes],
      providers: [provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CarteEnseignes);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  describe('GIVEN data referential', () => {
    beforeEach(async () => {
      const testRequest = httpMock.expectOne(
        'http://localhost:4200/informatique/angular/sia/json/sia2026.json',
      );
      expect(testRequest.request.method).toBe('GET');
      testRequest.flush([
        {
          etablissement: 'MARATIER AUTO TELE CINEMA',
          naf: '45.11Z',
          siret: '30007210500012',
          sia: '20NW745174',
          codeEffectif: 'NN',
          dateCreation: '1900-01-01',
          etablissementSiege: false,
          numeroVoie: '119',
          typeVoie: 'RUE',
          voie: 'ALEXANDRE PRACHAY',
          codePostal: '95590',
          commune: 'PRESLES',
          longitude: 2.290239000000001,
          latitude: 49.111660000000015,
        },
      ]);
    });

    it('WHEN #sia observer is called THEN the component is defined', () => {
      expect(component).toBeDefined();
      expect(component.groupeMarqueurs.getLayers()).toHaveLength(1);
    });
  });
});
