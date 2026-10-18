# Coach hybride : formulaire dynamique + agent facultatif, budget fermé

## Objectif

Rendre le questionnaire progressif et sensible au contexte, avec une première couche de décision locale sans appel IA. Les comptes et l'historique restent dans le projet Supabase déjà utilisé par Univers Coaching, avec les règles RLS par utilisateur.

## Livré dans cette modification

- Bibliothèque autonome coach-questions.js, sans requête réseau, SDK IA ni jeton privé.
- Une seule question à l'écran ; les questions déjà posées ne reviennent pas inutilement.
- Questions déclenchées par des événements : gêne déclarée, manque de temps/séance manquée, difficulté.
- Choix conservés dans profile.intake, enregistrés localement et dans coach_profiles.preferences si la personne est connectée.
- Compatibilité avec le suivi existant, dont les séances cochées sont préservées.
- Réponses facultatives : report de sept jours, profil librement modifiable.
- Historique des questions contextuelles borné pour limiter le stockage.

## Agent : rôle futur et règle de moindre privilège

Le bot Telegram personnel existant n'est pas un agent multi-utilisateurs Coaching. Ne pas lui donner les identités des sportifs, la clé service-role ou l'accès à toutes les lignes Coaching.

Si un agent devient disponible :
1. Un serveur de coaching distinct vérifie l'utilisateur connecté, son consentement et le périmètre des données.
2. Le moteur local tente d'abord de régler les cas courants gratuitement.
3. Les cas ambigus peuvent éventuellement solliciter un modèle IA, uniquement après consentement et validation d'un budget.
4. Budget par défaut = 0 euro, donc aucun appel IA payant possible ; restrictions côté serveur à prévoir pour les coûts variables.
5. En cas de service indisponible, le moteur local reste fonctionnel. Aucune publication publique, modification de calendrier externe ou accès à la santé sans autorisation adaptée.

Un coût d'IA nul ne garantit pas un coût total nul si les quotas du forfait existant sont dépassés.

## Limites

Pas encore de compréhension sémantique générale du texte libre, de recherche web automatique, d'agent autonome, de notifications push, ni de synchronisation native bidirectionnelle. Aucun modèle payant, service Render ni instance Supabase supplémentaire ne sont créés par cette PR.

## Non-régression

Garder intacts GHE, Vercel, le projet Stip.eSapin, les tables créatives, la séance Full Body et le programme guidé existants.
