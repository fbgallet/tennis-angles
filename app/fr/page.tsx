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
            <h1 className={styles.title}>
              <span className={styles.protractorIcon}>🎾</span>
              Théorie des Angles au Tennis
            </h1>
            <p className={styles.subtitle}>
              <span className={styles.compassIcon}>📐 </span>
              Maîtrisez le Positionnement avec la Précision Mathématique
              <span className={styles.setSquareIcon}> ✅</span>
            </p>
          </header>

          <section className={styles.content}>
            <div className={styles.mobileImageShowcase}>
              <h3>Visualisation Interactive</h3>
              <Link href="/fr/visualizer" className={styles.imageContainer}>
                <img
                  src="/angle-theory-example.png"
                  alt="Exemple de la théorie des angles au tennis - Visualisation interactive montrant le positionnement optimal sur court"
                  className={styles.exampleImage}
                />
                <div className={styles.imageOverlay}>
                  <span>🎾 Cliquez pour essayer le simulateur 🎾</span>
                </div>
              </Link>
              <p className={styles.imageCaption}>
                Découvrez comment la théorie des angles fonctionne en pratique
                avec notre simulateur interactif.
                <span className={styles.tennisIcon}>🎯</span>
                Positionnez les joueurs et observez le positionnement optimal en
                temps réel.
              </p>
            </div>

            <div className={styles.theory}>
              <h2>Comprendre la Théorie des Angles</h2>
              <p>
                La Théorie des Angles de René Cochet est un concept stratégique
                fondamental pour optimiser son positionnement et la sélection
                des coups au tennis. Elle offre une méthode simple et efficace
                pour se repositionner après chaque coup en s'appuyant sur des
                principes géométriques au lieu de se fier à une anticipation
                hasardeuse des intentions de son adversaire.
              </p>

              <div className={styles.keyPoints}>
                <h3>Principes Clés :</h3>
                <ul>
                  <li>
                    <strong>Positionnement sur la Bissectrice :</strong>{" "}
                    Positionnez-vous sur la bissectrice des deux meilleurs coups
                    possibles de votre adversaire pour minimiser la couverture
                    du court, quelque soit le prochain coup de votre adversaire.
                  </li>
                  <li>
                    <strong>Stratégie de défence active :</strong> En vous
                    positionnant sur la bissectrice, vous assurez une distance
                    égale pour défendre contre les coups croisés et les coups le
                    long de la ligne, évitant ainsi de laisser une trop grande
                    ouverture à votre adversaire sur l'un des côtés.
                  </li>
                  <li>
                    <strong>Simplicité :</strong> En pratique, il suffit de se
                    positionner proche du centre du court, côté opposé à
                    l'adversaire lorsqu'on joue en fond de court, du même côté
                    que l'adversaire lorsqu'on est proche du filet.
                  </li>
                </ul>
              </div>

              <div className={styles.importance}>
                <h3>Pourquoi c'est important :</h3>
                <p>
                  Un positionnement approprié basé sur la théorie des angles
                  peut considérablement améliorer vos capacités défensives et
                  votre couverture du terrain. Vous augmentez vos chances
                  d'atteindre n'importe quel coup de l'adversaire et vous
                  délestez votre esprit de suppositions sur les intentions de
                  l'adversaire, pour concentrer votre attention sur ce qui est
                  réellement sous vos yeux.
                </p>
                <p>
                  Mieux encore, vous savez où vous replacer pour votre coup
                  suivant dès que votre intention pour le coup précédent est
                  claire. Vous avez ainsi le contrôle pour minimiser vos
                  replacements et économiser vos forces pour les coups décisifs.
                </p>
              </div>

              <div className={styles.evidence}>
                <h3>Une théorie fondée scientifiquement :</h3>
                <p>
                  La Théorie des Angles n'est pas seulement une hypothèse
                  géométrique, elle est validée par la recherche scientifique.
                  Une étude récente publiée dans la revue Nature a permis
                  d'établir que parmis plusieurs stratégies de positionnement
                  possibles, c'est bien la Théorie des Angles qui décrit le
                  mieux le positionnement des meilleurs joueurs. Dans cette
                  étude impliquant 23 joueurs professionnels dont les meilleurs
                  mondiaux, il apparaît "que plus les joueurs sont expérimentés,
                  plus leur application de cette stratégie devient précise."
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

            <div className={styles.imageShowcase}>
              <h3>Visualisation Interactive</h3>
              <Link href="/fr/visualizer" className={styles.imageContainer}>
                <img
                  src="/angle-theory-example.png"
                  alt="Exemple de la théorie des angles au tennis - Visualisation interactive montrant le positionnement optimal sur court"
                  className={styles.exampleImage}
                />
                <div className={styles.imageOverlay}>
                  <span>🎾 Cliquez pour essayer le simulateur 🎾</span>
                </div>
              </Link>
              <p className={styles.imageCaption}>
                Découvrez comment la théorie des angles fonctionne en pratique
                avec notre simulateur interactif.
                <span className={styles.tennisIcon}>🎯</span>
                Positionnez les joueurs et observez le positionnement optimal en
                temps réel.
              </p>
            </div>

            <div className={styles.cta}>
              <h3>Expérimentez la Théorie</h3>
              <p>
                Utilisez notre simulateur interactif pour voir la théorie des
                angles en action. Positionnez les joueurs, ajustez les angles de
                frappe et découvrez le positionnement optimal du court.
              </p>
              <Link href="/fr/visualizer" className={styles.button}>
                Lancer le simulateur d'angles
              </Link>
            </div>

            <div className={styles.developer}>
              <h3>À Propos du Développeur</h3>
              <p>
                Ce simulateur interactif de la théorie des angles a été
                développé par <strong>Fabrice Gallet</strong>, développeur
                fullstack React/Typescript/Next.js, amateur de théories qui
                changent la vie en pratique !
              </p>
              <div className={styles.developerLinks}>
                <a
                  href="https://buymeacoffee.com/fbgallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  Soutenez mon travail, offrez-moi un café ☕
                </a>
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
              </div>
            </div>
          </section>
        </div>
      </main>
      <VisitCounter />
    </>
  );
}
