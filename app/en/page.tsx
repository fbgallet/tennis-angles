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
            <h1 className={styles.title}>
              <span className={styles.protractorIcon}>🎾</span> Tennis Angle
              Theory
            </h1>
            <p className={styles.subtitle}>
              <span className={styles.compassIcon}>📐 </span>
              Master Court Positioning with Mathematical Precision
              <span className={styles.setSquareIcon}> ✅</span>
            </p>
          </header>

          <section className={styles.content}>
            <div className={styles.mobileImageShowcase}>
              <h3>Interactive Visualization</h3>
              <Link href="/en/visualizer" className={styles.imageContainer}>
                <img
                  src="/angle-theory-example.png"
                  alt="Tennis angle theory example - Interactive visualization showing optimal court positioning"
                  className={styles.exampleImage}
                />
                <div className={styles.imageOverlay}>
                  <span>🎾 Click to try the visualizer 🎾</span>
                </div>
              </Link>
              <p className={styles.imageCaption}>
                Discover how angle theory works in practice with our interactive
                visualizer.
                <span className={styles.tennisIcon}>🎯</span>
                Position players and observe optimal positioning in real-time.
              </p>
            </div>

            <div className={styles.theory}>
              <h2>Understanding the Angle Theory</h2>
              <p>
                René Cochet's Tennis Angle Theory is a fundamental strategic
                concept that revolutionized tennis positioning and shot
                selection. It provides a simple and effective method to
                reposition after each move, relying on geometric principles
                instead of guessing the opponent's intentions.
              </p>

              <div className={styles.keyPoints}>
                <h3>Key Principles:</h3>
                <ul>
                  <li>
                    <strong>Angle Bisector Positioning:</strong> Position
                    yourself on the bisector of your opponent's two best
                    possible shots to minimize court coverage, no matter what
                    their next shot is.
                  </li>
                  <li>
                    <strong>Active defense strategy:</strong> By positioning
                    yourself on the bisector, you maintain an equal distance to
                    defend against cross shots and shots along the line, thus
                    preventing your opponent from having too much open space on
                    either side.
                  </li>
                  <li>
                    <strong>Simplicity:</strong> In practice, you just need to
                    position yourself near the center of the court, on the
                    opposite side from your opponent when playing at the
                    baseline, and on the same side as your opponent when you are
                    close to the net.
                  </li>
                </ul>
              </div>

              <div className={styles.importance}>
                <h3>Why It Matters:</h3>
                <p>
                  Proper positioning based on angle theory can greatly improve
                  your defensive skills and court coverage. It increases your
                  chances of reaching any opponent's shot and frees your mind
                  from guessing their intentions, allowing you to focus on
                  what's actually happening in front of you.
                </p>
                <p>
                  Even better, you know where to position yourself for your next
                  shot as soon as your intention for the previous shot is clear.
                  This way you have control to minimize your repositioning and
                  save your energy for the decisive shots.
                </p>
              </div>

              <div className={styles.evidence}>
                <h3>Evidence-Based Theory:</h3>
                <p>
                  The Tennis Angle Theory is not just theoretical, it's backed
                  by scientific research. A recent study published in the
                  journal Nature established that among several possible
                  positioning strategies, it is indeed Angle Theory that best
                  describes the positioning of top players. In this study
                  involving 23 professional players among the world's best, it
                  "appears that the more experienced the players are, the more
                  precise their application of this strategy becomes."
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

            <div className={styles.imageShowcase}>
              <h3>Interactive Visualization</h3>
              <Link href="/en/visualizer" className={styles.imageContainer}>
                <img
                  src="/angle-theory-example.png"
                  alt="Tennis angle theory example - Interactive visualization showing optimal court positioning"
                  className={styles.exampleImage}
                />
                <div className={styles.imageOverlay}>
                  <span>🎾 Click to try the visualizer 🎾</span>
                </div>
              </Link>
              <p className={styles.imageCaption}>
                Discover how angle theory works in practice with our interactive
                visualizer.
                <span className={styles.tennisIcon}>🎯</span>
                Position players and observe optimal positioning in real-time.
              </p>
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
                <strong>Fabrice Gallet</strong>, Fullstack developer
                specializing in React/TypeScript/Next.js, a fan of elegant
                theories that work well in practice!
              </p>
              <div className={styles.developerLinks}>
                <a
                  href="https://buymeacoffee.com/fbgallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  Support my work, buy me a coffee ☕
                </a>
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
              </div>
            </div>
          </section>
        </div>
      </main>
      <VisitCounter />
    </>
  );
}
