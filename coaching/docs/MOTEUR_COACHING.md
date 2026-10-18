# Moteur central Univers Coaching — version locale évolutive

## Fonctionnement

**Univers Coaching est autonome par rapport aux autres projets.** Aucun lien avec le bot Telegram personnel, le projet GHE, Render ou les tables créatives n'est nécessaire. Le navigateur charge `coach-brain.js` et le formulaire `coach-questions.js`; les règles locales consultent uniquement le profil, l'historique des séances, les événements journalisés, le calendrier interne et les pesées facultatives du compte connecté.

À chaque ouverture/réaffichage, le moteur :
1. Relit les données précédemment consenties et réellement enregistrées.
2. Calcule un état actuel explicable, dont l'historique des 7 et 28 derniers jours.
3. Priorise la prudence en cas de douleur déclarée, puis les rendez-vous passés non confirmés, la difficulté, les contraintes, les bilans d'étape et les questions utiles.
4. Montre **une action prioritaire et sa provenance**, sans prétendre tout savoir.
5. L'utilisateur décide : répondre, enregistrer un bilan réel, replanifier, confirmer une première étape de sept jours, différer d'un jour une proposition non liée à la sécurité.
6. Les versions des objectifs et les décisions acceptées sont enregistrées au sein des données Coaching existantes (profil, événements de type `goal` et `schedule`), dans un compte isolé par les permissions Supabase déjà présentes.

La synthèse ne déduit pas qu'un rendez-vous passé est manqué : elle sollicite une confirmation. L'historique distingue ce qui était prévu de ce qui a été fait.

## Cadre de sécurité

- **0 € de coût d'IA** : aucun SDK, appel LLM ni service serveur ajouté. Aucune dépense ni nouveau Supabase.
- Aucun accès automatique au calendrier natif : l'export `.ics` existant reste volontaire, sans synchronisation bidirectionnelle.
- Aucun push autonome. Les « rappels » décrits dans l'écran sont affichés seulement lors de l'utilisation du site.
- La pesée est optionnelle ; les invitations périodiques sont désactivées par défaut, puis uniquement réactivables par l'utilisateur.
- Éléments sensibles : signalement de douleur = prudence, non diagnostic ; pas de pénalité d'entraînement, de régime ou de jugement du corps.
- Mémoire privée, avec RLS propriétaire des tables Coaching. Ne jamais réutiliser un secret de service ou la mémoire d'un autre projet.
- Toute modification significative d'objectif passe par une confirmation. Pas d'agent agissant en arrière-plan à l'insu de l'utilisateur.
- Aucune interprétation libre fiable des textes non catégorisés n'est revendiquée.

## Prochaines étapes non livrées par cette version

1. Tests réels des inscriptions, reconnexions, récupération multi-appareils et permissions.
2. Mémoire structurée enrichie, contradictions et sous-objectifs finement individualisés.
3. Recherche externe autorisée, avec sources vérifiées, consentement, provenance et coûts plafonnés.
4. Rappels réels seulement si un mécanisme disponible peut être activé sans frais supplémentaires, avec désactivation possible.
5. Réconciliation réelle avec calendriers connectés, si consentie.
6. Moteur conversationnel avancé, uniquement après validation d'un coût maximal et de l'isolation serveur.

Le présent livrable est le **premier moteur explicite et utilisable de suivi**, pas un entraîneur IA autonome complet sur plusieurs années.
