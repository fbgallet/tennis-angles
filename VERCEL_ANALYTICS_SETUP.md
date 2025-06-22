# Vercel Analytics Configuration

## Packages installés

- ✅ `@vercel/analytics` - Analytics de base pour le suivi des visiteurs
- ✅ `@vercel/speed-insights` - Métriques de performance détaillées

## Configuration

### Layout principal (`app/layout.tsx`)

```tsx
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

## Fonctionnalités activées

### Vercel Analytics

- **Pages vues** : Suivi automatique de toutes les pages
- **Visiteurs uniques** : Comptage des utilisateurs distincts
- **Sources de trafic** : D'où viennent vos visiteurs
- **Géolocalisation** : Pays et régions des visiteurs
- **Appareils** : Desktop vs mobile
- **Navigateurs** : Chrome, Safari, Firefox, etc.

### Vercel Speed Insights

- **Core Web Vitals** : LCP, FID, CLS
- **Performance Score** : Note globale de performance
- **Temps de chargement** : Métriques détaillées
- **Optimisations suggérées** : Recommandations automatiques

## Accès aux données

### Dashboard Vercel

1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Onglet **Analytics** pour les statistiques de trafic
4. Onglet **Speed Insights** pour les métriques de performance

### Données disponibles

- **Temps réel** : Visiteurs actuels
- **Historique** : Données sur 30 jours (gratuit) ou plus (payant)
- **Filtres** : Par page, pays, appareil, etc.
- **Exports** : Données exportables en CSV

## Respect de la vie privée

### Conformité RGPD

- ✅ **Pas de cookies** : Analytics sans cookies
- ✅ **Données anonymisées** : Pas d'identification personnelle
- ✅ **Conformité automatique** : Respect des réglementations européennes
- ✅ **Opt-out possible** : Les utilisateurs peuvent désactiver

### Configuration privacy-friendly

```tsx
// Si vous voulez plus de contrôle sur la privacy
<Analytics mode="production" debug={false} />
```

## Métriques personnalisées (optionnel)

### Événements personnalisés

```tsx
import { track } from "@vercel/analytics";

// Exemple : Suivi d'interactions spécifiques
const handleVisualizerUse = () => {
  track("visualizer_used", {
    court_type: "clay",
    language: "fr",
  });
};
```

### Conversion tracking

```tsx
import { track } from "@vercel/analytics";

// Exemple : Suivi des objectifs
const handleGoalComplete = () => {
  track("goal_complete", {
    goal_type: "tutorial_finished",
  });
};
```

## Optimisations automatiques

### Avec Speed Insights

- **Détection automatique** des problèmes de performance
- **Suggestions d'optimisation** dans le dashboard
- **Monitoring continu** des Core Web Vitals
- **Alertes** en cas de dégradation

### Métriques surveillées

- **LCP** (Largest Contentful Paint) : Temps de chargement du contenu principal
- **FID** (First Input Delay) : Réactivité aux interactions
- **CLS** (Cumulative Layout Shift) : Stabilité visuelle
- **TTFB** (Time to First Byte) : Temps de réponse serveur

## Coûts

### Plan gratuit Vercel

- ✅ **Analytics de base** : Inclus
- ✅ **Speed Insights** : Inclus
- ✅ **30 jours d'historique** : Inclus
- ✅ **Jusqu'à 100k événements/mois** : Inclus

### Limites du plan gratuit

- Historique limité à 30 jours
- Pas d'exports avancés
- Pas de segments personnalisés

## Alternatives complémentaires

### Google Analytics 4 (optionnel)

Si vous voulez des analyses plus poussées :

```bash
npm install @next/third-parties
```

### Plausible Analytics (optionnel)

Alternative privacy-first :

```bash
npm install next-plausible
```

## Monitoring et alertes

### Dashboard Vercel

- **Alertes automatiques** : Baisse de performance
- **Rapports hebdomadaires** : Résumé par email
- **Comparaisons** : Évolution dans le temps

### Intégration Slack/Discord (Pro)

- Notifications en temps réel
- Alertes de performance
- Rapports automatiques

## Troubleshooting

### Analytics ne fonctionne pas

1. Vérifier que le site est déployé sur Vercel
2. Attendre 24h pour les premières données
3. Vérifier la console pour les erreurs

### Speed Insights manquants

1. S'assurer que `@vercel/speed-insights` est installé
2. Vérifier l'import dans le layout
3. Tester sur la version de production

## Prochaines étapes

1. **Déployer** les changements sur Vercel
2. **Attendre 24h** pour les premières données
3. **Configurer des alertes** dans le dashboard
4. **Analyser les métriques** régulièrement
5. **Optimiser** basé sur les insights

## Ressources

- [Documentation Vercel Analytics](https://vercel.com/docs/analytics)
- [Guide Speed Insights](https://vercel.com/docs/speed-insights)
- [Core Web Vitals](https://web.dev/vitals/)
