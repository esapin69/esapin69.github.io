# Univers Coaching — Vision vivante du coach longitudinal

> **Document vivant** — 18 octobre 2026. Ce document sauvegarde l'intention produit et sert de garde-fou aux développements à venir. Il n'autorise pas une publication, une dépense ou un branchement de service. Les nouvelles idées s'y ajoutent avec historique ; les règles validées ne sont pas remplacées implicitement.

## 1. Promesse fondamentale

**Ce n'est ni un catalogue d'exercices, ni un générateur jetable de programmes.** C'est une relation de coaching individualisée, conversationnelle et progressive, susceptible de durer des années.

Le coach découvre la personne progressivement et sans formulaire interminable ; il propose, fait choisir, explique, planifie, relance avec consentement, observe les progrès réels, détecte les contraintes et ajuste. Il connaît les séances *réellement effectuées* plutôt que seulement les séances prévues. Les objectifs évoluent ; l'historique reste accessible. Une personne se connecte à SON compte et retrouve SON parcours, y compris en changeant de téléphone. Un coach peut accompagner plusieurs personnes avec séparation stricte des données.

Les propositions ne sont pas figées. **L'adaptation est le produit**, pas une option. L'expérience doit rester aussi simple, visuelle et interactive que les cartes Full Body déjà appréciées.

## 2. Boucle de coaching continue

1. **Découverte progressive** : prénom ou pseudonyme, objectifs, expérience, environnement et matériel, créneaux, contraintes pratiques, mouvement apprécié ou refusé, préférences et consentement aux rappels. Ne demander un détail supplémentaire que lorsqu'il devient nécessaire ; ne pas exiger des données sensibles inutiles.
2. **Objectifs à étapes** : le coach propose une prochaine étape mesurable, raisonnable et révisable, avec date de réévaluation. L'utilisateur peut la modifier, la refuser ou demander une autre option.
3. **Programme proposé** : semaines, séances, variantes et temps de récupération dérivés de l'état actuel, de la fatigue et des séances précédentes ; pas de promesse de résultats ni de progression forcée.
4. **Planning réel** : calendrier interne et ajout au calendrier natif ; préférence d'horaires et jours à éviter, respect des repos, événements déplacés sans pertes de données. Avant changement important, proposer une modification explicite.
5. **Pendant la séance** : cartes accessibles, consignes techniques, séries cochées, répétitions et charges réellement faites, difficulté ressentie, douleur éventuelle, pauses, remplacement d'exercice et bouton abandon/interruption. Les données réelles sont distinguées du programme prévu.
6. **Après la séance** : retour rapide (effort perçu, plaisir, difficulté, éventuelle douleur, temps réel, réussite partielle ou totale). Félicitations précises sur les actions ; pas de flatterie automatique.
7. **Entre les séances** : rappels seulement si autorisés et utiles ; relance sans harcèlement en cas de séance non confirmée, opportunité de replanifier ou alléger, récapitulatif hebdomadaire.
8. **Évolution du physique en parallèle** : pesée volontaire, tendances avec contexte, mensurations/photos facultatives et privées, ressenti, récupération et capacités physiques. Pas de jugement sur une pesée isolée ; ne pas confondre variation de poids et succès/échec.
9. **Revue périodique** : adaptation du planning, des exercices, de la charge, de la durée, de la fréquence et des objectifs à partir de *plusieurs observations*, des choix de la personne et de sa disponibilité.
10. **Long terme** : historique consultable, changements de contraintes ou de lieu, périodes d'arrêt, reprise prudente, sauvegardes et portabilité.

## 3. Posture du coach

- **Bienveillant et exigeant** : célébrer la constance et l'effort documenté ; demander des comptes sur des engagements librement choisis. Énoncer clairement les écarts, les raisons possibles et l'action suivante, sans honte, humiliation ni sanction physique.
- **Pas de pénalité sur le poids, l'apparence, les limitations physiques, la maladie ou un jour de repos.** Une « pénalité » acceptable relève uniquement de la transparence du suivi (statut « non effectué », objectif à reprogrammer, conséquence sur la projection), jamais d'un entraînement de rattrapage excessif, d'une restriction alimentaire ou de privation de fonctionnalités.
- **Sécurité et consentement** : conserver des limites raisonnables, signaler les mouvements douloureux, recommander un professionnel de santé lorsque nécessaire, ne pas diagnostiquer. Pour des publics vulnérables, éviter les objectifs de poids prescriptifs et les injonctions.
- **Franchise** : savoir dire « on n'a pas assez d'informations pour augmenter la difficulté ». Aucune adaptation présentée comme scientifiquement établie sans base.
- **Autonomie** : l'utilisateur peut modifier un objectif, changer de séance, désactiver les rappels, prendre une pause, exporter/supprimer son compte et contrôler ce qui est partagé avec son coach.

## 4. Interface à préserver

Les composants validés restent des invariants : cartes élégantes et lisibles sur mobile, lieu maison/salle, niveau, exercices adaptés, nombre de séries dynamique, cases à cocher par série, conseils techniques dépliables, progression et écran de fin. Le module Full Body existant reste accessible en permanence. Toute évolution passe des contrôles de non-régression.

**Vue d'accueil cible** (illustration fonctionnelle, pas données réelles) :

- « Bonjour — prochain rendez-vous : séance haut du corps demain à 18 h »
- **Aujourd'hui** : séance prévue / en cours / terminée / récup ; bouton principal unique et évident.
- **Ma semaine** : calendrier, séances confirmées, à déplacer, effectuées ; couleur et statut compréhensibles.
- **Mon évolution** : force, constance, temps consacré, poids facultatif et tendances plutôt qu'une seule donnée.
- **Le coach te propose** : une seule décision importante à la fois (« Garder jeudi ou déplacer au vendredi ? »).
- **Mes réglages / mon profil** : objectifs, contraintes, notifications, export et confidentialité.

Pas de questionnaire exhaustif d'un coup, pas de perte de scroll, pas de boutons inactifs, pas de doublons de navigation.

## 5. Modèle de données durable (schéma conceptuel)

| Domaine | Informations essentielles | Règles |
| --- | --- | --- |
| Accounts | identifiant stable, méthode de connexion, préférences, langue | session sûre ; récupération ; plusieurs personnes séparées |
| Coach memberships | relation coach ↔ élève, rôles, périmètre | aucune exposition de données inter-comptes |
| Profiles | objectifs évolutifs, niveau, contraintes, matériel, temps | préférences modifiables, historique des changements |
| Goals | étape, critère, date de revue, statut, version | objectifs jamais immuables |
| Plans | version, période, justification, auteur, date d'effet | garder les versions précédentes |
| Sessions | date, état, lien au plan, identité calendrier | prévu / confirmé / en cours / partiel / terminé / reporté / annulé |
| Exercise prescriptions | exercice, séries, répétitions, variantes, consignes | prévoir ≠ réaliser |
| Exercise logs | fait, charge, répétitions, RPE/effort, douleur facultative | conserver l'observation, jamais la recalculer silencieusement |
| Measurements | pesées datées, unités, provenance, notes | privées, saisie facultative, tendances contextualisées |
| Check-ins | réponses courtes, énergie, sommeil facultatif, objectifs | respect du choix de ne pas répondre |
| Calendar links | UID stable, révision, source, créneau, synchronisation | éviter les doublons, traiter les échecs de mise à jour |
| Notifications | type, consentement, canal, fréquence, état envoi | horaires calmes, anti-spam, opt-out |
| Audit & backups | événements, versions, export, suppression | sauvegardes testées, restauration ; traçabilité |

Aucune donnée personnelle, de santé, de pesée ni jeton dans un dépôt GitHub public ou dans le code client partagé.

## 6. Intégration du calendrier du téléphone

- **Version initiale** : pour chaque séance, un ajout via fichier standard `.ics` avec titre, date/fuseau, rappel et **descriptif complet** : échauffement, exercices, séries, répétitions ou durée, récupération et lien profond vers la séance.
- La simple importation `.ics` **n'assure pas une synchronisation bidirectionnelle**. Afficher cette limite et ne pas présenter un import comme un rendez-vous automatiquement mis à jour.
- **Version synchronisée** : une intégration consentie au fournisseur du calendrier via OAuth/API adaptée, avec mise à jour, déplacements, annulation et résolution de conflits. Avant chaque écriture importante dans le calendrier de l'utilisateur, demander une validation adaptée à l'autorisation accordée.
- Les changements du plan n'écrasent pas les performances passées. Un nouvel événement doit porter UID et version durables ; vérifier les doublons.

## 7. Notifications & suivi proactif

- Demander le consentement pour chaque canal (push web/téléphone, courriel, rappel calendrier).
- Préférences : fréquence, horaires calmes, jours non travaillés, types d'alertes, pause temporaire.
- Exemples : séance à venir, séance non confirmée, revue hebdomadaire, pesée *si souhaitée*, objectif arrivé à revue.
- Pas de notifications automatiques fiables sur la seule page HTML statique : il faut persistance serveur, ordonnanceur, autorisations et mécanisme push conforme aux contraintes Android/iOS.
- Notifications idempotentes avec protection anti-spam et historique d'envoi ; permettre « plus tard », « changer l'horaire », « pause » et « ne plus me rappeler ».

## 8. Moteur de décision adaptatif

Le moteur part des **observations** et du consentement, pas d'une programmation éternelle.

**Entrées** : séances accomplies ou non ; charge, répétitions, effort perçu ; douleur et fatigue si renseignées ; contraintes de temps ; préférences ; indicateurs physiques volontaires, notamment poids ; réactions aux propositions ; chronologie des décisions.

**Sorties proposées** : conserver/adapter volume, exercice, charge, fréquence, durée, horaires, prochaine étape et intensité des rappels. Chaque proposition affiche une raison compréhensible et peut être acceptée, modifiée ou rejetée.

Règles premières :
- Difficulté modérée + mouvement maîtrisé répété → progression légère proposée.
- Difficulté excessive ou douleur → pas d'augmentation automatique ; simplification ou arrêt du mouvement concerné.
- Plusieurs séances manquées → demander ce qui bloque, réduire ou replanifier ; **aucune séance punitive de rattrapage**.
- Semaine contrainte → programme allégé accepté, sans casser la progression à long terme.
- Variation de poids isolée → ne pas modifier automatiquement entraînement, alimentation ou objectifs ; regarder les tendances seulement si la personne souhaite ce suivi.
- Reprise après une longue pause → revoir le point de départ avec l'utilisateur.
- Données manquantes → question courte ciblée, pas d'interprétation arbitraire.
- Toute recommandation significative versionnée et justifiée ; audit de la décision.

L'IA conversationnelle, si activée plus tard, peut expliquer, apprendre les préférences et proposer des changements, mais les règles de sécurité, permissions et validation ne dépendent pas uniquement d'un modèle de langage.

## 9. Architecture réaliste et coûts

**Existant** : GitHub Pages héberge les pages, le questionnaire calcule des séances côté navigateur et sauvegarde en `localStorage`. C'est un prototype **mono-navigateur**, non une plateforme de comptes durable.

**À construire pour une vraie relation sur des années** :
1. Authentification sûre (inscription, reconnexion, récupération, séparation des comptes).
2. Base durable côté serveur avec droits d'accès utilisateur, chiffrement approprié, sauvegardes/restaurations et export.
3. Moteur de planning et de suivi versionné côté serveur.
4. Calendrier interne ; export `.ics` puis connecteurs calendrier à consentement.
5. Service de rappels sécurisé et fiable, avec gestion des consentements.
6. Mesures physiques privées, historisation, tableaux de tendances.
7. Moteur d'adaptation explicable et évolution éventuelle vers une conversation IA.
8. Tests de sécurité, charge, compatibilité téléphone, accessibilité et retours utilisateurs.

Choisir si possible une infrastructure déjà disponible et gratuite dans les limites vérifiées ; **aucun service payant / quota supplémentaire / consommation de crédits sans estimation en euros et accord explicite**. Ne pas modifier GHE, Vercel, Supabase ou d'autres projets par défaut.

## 10. Confidentialité, consentement et pérennité

Données potentiellement sensibles (poids, habitudes, limitations) : collecter le minimum, expliquer la finalité, demander consentement approprié, prévoir suppression/export/portabilité et règles d'accès strictes, vérifier les obligations RGPD applicables avant ouverture à des utilisateurs tiers. Ne jamais publier les mesures ni les journaux personnels.

« Indestructible » est un objectif de robustesse, pas une garantie absolue : comptes récupérables, sauvegardes chiffrées, restauration régulièrement testée, historique versionné, exports réutilisables et fonctionnement dégradé hors connexion.

## 11. Jalons sans perte de la vision

- **Jalon A — fondations** : compte individuel, base durable et migration facultative depuis `localStorage`, profils séparés, historique ; garder la page Full Body.
- **Jalon B — calendrier & exécution** : calendrier interne, ajout `.ics` descriptif complet, journal réellement effectué, dates et statuts fiables.
- **Jalon C — continuité active** : check-ins, rappels opt-in, report facile, ajustements fondés sur les réponses.
- **Jalon D — progression physique** : pesées et tendances opt-in ; étapes d'objectifs évolutives, réévaluations.
- **Jalon E — vrai coach long terme** : mémoire structurée, propositions explicables, dialogue naturel, apprentissage des préférences, relation coach-élève et calendrier bidirectionnel si autorisé.

Ce découpage est uniquement une **séquence technique**, pas une réduction du projet. Les futurs concepts se greffent sans faire disparaître les intentions consignées ici.

## 12. Critères de recette non négociables

1. Deux comptes sur le même téléphone ne voient **jamais** les données de l'autre.
2. Déconnexion/reconnexion sur un autre téléphone restaure l'historique autorisé.
3. Une séance reportée conserve ce qui a déjà été fait et ne crée aucun événement fantôme.
4. Le calendrier importé contient tous les exercices, séries, répétitions, pauses, échauffement et lien vers la séance.
5. Trois absences n'engendrent ni humiliation, ni punition, ni surcharge de rattrapage ; la proposition s'ajuste.
6. Un poids manquant ne bloque ni séance ni programme et n'entraîne aucune inférence de santé.
7. L'utilisateur peut désactiver les rappels et exporter/supprimer les données.
8. La séance Full Body existante reste strictement fonctionnelle.
9. Aucun nouveau coût ni publication sans validation.
10. Chaque évolution conserve le présent document et enregistre ce qui a changé.

## 13. Idées à intégrer ensuite

Ajouter toutes les nouvelles idées de l'utilisateur avec date et exemple concret. Aucune idée n'est supprimée seulement parce qu'elle n'appartient pas au jalon courant. Quand deux idées se contredisent, faire arbitrer et conserver l'historique des décisions.
