# Budget

Site local de gestion de budget mensuel : pour chaque mois, on compare le **budgété** et le **réel**.

## Fonctionnalités

- **Navigation par mois** (← Octobre 2026 →). Un nouveau mois reprend les libellés et les montants budgétés du mois précédent ; le réel repart à 0.
- **Une seule page** avec cinq sections : Ressources, Charges fixes, Charges variables, Épargne et Récap.
- **Tableaux modifiables** : libellé, budgété, réel et notes. Ajout d'une ligne avec « + », suppression avec confirmation.
- **Indicateurs** : différence, % utilisé et ligne de total par section, en vert dans le budget et en rouge au-dessus (pour les ressources, c'est l'inverse).
- **Calculatrice** par ligne : tape `40,01` ou `12+8,5` et le montant s'ajoute au réel existant (20,39 + 40,01 = 60,40).
- **Récap** : totaux par section, solde net (ressources − charges − épargne) et part des ressources utilisée.
- **Enregistrement automatique** à chaque modification.

## Stack

| Partie | Technologie |
| --- | --- |
| Front (`front/`) | React + Vite, TypeScript |
| BFF (`back/`) | Node + Express, TypeScript |
| Stockage | Fichier JSON local (`back/data/budget.json`) |

```
navigateur ──► BFF Express :4100 ──► back/data/budget.json
               ├─ sert le front buildé (front/dist)
               ├─ GET /api/months/AAAA-MM
               └─ PUT /api/months/AAAA-MM
```

Les montants sont stockés en centimes (entiers) pour éviter les erreurs d'arrondi.

## Prérequis

- Node.js 20.19 ou plus récent (exigé par Vite), et npm

## Lancer l'app

```bash
./build.sh   # installe les dépendances et construit front + back
./start.sh   # lance l'app en arrière-plan sur http://localhost:4100
./stop.sh    # arrête l'app
```

Après une modification du code, relance `./build.sh`, puis `./stop.sh && ./start.sh`.
Les logs sont écrits dans `budget.log`.

## Développement

```bash
cd back && npm run dev    # BFF avec rechargement automatique (port 4100)
cd front && npm run dev   # front Vite, les appels /api sont redirigés vers le BFF
```

Variables d'environnement du BFF (facultatives) :

- `PORT` : port d'écoute (par défaut `4100`)
- `BUDGET_DATA` : chemin du fichier de données (par défaut `back/data/budget.json`)

## Tests

```bash
cd back && npm test    # API : création, reprise du mois précédent, validation
cd front && npm test   # calculs, formats, calculatrice
```

## Données

Le budget est enregistré dans `back/data/budget.json`. Ce fichier est **ignoré par Git** : il reste uniquement sur ta machine et n'est jamais poussé sur GitHub. Pour le sauvegarder, copie-le ailleurs.

L'app n'a pas d'authentification : elle écoute seulement sur `127.0.0.1` et ne doit pas être exposée sur Internet.
