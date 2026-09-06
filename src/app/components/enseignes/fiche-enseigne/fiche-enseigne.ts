import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Enseigne } from '../../../services/enseigne.interface';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { Referentiel } from '../../../services/referentiel';
import { MatProgressBar } from '@angular/material/progress-bar';

@Component({
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    TranslatePipe,
    DatePipe,
    MatProgressBar,
  ],
  selector: 'app-fiche-enseigne',
  styleUrl: './fiche-enseigne.sass',
  templateUrl: './fiche-enseigne.html',
})
export class FicheEnseigne implements OnInit {
  private referentiel = inject(Referentiel);

  protected enseigne: WritableSignal<Enseigne | undefined> = signal(undefined);

  // données pour la vue
  protected chargement: WritableSignal<boolean> = signal(true);
  activiteParCodeNAF?: Map<string, string>;

  ngOnInit(): void {
    this.referentiel.nafRev2().subscribe((activiteParCodeNAF) => {
      this.activiteParCodeNAF = activiteParCodeNAF;
      this.chargement.set(false);
    });
  }

  afficher(enseigne: Enseigne): void {
    this.enseigne.set(enseigne);
  }
}
