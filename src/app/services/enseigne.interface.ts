export interface Enseigne {
  etablissement: string;
  naf: string;
  siret: string;
  sia: string;
  codeEffectif: string;
  dateCreation: string; // date norme ISO 8601
  etablissementSiege: boolean;
  numeroVoie: string;
  typeVoie: string;
  voie: string;
  codePostal: string;
  commune: string;
  longitude: number;
  latitude: number;
  effectif?: string;
}
