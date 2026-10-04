# Charge 6.0 — nouvelle interface

Interface refaite de zéro (le moteur de données, la synchro Google et les calculs sont conservés, tes données aussi).
- **4 onglets** : Accueil, Progrès, Nutrition, Moi.
- **Accueil** : la séance du jour et un bouton « Commencer ». En dessous, la semaine et la dernière séance.
- **Séance** : un exercice à la fois. Objectif du jour en grand, boutons − / + pour la charge et les répétitions, « Valider la série ». Le repos démarre seul, puis l’appli passe à la série ou à l’exercice suivant. Pastilles numérotées pour changer d’exercice, « Remplacer » si la machine est prise, « Options » pour échauffement, série dégressive, disques et mouvement.
- **Progrès** : chiffres du mois, derniers records, tes exercices (courbe au toucher), historique. Bilan du mois, records, trophées et bibliothèque rangés dans « Plus ».
- **Moi** : profil, corps (poids, mensurations, photos, récupération), réglages, programme, sauvegarde et Google.
- **Premier lancement** : un seul écran, choisir un programme et commencer.
- Style clair et net, une couleur d’accent, police du téléphone (plus de téléchargement de police), mode sombre automatique.

# Charge 5.3 (revue par 5 IA spécialisées, chaque remarque vérifiée)

- **Synchro** : les suppressions (aliments, pesées, programmes, exercices, repas types, objectifs) ne reviennent plus ; un objectif refixé ou un programme réappliqué n’est plus effacé par un autre appareil ; une modification d’aliment n’est plus perdue pendant une synchro.
- **Sécurité** : les identifiants d’un fichier importé ou du Drive sont contrôlés (pas d’injection de code).
- **Séance** : une séance oubliée d’un autre jour est validée automatiquement à la première série du jour ; un exercice ajouté reprend ses séries et répétitions du programme ou de la dernière fois ; en superset, le focus va sur le bon exercice ; la fiche reprend la valeur tapée dans le carnet ; la fiche reste utilisable après un échauffement ; le repos peut se réduire en pastille (« Voir le carnet ») ; l’écran reste allumé au retour dans l’appli.
- **Corriger une ancienne série** respecte la mesure avec laquelle elle a été notée.
- **Nutrition** : plancher calorique (jamais sous le métabolisme de repos ni 1 200 kcal femme / 1 500 kcal homme), déficit de sèche limité à 20 %, ajustement limité à ±500 kcal, vitesse de poids jugée en % du poids (Helms et al., 2014).
- **Programmes** : Full body B gagne un soulevé de terre roumain ; Force 5 × 5 passe Intermédiaire avec développé militaire barre ; « Fessiers à la maison » remplace le nordic curl par un soulevé de terre roumain haltères ; indices corrigés (tirage vertical, gainage, marche du fermier).
- **Design** : contrastes corrigés en mode sombre (coche verte, bouton rouge, ligne en cours) et clair (tags, bordures des champs) ; cibles tactiles à 44 px ; textes à 13 px minimum ; le message du bas n’est plus caché par la barre d’erreur.

# Charge 5.1

## Nouveau
- **Côté femme : fessiers et cuisses** (page Programme) : Fessiers débutante (3 j), Fessiers & cuisses (4 j), Bas du corps 3 jours, Fessiers à la maison (haltères). Conseillé au premier lancement si « Femme » est choisi.
- **Se connecter avec Google** (Profil) : les données sont enregistrées dans le Google Drive de l’utilisateur, dans le dossier caché réservé à l’appli (droit `drive.appdata` : Charge ne voit aucun autre fichier). Synchro automatique pendant l’heure qui suit la connexion, puis bouton « Synchroniser ». Même fusion que la synchro entre appareils (versions, suppressions définitives).
- Le service worker ne met plus en cache les réponses d’autres sites (Google), sauf polices et lecteur de codes-barres.
- Comparaison des copies insensible à l’ordre des champs (évite des envois en double).

### Activer la connexion Google (une fois)
1. https://console.cloud.google.com → créer un projet « Charge ».
2. « API et services » → Bibliothèque → activer **Google Drive API**.
3. « Écran de consentement OAuth » → Externe → nom « Charge », ton e-mail → ajouter le champ d’application `.../auth/drive.appdata` → en mode « Test », ajouter les adresses Gmail autorisées.
4. « Identifiants » → Créer → **ID client OAuth** → type « Application Web » → Origines JavaScript autorisées : l’adresse du site (ex. `https://charge.pages.dev`).
5. Copier l’ID (`….apps.googleusercontent.com`) dans `GCLIENT` (src/2-core.js) puis `node build.js` — ou le coller dans Profil sur chaque appareil.

# Charge 5.0

Sources dans `src/`, site prêt à déployer dans `site/` (`node build.js` recompile `site/index.html`).
Déploiement Cloudflare Pages : envoyer le contenu de `site/` (ou le zip `charge-cloudflare-5.0.zip`).

## Design : « carnet de fonte »
- Papier quadrillé clair, encre bleu-noir, surligneur jaune sur ce qu’il faut soulever maintenant, rouge pour records et échecs, vert pour les séries faites. Mode sombre automatique.
- Une seule police (Archivo) utilisée sur toute sa largeur : large et grasse pour les titres, étroite pour les chiffres.
- La séance est un tableau : une ligne par série, charge et répétitions préremplies, une touche pour valider. Le ressenti se donne pendant le repos.
- Accueil réduit à la séance ; niveau et XP déplacés dans Progrès et Profil.
- Premier lancement : « Commencer une séance » tout de suite ; le profil peut attendre (Nutrition le demande).

## Corrections (audit de la 4.3)
- **Bloquant corrigé** : l’unité d’un exercice (`unit`) n’utilise plus le champ de date de modification (`u`). Migration v5 qui répare les données abîmées. Un écran qui plante affiche un message et un bouton d’export, jamais une page vide.
- **Historique figé** : chaque série garde sa mesure (`lt`, `un`). Changer le type ou l’unité d’un exercice ne réécrit plus volumes, records ni XP.
- **Doublons** : un exercice n’apparaît qu’une fois par séance.
- **Progression** : la charge de travail est la plus lourde de la dernière fois ; montée, rampe et séries allégées n’empêchent plus de monter.
- **Sauvegardes honnêtes** : un message ne dit « copie gardée » qu’après vérification. Effacement et import refusés si la copie échoue, sauf choix explicite « sans copie ».
- **Données illisibles** : écran de récupération, rien n’est écrit tant que tu n’as pas choisi (télécharger le brut, restaurer une copie, importer, repartir de zéro).
- **Synchro** : versions par enregistrement ; une suppression gagne sur toute version qu’elle a vue, sans expiration (plus de séries qui reviennent). Les séances ouvertes sur deux appareils ne sont plus fermées d’office : le conflit est affiché. Verrou d’écriture court et relecture après écriture pour le compte Claude. Fusion entre onglets enregistrée.
- **Stockage** : `navigator.storage.persist()` demandé ; date du dernier export visible ; rappel d’export après 3 séances ; invitation à installer sur l’écran d’accueil (Safari efface sinon après 7 jours sans visite).
- **Clavier iPhone** : chaque ligne a son bouton de validation ; les feuilles suivent la zone visible quand le clavier est ouvert.
- **XP** : 50 par séance, +30 par exercice en record (3 au plus), +100 pour la séance qui atteint l’objectif de la semaine. Plus de part liée au tonnage.
- **Récup** : plus de rouge ni d’échéance inventée ; seulement les muscles travaillés ces 3 derniers jours.
- **Nutrition** : sources et limites de l’estimation affichées (Mifflin-St Jeor 1990, protéines 1,6–2,2 g/kg).
- **Hors ligne** (`sw.js`) : la page est gardée sous `./` seulement (redirection Cloudflare), toutes les écritures du cache sont attendues.

## Testé
Chromium, 390 × 844, mode clair et sombre : parcours complet (premier lancement, séance, repos, bilan, victoire, tous les onglets), migration de données 4.3 abîmées, changement d’unité après des séries, données illisibles, fusion avec horloge décalée, suppression ancienne, deux séances ouvertes, pyramide.
Non testé : Safari et iPhone réels, synchro avec un vrai compte Claude.
