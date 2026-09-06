import { inject, Service } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Enseigne } from './enseigne.interface';

@Service()
export class Referentiel {
  private http = inject(HttpClient);
  private static readonly effectifParCode: any = {
    NN: "pas de salarié au cours de l'année de référence et pas d'effectif au 31/12",
    '00': '0',
    '01': '1 ou 2 salariés',
    '02': '3 à 5 salariés',
    '03': '6 à 9 salariés',
    '11': '10 à 19 salariés',
    '12': '20 à 49 salariés',
    '21': '50 à 99 salariés',
    '22': '100 à 199 salariés',
    '31': '200 à 249 salariés',
    '32': '250 à 499 salariés',
    '41': '500 à 999 salariés',
    '42': '1 000 à 1 999 salariés',
    '51': '2 000 à 4 999 salariés',
    '52': '5 000 à 9 999 salariés',
    '53': '10 000 salariés et plus',
  };

  public sia(): Observable<Array<Enseigne>> {
    return new Observable((observer: Observer<Array<Enseigne>>) => {
      this.http
        .get<Array<Enseigne>>(`${environment.urlReferentiel}/sia2026.json`)
        .subscribe((enseignes) => {
          enseignes.forEach((enseigne) => {
            enseigne.effectif = Referentiel.effectifParCode[enseigne.codeEffectif];
          });
          observer.next(enseignes);
        });
    });
  }

  public nafRev2(): Observable<Map<string, string>> {
    return new Observable((observer: Observer<Map<string, string>>) => {
      this.http.get<any>(`${environment.urlReferentiel}/NAFREV2.json`).subscribe((json) => {
        const resultat: Map<string, string> = new Map();
        this.mapNafRev2(json, resultat);
        observer.next(resultat);
      });
    });
  }

  private mapNafRev2(json: any, resultat: Map<string, string>) {
    Object.keys(json).forEach((key: string) => {
      if (typeof json === 'object' && typeof json[key] === 'string') {
        resultat.set(key, json[key]);
      } else {
        this.mapNafRev2(json[key], resultat);
      }
    });
  }
}
