# Budget — conception

Site de gestion de budget mensuel : pour chaque mois, un budgété vs un réel.

## Décisions techniques

- Front : React + Vite (TypeScript), dossier `front/`.
- BFF : Node + Express (TypeScript), dossier `back/`. Il sert aussi le front buildé (un seul processus, un seul port).
- Stockage : fichier JSON côté BFF (`back/data/budget.json`). Aucun SAR nécessaire.
- Devise : euro, format français (1 234,50 €), saisie avec virgule ou point acceptée.
- Design : inspiré du fichier Numbers « October » (« Monthly Budget »), un seul thème (pas de mode clair/sombre) :
  - fond blanc, bandeau de titre bleu marine ;
  - un bandeau de couleur par section : Ressources bleu marine, Charges fixes orange, Charges variables violet, Épargne vert foncé, Récap bleu marine ;
  - en-têtes de colonnes bleu clair, lignes de total sur fond vert clair ;
  - montants saisis (budgété, réel) en bleu ;
  - vert si on est dans le budget, rouge si on le dépasse.

## Features

### 1. Navigation par mois
- Sélecteur de mois en haut de page (← mois année →).
- À la création d'un mois, les **libellés et les montants budgétés** du mois précédent sont repris ; le réel repart à 0.
- Le premier mois (aucun mois précédent) s'ouvre vide.
- Contrainte : après création, les données de chaque mois sont indépendantes (modifier un mois ne change pas les autres).

### 2. Page unique
- Pas de tabs : toutes les sections sont affichées l'une sous l'autre sur une seule page, qu'on fait défiler.
- Ordre : Ressources · Charges fixes · Charges variables · Épargne · Récap.

### 3. Tableau d'une section (Ressources, Charges fixes, Charges variables, Épargne)
Colonnes : Libellé · Budgété (€) · Réel (€) · Différence (€) · % utilisé · Notes · actions (calculatrice, supprimer).
- Bouton « + » sous le tableau : ajoute une ligne ; l'utilisateur saisit le libellé (ex. « Cadeaux »), puis le budgété (ex. 50), puis le réel au fil du mois.
- Libellé, budgété, réel et notes sont modifiables en ligne.
- Suppression d'une ligne avec confirmation.
- Différence = budgété − réel.
- % utilisé = réel / budgété (« - » si budgété = 0).
- Ligne **Total** en bas de chaque section : somme du budgété, du réel, de la différence, et % global.
- Couleurs (lignes et totaux) :
  - Charges et Épargne : % et différence en **vert** si réel ≤ budgété, en **rouge** si réel > budgété.
  - Ressources : vert si réel ≥ budgété (on a reçu au moins le prévu), rouge sinon.

### 4. Mini-calculatrice « ajouter au réel »
- Sur chaque ligne, un bouton ouvre un petit encadré (bordure violette épaisse, sans ombre), bien espacé du tableau.
- Boutons : « Valider » en vert, « Annuler » en rouge.
- L'utilisateur tape un montant (ex. 40,01) ou une expression simple (ex. 12+8,5) ; l'aperçu affiche : ancien réel + montant = nouveau réel (ex. 20,39 + 40,01 = 60,40).
- Valider ajoute le montant au réel existant ; annuler ne change rien.
- Opérations acceptées : + et − ; décimales avec virgule ou point. Entrée invalide : message et pas de modification.
- Arrondi à 2 décimales (calcul en centimes pour éviter les erreurs de flottants).

### 5. Section Récap (en bas de page)
- Une ligne par section (Total ressources, Total charges fixes, Total charges variables, Total épargne) avec budgété et réel.
- Dernière ligne : **Solde net** = Ressources − (Charges fixes + Charges variables + Épargne), en budgété et en réel ; et **%** = dépenses totales / ressources.
- Solde négatif en rouge, positif en vert.
- Section en lecture seule (calculée).

### 6. Persistance
- Chaque modification est enregistrée via le BFF (API REST) dans le fichier JSON.
- API : `GET /api/months/:yyyy-mm`, `PUT /api/months/:yyyy-mm`.
- Contrainte : un seul utilisateur, pas d'authentification (usage local).

## Hors périmètre (pour l'instant)
Authentification, multi-utilisateurs, export, graphiques, catégories prédéfinies.

## Déploiement local
- Port fixe : **4100** (http://localhost:4100).
- Le BFF sert le front buildé : un seul processus Node.
- Construire : `./build.sh` · Lancer : `./start.sh` · Arrêter : `./stop.sh`.
- Données : `back/data/budget.json` (non versionné). Logs : `budget.log`.
- Développement : `cd back && npm run dev` puis `cd front && npm run dev` (Vite redirige `/api` vers le port 4100).
- Tests : `cd back && npm test` et `cd front && npm test`.
