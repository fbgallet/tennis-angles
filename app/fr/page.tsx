import Link from "next/link";
import VisitCounter from "../components/VisitCounter";
import LanguageSwitcher from "../components/LanguageSwitcher";
import styles from "../page.module.css";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://tennis-angle-theory.vercel.app/#webapp",
      name: "Visualiseur de la Théorie des Angles au Tennis",
      description:
        "Visualiseur interactif de positionnement sur court de tennis basé sur la théorie des angles de René Cochet",
      url: "https://tennis-angle-theory.vercel.app/fr",
      applicationCategory: "SportsApplication",
      operatingSystem: "Web Browser",
      author: {
        "@type": "Person",
        name: "Fabrice Gallet",
        sameAs: [
          "https://twitter.com/fabricegallet",
          "https://github.com/fabricegallet",
        ],
      },
      about: {
        "@type": "Thing",
        name: "Théorie des Angles au Tennis",
        description:
          "Théorie stratégique de positionnement au tennis développée par René Cochet",
      },
    },
    {
      "@type": "Article",
      "@id": "https://tennis-angle-theory.vercel.app/fr#article",
      headline:
        "Théorie des Angles au Tennis : Maîtrisez le Positionnement sur Court avec la Stratégie de René Cochet",
      description:
        "Apprenez les principes scientifiques derrière le positionnement optimal sur court de tennis en utilisant la théorie des angles éprouvée de René Cochet et des outils de visualisation interactifs.",
      author: {
        "@type": "Person",
        name: "Fabrice Gallet",
        sameAs: [
          "https://twitter.com/fabricegallet",
          "https://github.com/fabricegallet",
        ],
      },
      publisher: {
        "@type": "Person",
        name: "Fabrice Gallet",
      },
      datePublished: "2024-01-01",
      dateModified: "2024-01-01",
      mainEntityOfPage: "https://tennis-angle-theory.vercel.app/fr",
      about: [
        {
          "@type": "Thing",
          name: "Stratégie Tennis",
          description:
            "Approches stratégiques du jeu et du positionnement au tennis",
        },
        {
          "@type": "Thing",
          name: "Jeu de Jambes Tennis",
          description: "Techniques de mouvement et de positionnement au tennis",
        },
        {
          "@type": "Thing",
          name: "Science du Sport",
          description:
            "Analyse scientifique de la performance athlétique et de la stratégie",
        },
      ],
      citation: {
        "@type": "ScholarlyArticle",
        name: "Henri Cochet's theory of angles in tennis (1933) reveals a new facet of anticipation",
        url: "https://www.nature.com/articles/s41598-024-53136-7",
        publisher: {
          "@type": "Organization",
          name: "Nature",
        },
      },
    },
    {
      "@type": "Person",
      "@id": "https://tennis-angle-theory.vercel.app/fr#person",
      name: "René Cochet",
      description:
        "Joueur de tennis et stratège français qui a développé la théorie des angles au tennis",
      knowsAbout: [
        "Stratégie Tennis",
        "Positionnement Court",
        "Tactiques Tennis",
      ],
    },
    {
      "@type": "HowTo",
      "@id": "https://tennis-angle-theory.vercel.app/fr#howto",
      name: "Comment Utiliser la Théorie des Angles au Tennis pour un Meilleur Positionnement sur Court",
      description:
        "Guide étape par étape pour implémenter la théorie des angles de René Cochet pour un positionnement optimal sur court de tennis",
      step: [
        {
          "@type": "HowToStep",
          name: "Identifier les Angles de Frappe de l'Adversaire",
          text: "Observez la position de votre adversaire et identifiez ses deux angles de frappe les plus extrêmes possibles",
        },
        {
          "@type": "HowToStep",
          name: "Calculer la Bissectrice d'Angle",
          text: "Trouvez la bissectrice d'angle entre les deux possibilités de frappe extrêmes",
        },
        {
          "@type": "HowToStep",
          name: "Se Positionner sur la Bissectrice",
          text: "Déplacez-vous pour vous positionner sur la ligne de bissectrice d'angle pour une couverture optimale du court",
        },
      ],
      totalTime: "PT5M",
    },
  ],
};

export default function FrenchHome() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LanguageSwitcher currentLang="fr" />
      <main className={styles.main}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.title}>Théorie des Angles au Tennis</h1>
            <p className={styles.subtitle}>par René Cochet</p>
          </header>

          <section className={styles.content}>
            <div className={styles.theory}>
              <h2>Comprendre la Théorie des Angles</h2>
              <p>
                La Théorie des Angles au Tennis de René Cochet est un concept
                stratégique fondamental qui a révolutionné le positionnement et
                la sélection des coups au tennis. La théorie démontre que la
                position optimale sur le court est déterminée par la bissectrice
                des angles des coups possibles de votre adversaire.
              </p>

              <div className={styles.keyPoints}>
                <h3>Principes Clés :</h3>
                <ul>
                  <li>
                    <strong>Positionnement sur la Bissectrice :</strong>{" "}
                    Positionnez-vous sur la bissectrice des deux coups les plus
                    extrêmes possibles de votre adversaire pour minimiser la
                    couverture du court.
                  </li>
                  <li>
                    <strong>Stratégie de Distance Égale :</strong> En vous
                    positionnant sur la bissectrice, vous assurez une distance
                    égale pour défendre contre les coups croisés et les coups le
                    long de la ligne.
                  </li>
                  <li>
                    <strong>Géométrie du Court :</strong> Comprendre les angles
                    du court vous permet d'anticiper et de réagir plus
                    efficacement aux coups de votre adversaire.
                  </li>
                </ul>
              </div>

              <div className={styles.importance}>
                <h3>Pourquoi C'est Important :</h3>
                <p>
                  Un positionnement approprié basé sur la théorie des angles
                  peut considérablement améliorer vos capacités défensives et
                  votre couverture du court. Au lieu de deviner où votre
                  adversaire va frapper, vous vous positionnez mathématiquement
                  pour avoir la meilleure chance d'atteindre n'importe quel coup
                  dans sa gamme de possibilités.
                </p>
              </div>

              <div className={styles.evidence}>
                <h3>Théorie Basée sur des Preuves :</h3>
                <p>
                  La Théorie des Angles au Tennis n'est pas seulement
                  théorique—elle est soutenue par la recherche scientifique. Des
                  études récentes ont validé les principes mathématiques
                  derrière le positionnement optimal du court et les stratégies
                  défensives au tennis. Dans cette étude impliquant 23 joueurs
                  professionnels parmi les meilleurs au monde, il "semble que
                  plus les joueurs sont expérimentés, plus leur application de
                  cette stratégie devient précise."
                </p>
                <p>
                  <a
                    href="https://www.nature.com/articles/s41598-024-53136-7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.researchLink}
                  >
                    Lire "Henri Cochet's theory of angles in tennis (1933)
                    reveals a new facet of anticipation" publié dans Nature en
                    février 2024 →
                  </a>
                </p>
              </div>
            </div>

            <div className={styles.cta}>
              <h3>Expérimentez la Théorie</h3>
              <p>
                Utilisez notre visualiseur interactif pour voir la théorie des
                angles en action. Positionnez les joueurs, ajustez les angles de
                frappe et découvrez le positionnement optimal du court.
              </p>
              <Link href="/fr/visualizer" className={styles.button}>
                Lancer le Visualiseur
              </Link>
            </div>

            <div className={styles.developer}>
              <h3>À Propos du Développeur</h3>
              <p>
                Ce visualiseur interactif de la théorie des angles au tennis a
                été développé par <strong>Fabrice Gallet</strong>, passionné par
                la combinaison de la science du sport et de la technologie
                interactive.
              </p>
              <div className={styles.developerLinks}>
                <a
                  href="https://twitter.com/fbgallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  Suivre sur X →
                </a>
                <a
                  href="https://github.com/fbgallet/tennis-angles"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  Voir le dépôt sur GitHub →
                </a>
                <a
                  href="https://buymeacoffee.com/fbgallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  Soutenez mon travail, offrez-moi un café ☕
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
      <VisitCounter />
    </>
  );
}
