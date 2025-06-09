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
      name: "Tennis Angle Theory Visualizer",
      description:
        "Interactive tennis court positioning visualizer based on René Cochet's angle theory",
      url: "https://tennis-angle-theory.vercel.app/en",
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
        name: "Tennis Angle Theory",
        description:
          "Strategic tennis positioning theory developed by René Cochet",
      },
    },
    {
      "@type": "Article",
      "@id": "https://tennis-angle-theory.vercel.app/en#article",
      headline:
        "Tennis Angle Theory: Master Court Positioning with René Cochet's Strategy",
      description:
        "Learn the scientific principles behind optimal tennis court positioning using René Cochet's proven angle theory and interactive visualization tools.",
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
      mainEntityOfPage: "https://tennis-angle-theory.vercel.app/en",
      about: [
        {
          "@type": "Thing",
          name: "Tennis Strategy",
          description:
            "Strategic approaches to tennis gameplay and positioning",
        },
        {
          "@type": "Thing",
          name: "Tennis Footwork",
          description: "Movement and positioning techniques in tennis",
        },
        {
          "@type": "Thing",
          name: "Sports Science",
          description:
            "Scientific analysis of athletic performance and strategy",
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
      "@id": "https://tennis-angle-theory.vercel.app/en#person",
      name: "René Cochet",
      description:
        "French tennis player and strategist who developed the tennis angle theory",
      knowsAbout: ["Tennis Strategy", "Court Positioning", "Tennis Tactics"],
    },
    {
      "@type": "HowTo",
      "@id": "https://tennis-angle-theory.vercel.app/en#howto",
      name: "How to Use Tennis Angle Theory for Better Court Positioning",
      description:
        "Step-by-step guide to implementing René Cochet's angle theory for optimal tennis court positioning",
      step: [
        {
          "@type": "HowToStep",
          name: "Identify Opponent's Shot Angles",
          text: "Observe your opponent's position and identify their two most extreme possible shot angles",
        },
        {
          "@type": "HowToStep",
          name: "Calculate Angle Bisector",
          text: "Find the angle bisector between the two extreme shot possibilities",
        },
        {
          "@type": "HowToStep",
          name: "Position on Bisector",
          text: "Move to position yourself on the angle bisector line for optimal court coverage",
        },
      ],
      totalTime: "PT5M",
    },
  ],
};

export default function EnglishHome() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LanguageSwitcher currentLang="en" />
      <main className={styles.main}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.title}>Tennis Angle Theory</h1>
            <p className={styles.subtitle}>by René Cochet</p>
          </header>

          <section className={styles.content}>
            <div className={styles.theory}>
              <h2>Understanding the Angle Theory</h2>
              <p>
                René Cochet's Tennis Angle Theory is a fundamental strategic
                concept that revolutionized tennis positioning and shot
                selection. The theory demonstrates that the optimal position on
                the court is determined by the angle bisector of your opponent's
                possible shots.
              </p>

              <div className={styles.keyPoints}>
                <h3>Key Principles:</h3>
                <ul>
                  <li>
                    <strong>Angle Bisector Positioning:</strong> Position
                    yourself on the angle bisector of your opponent's two most
                    extreme possible shots to minimize court coverage.
                  </li>
                  <li>
                    <strong>Equal Distance Strategy:</strong> By positioning on
                    the bisector, you ensure equal distance to defend against
                    both cross-court and down-the-line shots.
                  </li>
                  <li>
                    <strong>Court Geometry:</strong> Understanding court angles
                    allows you to anticipate and react more efficiently to your
                    opponent's shots.
                  </li>
                </ul>
              </div>

              <div className={styles.importance}>
                <h3>Why It Matters:</h3>
                <p>
                  Proper positioning based on angle theory can dramatically
                  improve your defensive capabilities and court coverage.
                  Instead of guessing where your opponent will hit, you position
                  yourself mathematically to have the best chance of reaching
                  any shot within their range of possibilities.
                </p>
              </div>

              <div className={styles.evidence}>
                <h3>Evidence-Based Theory:</h3>
                <p>
                  The Tennis Angle Theory is not just theoretical—it's backed by
                  scientific research. Recent studies have validated the
                  mathematical principles behind optimal court positioning and
                  defensive strategies in tennis. In this study involving 23
                  professional players among the world's best, it "appears that
                  the more experienced the players are, the more precise their
                  application of this strategy becomes."
                </p>
                <p>
                  <a
                    href="https://www.nature.com/articles/s41598-024-53136-7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.researchLink}
                  >
                    Read "Henri Cochet's theory of angles in tennis (1933)
                    reveals a new facet of anticipation" published in Nature on
                    February 2024 →
                  </a>
                </p>
              </div>
            </div>

            <div className={styles.cta}>
              <h3>Experience the Theory</h3>
              <p>
                Use our interactive visualizer to see the angle theory in
                action. Position players, adjust shot angles, and discover the
                optimal court positioning.
              </p>
              <Link href="/en/visualizer" className={styles.button}>
                Launch Visualizer
              </Link>
            </div>

            <div className={styles.developer}>
              <h3>About the Developer</h3>
              <p>
                This interactive tennis angle theory visualizer was developed by{" "}
                <strong>Fabrice Gallet</strong>, passionate about combining
                sports science with interactive technology.
              </p>
              <div className={styles.developerLinks}>
                <a
                  href="https://twitter.com/fbgallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  Follow on X →
                </a>
                <a
                  href="https://github.com/fbgallet/tennis-angles"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  View repo on GitHub →
                </a>
                <a
                  href="https://buymeacoffee.com/fbgallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  Support my work, buy me a coffee ☕
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
