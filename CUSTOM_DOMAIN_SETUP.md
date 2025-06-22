# Configuration du Domaine Personnalisé

## Domaine configuré : tennis-angles.the-thought-experimenter.com

### Configuration DNS sur Hostinger

1. **Connectez-vous** à votre panneau Hostinger
2. **Domaines** → Gérer `the-thought-experimenter.com`
3. **Zone DNS** → Ajouter un enregistrement CNAME :
   - **Type** : CNAME
   - **Nom** : `tennis-angles`
   - **Valeur** : `cname.vercel-dns.com`
   - **TTL** : 14400

### Configuration sur Vercel

1. **Dashboard Vercel** → Votre projet
2. **Settings** → **Domains**
3. **Add Domain** : `tennis-angles.the-thought-experimenter.com`
4. **Vérification automatique** de la configuration DNS

### Variables d'environnement

Ajoutez dans Vercel (Settings → Environment Variables) :

```
NEXT_PUBLIC_SITE_URL=https://tennis-angles.the-thought-experimenter.com
```

### Fichiers mis à jour

- ✅ `app/sitemap.ts` - URLs mises à jour avec le nouveau domaine
- ✅ `app/robots.ts` - Sitemap URL mise à jour

### Temps de propagation

- **DNS** : 5-30 minutes (peut aller jusqu'à 24h)
- **SSL** : Automatique via Vercel (quelques minutes après DNS)

### Vérification

Une fois configuré, vérifiez :

- [ ] `https://tennis-angles.the-thought-experimenter.com` accessible
- [ ] `https://tennis-angles.the-thought-experimenter.com/sitemap.xml` fonctionne
- [ ] `https://tennis-angles.the-thought-experimenter.com/robots.txt` fonctionne
- [ ] Certificat SSL actif (cadenas vert)

### Redirection automatique

Vercel redirigera automatiquement :

- `tennis-angle-theory.vercel.app` → `tennis-angles.the-thought-experimenter.com`

### SEO et indexation

Après la configuration :

1. **Google Search Console** : Ajouter la nouvelle propriété
2. **Soumettre le nouveau sitemap**
3. **Demander la réindexation** des pages importantes

### Avantages du nouveau domaine

- ✅ **Crédibilité** : Domaine professionnel
- ✅ **Mémorisation** : Plus facile à retenir
- ✅ **Branding** : Cohérent avec votre marque
- ✅ **SEO** : Meilleur pour le référencement
- ✅ **Partage** : Plus professionnel dans les liens

### Rollback si nécessaire

Si problème, vous pouvez :

1. Supprimer le domaine personnalisé sur Vercel
2. Revenir temporairement à `tennis-angle-theory.vercel.app`
3. Corriger la configuration DNS
4. Reconfigurer le domaine personnalisé
