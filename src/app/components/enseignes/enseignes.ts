import { Component, viewChild } from '@angular/core';
import { CarteEnseignes } from './carte-enseignes/carte-enseignes';
import { FicheEnseigne } from './fiche-enseigne/fiche-enseigne';
import { Enseigne } from '../../services/enseigne.interface';

@Component({
  imports: [CarteEnseignes, FicheEnseigne],
  selector: 'app-enseignes',
  styleUrl: './enseignes.sass',
  templateUrl: './enseignes.html',
})
export class Enseignes {
  private ficheEnseigne = viewChild.required<FicheEnseigne>('ficheEnseigne');

  protected afficherEnseigne(enseigne: Enseigne) {
    this.ficheEnseigne().afficher(enseigne);
  }
}
