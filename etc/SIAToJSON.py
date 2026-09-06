import csv, re
from typing import Any

from pyproj import Transformer
from io import Reader, TextIOWrapper
import requests, json
import urllib.parse


class SIAToJSON:
    """Conversion du fichier csv listant les armuriers vers une structure JSON"""

    longLatFromWS: re.Pattern = re.compile(r"\"x\":\s*(\d+(\.\d+)?),\s*\"y\":\s*(\d+(\.\d+)?),", flags=re.MULTILINE)

    urlWSAdresse = "https://api-adresse.data.gouv.fr/search/?q="

    lambert93_to_wgs84 = Transformer.from_crs("EPSG:2154", "EPSG:4326", always_xy=True)

    def convert(self):
        with open('./json/sia2026.json', 'w', encoding="utf-8") as resultatJSONFile:
            resultatJSONFile.write('[')
            enseigneArmeBySiren = dict[str, Enseigne]([])
            with open('./data/reporting-fichier-armes.csv', 'r', encoding="utf-8") as siaCSVFile:
                siaCSVReader = csv.reader(siaCSVFile, delimiter=';', quotechar='"')
                next(siaCSVReader)
                self._convertSiaToDict(siaCSVReader, enseigneArmeBySiren)
            with open('./data/StockEtablissement_utf8.csv', 'r', encoding="utf-8") as etablissementCSVFile:
                etablissementCSVReader = csv.reader(etablissementCSVFile, delimiter=',', quotechar='"')
                next(etablissementCSVReader)
                sirenTrouves = self._convertSiaWithEtablissement(etablissementCSVReader, resultatJSONFile,
                                                                 enseigneArmeBySiren)
                self._analyserEnseignesIntrouvables(enseigneArmeBySiren, sirenTrouves)
            resultatJSONFile.write('\n]')

    def _convertSiaWithEtablissement(self, etablissementCSVReader, resultatJSONFile: TextIOWrapper,
                                     enseigneArmeBySiren: dict[str, Enseigne]) -> list[str]:
        firstRow = True
        sirenTrouves = list[str]()
        for row in etablissementCSVReader:
            siren = row[0]
            diffusion = row[3] == 'O'
            actif = row[45] == 'A'
            naf = row[50]
            nafRev2 = row[51] == 'NAFRev2'
            if (siren in enseigneArmeBySiren
                    and naf.startswith(('47', '25', '33', '93', '77', '45', '46'))
                    and diffusion and actif and nafRev2):
                numeroVoie = row[12]
                typeVoie = row[16]
                voie = row[17]
                commune = row[19]
                codePostal = row[18]
                enseigneArme = enseigneArmeBySiren[siren]
                etablissement = self._getEtablissement(row)

                if (enseigneArme.cp == codePostal or (etablissement and enseigneArme.enseigne == etablissement)):
                    coordonneeLambertAbscisse, coordonneeLambertOrdonnee = self._getMissingCoordonnees(
                        row[28], row[29], numeroVoie,
                        typeVoie, voie, codePostal, commune)

                    if (coordonneeLambertAbscisse and coordonneeLambertOrdonnee):
                        sirenTrouves.append(siren)
                        siret = row[2]
                        codeEffectif = row[5]
                        dateCreation = row[4]
                        etablissementSiege = row[9]
                        longitude, latitude = self.lambert93_to_wgs84.transform(coordonneeLambertAbscisse,
                                                                                coordonneeLambertOrdonnee)

                        etablissement = self._wrapEtablissement(enseigneArme, etablissement)

                        if (not firstRow):
                            resultatJSONFile.write(",")
                        firstRow = False
                        resultatJSONFile.write("\n  {\n"
                                               f'    "etablissement": "{etablissement}",\n'
                                               f'    "naf": "{naf.strip()}",\n'
                                               f'    "siret": "{siret.strip()}",\n'
                                               f'    "sia": "{enseigneArme.sia}",\n'
                                               f'    "codeEffectif": "{codeEffectif.strip()}",\n'
                                               f'    "dateCreation": "{dateCreation.strip()}",\n'
                                               f'    "etablissementSiege": {etablissementSiege},\n'
                                               f'    "numeroVoie": "{numeroVoie.strip()}",\n'
                                               f'    "typeVoie": "{typeVoie.strip()}",\n'
                                               f'    "voie": "{voie.strip()}",\n'
                                               f'    "codePostal": "{codePostal.strip()}",\n'
                                               f'    "commune": "{commune.strip()}",\n'
                                               f'    "longitude": {longitude},\n'
                                               f'    "latitude": {latitude}\n'
                                               "  }")
        return sirenTrouves

    def _getEtablissement(self, row) -> str:
        etablissement = row[46]
        if (not etablissement or etablissement == '[ND]'):
            etablissement = row[49]
        return self._cleanLibelle(etablissement)

    def _wrapEtablissement(self, enseigneArme: Enseigne, etablissement: str) -> str:
        if (etablissement and etablissement != '[ND]' and etablissement != enseigneArme.enseigne):
            etablissement = f'{enseigneArme.enseigne} ({etablissement})'
        else:
            etablissement = enseigneArme.enseigne
        return etablissement

    def _cleanLibelle(self, libelle) -> str:
        return re.sub(r'["\t\\]', ' ', libelle.strip())

    def _getMissingCoordonnees(self, coordonneeLambertAbscisse, coordonneeLambertOrdonnee,
                               numeroVoie, typeVoie, voie, codePostal, commune) -> tuple[Any, Any]:
        if (voie and codePostal and commune
                and (not coordonneeLambertAbscisse or not coordonneeLambertOrdonnee)):
            query = self.buildQuery(codePostal, commune, numeroVoie, typeVoie, voie)
            response = requests.get(self.urlWSAdresse + urllib.parse.quote(query)).content.decode('unicode_escape')
            try:
                matches = self.longLatFromWS.findall(response)
                match = matches[0]
                coordonneeLambertAbscisse = match[0]
                coordonneeLambertOrdonnee = match[2]
                print(f'{self.urlWSAdresse}{query} : {coordonneeLambertAbscisse}, {coordonneeLambertOrdonnee} ({response})')
            except IndexError:
                print(f'{self.urlWSAdresse}{query} : ERROR : {response}')
        return coordonneeLambertAbscisse, coordonneeLambertOrdonnee

    def buildQuery(self, codePostal, commune, numeroVoie, typeVoie, voie) -> str:
        query = ''
        if (numeroVoie):
            query += f'{numeroVoie}, '
        if (typeVoie):
            query += f'{typeVoie} '
        return query + f'{voie}, {codePostal} {commune}'

    def _convertSiaToDict(self, siaCSVReader, enseigneArmeBySiren: dict[str, Enseigne]):
        for row in siaCSVReader:
            cp = row[0]
            enseigne = row[1]
            sia = row[2]
            siren = row[3]
            if ((len(cp) < 4) or (len(siren) < 8)
                    or enseigne.startswith(('MAIRIE', 'COMMUNE', 'DECATHLON', 'GO SPORT', 'GAMM VERT', 'GAMMVERT', 'GAMM\'VERT', 'KOODZA', 'TERRES ET EAUX'))):
                print(f'Ligne rejetée : code postal = {cp}, siren = {siren}, sia = {sia}, enseigne = {enseigne}')
            else:
                cp = f'{cp:>{0}{5}}'
                enseigne = self._cleanLibelle(row[1])
                sia = row[2]
                siren = f'{row[3]:>{0}{9}}'
                enseigneArmeBySiren[siren] = Enseigne(cp, enseigne, sia, siren)

    def _analyserEnseignesIntrouvables(self, enseigneArmeBySiren: dict[str, Enseigne], sirenTrouves: list[str]):
        print('\nListe des enseignes d\'armement non retrouvées dans la liste des établissements :')
        for siren in enseigneArmeBySiren.keys():
            if (siren not in sirenTrouves):
                enseigneArme = enseigneArmeBySiren[siren]
                print(f'{enseigneArme.cp};{enseigneArme.sia};{enseigneArme.siren};{enseigneArme.enseigne}')


class Enseigne:
    def __init__(self, cp, enseigne, sia, siren):
        self.cp = cp
        self.enseigne = enseigne
        self.sia = sia
        self.siren = siren


SIAToJSON().convert()
