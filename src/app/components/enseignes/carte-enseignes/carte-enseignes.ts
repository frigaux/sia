import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  output,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Referentiel } from '../../../services/referentiel';
import * as L from 'leaflet';
import { Enseigne } from '../../../services/enseigne.interface';

@Component({
  imports: [MatProgressBar],
  selector: 'app-carte-enseignes',
  styleUrl: './carte-enseignes.sass',
  templateUrl: './carte-enseignes.html',
})
export class CarteEnseignes implements OnInit, AfterViewInit {
  outputEnseigneSelectionnee = output<Enseigne>({ alias: 'enseigneSelectionnee' });

  private referentiel = inject(Referentiel);

  @ViewChild('conteneurCarte') conteneurCarte!: ElementRef;
  private carte!: L.Map;
  groupeMarqueurs = L.layerGroup();
  private static readonly iconeMarqueur = L.divIcon({
    className: 'fond-marqueur', // Classe CSS personnalisée
    html: '<div class="marqueur"></div>',
    iconSize: [20, 20], // Taille de l'élément
    iconAnchor: [10, 10], // Point d'ancrage central
  });

  // données pour la vue
  protected chargement: WritableSignal<boolean> = signal(true);

  ngAfterViewInit(): void {
    this.initialiserCarte();
  }

  ngOnInit(): void {
    this.referentiel.sia().subscribe((enseignes) => {
      this.placerMarqueursEnseignes(enseignes);
      this.chargement.set(false);
    });
  }

  private initialiserCarte(): void {
    // 1. Définir les frontières géographiques de la France métropolitaine (Sud-Ouest et Nord-Est)
    const france = L.latLngBounds(
      L.latLng(41.3, -5.5), // Coin Sud-Ouest (proche de la frontière espagnole / océan)
      L.latLng(51.1, 10.0), // Coin Nord-Est (proche des frontières allemandes / belges)
    );

    // 2. Initialiser la carte avec les restrictions
    this.carte = L.map(this.conteneurCarte.nativeElement, {
      center: [46.2276, 2.2137], // Centré sur la France
      zoom: 6, // Zoom initial idéal pour la France
      minZoom: 6, // Empêche de dézoomer pour voir le monde entier
      maxZoom: 18, // Limite de zoom maximal pour voir les rues
      maxBounds: france, // Bloque le déplacement hors de cette zone
      maxBoundsViscosity: 1.0, // Effet "mur de briques" : rebondit immédiatement si on glisse hors de la zone
    });

    // 3. Charger le fond de carte OpenStreetMap (avec option pour éviter les duplications)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      noWrap: true, // Empêche la carte de se répéter indéfiniment à l'horizontale
      bounds: france, // Optimise le chargement en ne demandant que les tuiles de cette zone
    }).addTo(this.carte);

    this.groupeMarqueurs.addTo(this.carte);
  }

  public placerMarqueursEnseignes(enseignes: Enseigne[]): void {
    this.groupeMarqueurs.clearLayers();
    if (this.carte) {
      enseignes.forEach((enseigne) => {
        L.marker([enseigne.latitude, enseigne.longitude], {
          icon: CarteEnseignes.iconeMarqueur,
        })
          .addTo(this.carte)
          .on('click', () => {
            this.outputEnseigneSelectionnee.emit(enseigne);
          })
          .addTo(this.groupeMarqueurs)
          .bindTooltip(enseigne.etablissement, {
            permanent: true,
            offset: [10, 0],
            interactive: true,
          });
      });
    }
  }
}
