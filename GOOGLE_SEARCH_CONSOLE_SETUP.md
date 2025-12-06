# Configuration Google Search Console

## Problème rencontré

Google Search Console demande un enregistrement CNAME de vérification **en plus** de celui pour Vercel.

## Solution : Ajouter DEUX enregistrements CNAME

### Sur Hostinger (Zone DNS)

Vous devez ajouter **2 enregistrements CNAME** :

#### 1. Pour Vercel (redirection du site)

- **Type** : CNAME
- **Nom** : `tennis-angles`
- **Valeur** : `cname.vercel-dns.com`
- **TTL** : 14400

#### 2. Pour Google Search Console (vérification)

- **Type** : CNAME
- **Nom** : `tfywdibjmorw` (celui donné par Google)
- **Valeur** : `gv-o7fxqhxwzpn6lx.dv.googlehosted.com` (celui donné par Google)
- **TTL** : 14400

## Étapes détaillées

### 1. Configuration DNS sur Hostinger

1. **Connectez-vous** à votre panneau Hostinger
2. **Domaines** → Gérer `the-thought-experimenter.com`
3. **Zone DNS** → **Ajouter un enregistrement**

**Premier enregistrement (Vercel) :**

```
Type: CNAME
Nom: tennis-angles
Valeur: cname.vercel-dns.com
TTL: 14400
```

**Deuxième enregistrement (Google) :**

```
Type: CNAME
Nom: tfywdibjmorw
Valeur: gv-o7fxqhxwzpn6lx.dv.googlehosted.com
TTL: 14400
```

### 2. Attendre la propagation DNS

- **Temps d'attente** : 5-30 minutes (peut aller jusqu'à 24h)
- **Vérification** : Utilisez un outil comme `nslookup` ou `dig`

### 3. Valider sur Google Search Console

1. **Retournez** sur Google Search Console
2. **Cliquez** sur "Valider"
3. **Attendez** la confirmation

### 4. Configuration Vercel

Une fois le DNS propagé :

1. **Dashboard Vercel** → Votre projet
2. **Settings** → **Domains**
3. **Add Domain** : `tennis-angles.the-thought-experimenter.com`

## Vérification des enregistrements DNS

### Commandes de vérification

```bash
# Vérifier l'enregistrement Vercel
nslookup tennis-angles.the-thought-experimenter.com

# Vérifier l'enregistrement Google
nslookup tfywdibjmorw.the-thought-experimenter.com
```

### Résultats attendus

**Pour Vercel :**

```
tennis-angles.the-thought-experimenter.com canonical name = cname.vercel-dns.com
```

**Pour Google :**

```
tfywdibjmorw.the-thought-experimenter.com canonical name = gv-o7fxqhxwzpn6lx.dv.googlehosted.com
```

## Troubleshooting

### Erreur "DNS record not found"

1. **Vérifiez** que les enregistrements sont bien ajoutés
2. **Attendez** plus longtemps (jusqu'à 24h)
3. **Contactez** le support Hostinger si nécessaire

### Erreur "Invalid CNAME"

1. **Vérifiez** l'orthographe exacte des valeurs
2. **Supprimez** et **recréez** l'enregistrement
3. **Assurez-vous** qu'il n'y a pas d'espaces en trop

### Google Search Console ne valide pas

1. **Attendez** 15-30 minutes après ajout DNS
2. **Réessayez** la validation
3. **Vérifiez** avec `nslookup` que l'enregistrement est visible

## Après validation réussie

### 1. Soumettre le sitemap

Dans Google Search Console :

1. **Sitemaps** → **Ajouter un nouveau sitemap**
2. **URL** : `https://tennis-angles.the-thought-experimenter.com/sitemap.xml`
3. **Envoyer**

### 2. Demander l'indexation

1. **Inspection d'URL** → Tapez votre URL principale
2. **Demander l'indexation** pour les pages importantes :
   - `https://tennis-angles.the-thought-experimenter.com`
   - `https://tennis-angles.the-thought-experimenter.com/visualizer`
   - `https://tennis-angles.the-thought-experimenter.com/en`
   - `https://tennis-angles.the-thought-experimenter.com/fr`

### 3. Configurer les alertes

1. **Paramètres** → **Utilisateurs et autorisations**
2. **Ajouter** votre email pour les notifications
3. **Activer** les alertes pour les erreurs d'indexation

## Résumé des enregistrements DNS finaux

Votre zone DNS devrait contenir :

```
tennis-angles.the-thought-experimenter.com    CNAME    cname.vercel-dns.com
tfywdibjmorw.the-thought-experimenter.com     CNAME    gv-o7fxqhxwzpn6lx.dv.googlehosted.com
```

## Temps d'attente typiques

- **Propagation DNS** : 5-30 minutes
- **Validation Google** : Immédiate après propagation
- **Configuration Vercel** : 2-5 minutes
- **Première indexation** : 1-7 jours
- **Données Search Console** : 24-48h

Une fois ces étapes terminées, votre site sera accessible via le domaine personnalisé ET indexable par Google !
