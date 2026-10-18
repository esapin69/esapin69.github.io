# Univers Coaching — fondations Supabase, itération 18/10/2026

Ce document décrit ce qui existe **réellement**, pas une promesse de fonctionnalités futures.

## Projet sélectionné

- Supabase existant **Univers Creatif** (`gjgpcrnmzktnhtbbvmle`, région eu-west-3), dans l'organisation Pro déjà active.
- **Aucune modification du projet GHE** (`yzsrmuxghlengnkyphxj`) ni des tables `creative_*` et `chatgpt_pilot`.
- Isolation fonctionnelle : trois tables `public.coach_profiles`, `public.coach_plan_versions`, `public.coach_events`, sans clé étrangère vers les tables créatives. Les comptes Auth partagent néanmoins le projet Supabase et son service d'authentification : ce n'est pas une instance physique indépendante.
- Migrations déjà appliquées : `coach_isolated_auth_history_foundation`, `coach_user_data_purge_and_privacy`.
- Aucune nouvelle instance, branche Supabase, fonction Edge, clé privée ou service payant n'a été créée.

## Sécurité côté stockage

Chaque ligne est associée à `user_id` provenant d'un utilisateur `auth.users`. RLS activée et politiques `auth.uid() = user_id` pour les opérations autorisées. Rôle `anon` sans privilèges de table ; client limité à la clé publishable (jamais `service_role`).
- Profils : lecture, création, mise à jour et suppression propriétaire.
- Plans : lecture/création propriétaire ; historique des versions non modifiable par le client.
- Événements : lecture/création propriétaire, journal append-only en usage courant ; suppression uniquement pour la purge volontaire.
- RPC `public.coach_purge_own_data()` exécute transactionnellement la suppression des seules données Coaching de la personne connectée. **Ne supprime pas son identité Auth**.

Les contrôles préalables et postérieurs du linter sécurité ont conservé les alertes préexistantes sur les autres univers, **aucune nouvelle alerte Coaching**.

## Interface préparée sur branche distincte (non publiée)

- `coaching/coach-vivant.html` : accueil de coaching, compte e-mail/mot de passe, journal libre, temps et contraintes, séance, bilan, pesée facultative, export/import local, suppression explicite.
- `coaching/coach-vivant.css` : interface mobile à cartes.
- `coaching/coach-vivant.js` : Auth Supabase via API publique, chargement du compte, sauvegarde des préférences, plans versionnés, événements, listes, sauvegarde locale temporaire, synchronisation/reprise, calendrier `.ics`.
- `coaching/index.html` : nouveau bouton, anciens parcours préservés.

**Sécurité d'usage** : la connexion et la synchronisation entre deux téléphones n'ont pas encore fait l'objet d'un essai réel avec des comptes distincts. Aucun utilisateur n'a été créé lors de cette préparation. La mise en ligne exige validation et tests avant la communication comme service fiable.

## Nature de l'adaptation actuelle

L'utilisateur peut écrire autant de contexte libre qu'il le souhaite, conserver l'historique, signaler les retours importants, et modifier ses contraintes. Le moteur actuel peut proposer une durée plus courte, une séance allégée, la prudence en cas de gêne ou une progression après des séances faciles.

**Il ne comprend pas encore automatiquement une infinité de contraintes rédigées en langage naturel.** Il faut une couche conversationnelle avec raisonnement, validation de sécurité et gestion des coûts d'inférence pour aller au-delà des signaux explicitement sélectionnés.

## Calendrier

Export standard `.ics` contenant les exercices, séries, répétitions, récupérations, échauffement, retour au calme, lien web, date et rappel avant séance.
L'import `.ics` **ne garantit pas une mise à jour automatique** si une séance est déplacée. Aucun accès agenda ni notification push autonome n'a été activé.

## Limitations avant disponibilité publique

1. Vérifier deux comptes réels, séparation RLS, confirmation d'e-mail, renouvellement et révocation des sessions.
2. Vérifier la restauration complète après déconnexion puis connexion sur un autre appareil, y compris événements en attente et restauration de sauvegarde.
3. Ajouter une vraie couche conversationnelle sur serveur avec accès contrôlé aux seuls événements autorisés par le propriétaire, pas de clé privée navigateur, consentement et validation des conseils.
4. Ajouter un suivi des contraintes contradictoires et une clarification ciblée plutôt qu'une interprétation arbitraire.
5. Rappels proactifs avec mécanisme de consentement, opt-out, limitation, horaires calmes.
6. Synchronisation native bidirectionnelle des calendriers seulement avec OAuth/consentement et contrôle des quotas.
7. Vérifier le RGPD, la confidentialité et la suppression complète de l'identité Auth lorsque nécessaire.
8. Vérifier les coûts variables Supabase lorsque les quotas inclus sont atteints ; projet Pro existant ne signifie pas coût incrémental garanti nul sur des années.

## Gouvernance

Conserver les versions existantes et les PR ouvertes sans publication automatique. Aucune activation de dépenses ou usage d'un nouveau service payant sans estimation en euros et consentement explicite. Préserver le module Full Body, le programme guidé et le site GHE.
