export const translations = {
  en: {
    // BurgerMenu
    controls: "Controls",
    hideStats: "Hide stats",
    showStats: "Show stats",

    // CourtControls
    courtSettings: "Court Settings",
    orientation: "Orientation:",
    portrait: "Portrait",
    landscape: "Landscape",
    courtType: "Court type:",
    clay: "Clay",
    hard: "Hard",
    grass: "Grass",
    shotType: "Shot type:",
    flatAttack: "Flat attack forehand (110 km/h)",
    powerfulTopspin: "Powerful topspin forehand (95 km/h)",
    rallyTopspin: "Rally topspin (80 km/h)",
    defensiveSlice: "Defensive slice (60 km/h)",

    player1Display: "Player 1 Display",
    player2Display: "Player 2 Display",
    p1Shots: "Best shots",
    p1Bisector: "Bisector",
    p2Shots: "Best shots",
    p2Bisector: "Bisector",

    other: "Other",
    optimalPositions: "Optimal positions",

    playerSettings: "Player Settings",
    p1Hand: "P1 Hand:",
    p1Swing: "P1 Swing:",
    p2Hand: "P2 Hand:",
    p2Swing: "P2 Swing:",
    right: "Right",
    left: "Left",
    auto: "Auto",
    forehand: "Forehand",
    backhand: "Backhand",

    game: "Game",
    checkPosition: "🎯 Check Position",
    showSolution: "💡 Show Solution",
    youWin: "You win! 🎾",
    youLose: "You lose, try again or ask for the solution.",

    // ShotInfoPanel
    player1: "Player 1",
    player2: "Player 2",
    shotAngleInfo: "Shot & Angle Info",
    downTheLineShot: "Down-the-line shot",
    crossCourtShot: "Cross-court shot",
    mediumShotBisector: "Medium shot (bisector)",
    opponentDistance: "Opponent distance",
    shotsLengthDifference: "Shots length difference",
    angleBetweenShots: "Angle between shots",

    // Info popup
    calculationDetails: "Calculation Details",
    shotAnalysis: "🎾 Shot Analysis",
    shotDistances: "Shot Distances:",
    shotDistancesDesc: "Calculated from player contact point to shot endpoints",
    opponentDistanceDesc:
      "Lateral distance needed to intercept shot trajectory (not endpoint distance)",
    colorCoding: "Color Coding:",
    colorCodingDesc:
      "Green = shortest distance, Red = longest distance (only if difference >10%)",

    timeCalculations: "⏱️ Time Calculations",
    playerMovement: "Player Movement:",
    playerMovementDesc: "Assumes 4 m/s lateral speed",
    ballTrajectory: "Ball Trajectory:",
    ballTrajectoryDesc: "Uses shot-specific speeds and curve factors:",

    criticalAlerts: "🚨 Critical Alerts",
    redBold: "Red + Bold:",
    redBoldDesc: "Player cannot reach shot in time (movement time > ball time)",
    comparison: "Comparison:",
    comparisonDesc:
      '">" means player is too slow, "<" means player can reach it',

    physicsModel: "📐 Physics Model",
    curveFactors: "Curve Factors:",
    curveFactorsDesc:
      "Account for topspin/slice trajectory deviation from straight line",
    rallyTopspinDesc: "+25% distance due to significant curve",
    flatShotsDesc: "+5% minimal curve adjustment",
    interceptionLogic: "Interception Logic:",
    interceptionLogicDesc:
      "Calculates perpendicular distance to shot path, not endpoint distance",

    strategicInsights: "🎯 Strategic Insights",
    angleAnalysis: "Angle Analysis:",
    angleAnalysisDesc: "Shows tactical angle between shot options",
    distanceDifference: "Distance Difference:",
    distanceDifferenceDesc: "Helps identify positioning advantages",
    playerSwitching: "Player Switching:",
    playerSwitchingDesc: "Hover/drag players to see their perspective",

    // CanvasControls
    switchToLandscape: "Switch to landscape mode",
    switchToPortrait: "Switch to portrait mode",
    hideStatistics: "Hide statistics",
    showStatistics: "Show statistics",
  },
  fr: {
    // BurgerMenu
    controls: "Contrôles",
    hideStats: "Masquer stats",
    showStats: "Afficher stats",

    // CourtControls
    courtSettings: "Paramètres du Court",
    orientation: "Orientation :",
    portrait: "Portrait",
    landscape: "Paysage",
    courtType: "Type de court :",
    clay: "Terre battue",
    hard: "Dur",
    grass: "Gazon",
    shotType: "Type de coup:",
    flatAttack: "Coup droit d'attaque à plat (110 km/h)",
    powerfulTopspin: "Coup droit lifté puissant (95 km/h)",
    rallyTopspin: "Lifté d'échange (80 km/h)",
    defensiveSlice: "Slice défensif (60 km/h)",

    player1Display: "Affichage Joueur 1",
    player2Display: "Affichage Joueur 2",
    p1Shots: "Meilleurs coups",
    p1Bisector: "Bissectrice",
    p2Shots: "Meilleurs coups",
    p2Bisector: "Bissectrice",

    other: "Autre",
    optimalPositions: "Positions optimales",

    playerSettings: "Paramètres des Joueurs",
    p1Hand: "Main Joueur 1 :",
    p1Swing: "Coup Joueur 1 :",
    p2Hand: "Main Joueur 2 :",
    p2Swing: "Coup Joueur 2 :",
    right: "Droite",
    left: "Gauche",
    auto: "Auto",
    forehand: "Coup droit",
    backhand: "Revers",

    game: "Jeu",
    checkPosition: "🎯 Vérifier Position",
    showSolution: "💡 Montrer Solution",
    youWin: "Vous gagnez ! 🎾",
    youLose: "Vous perdez, réessayez ou demandez la solution.",

    // ShotInfoPanel
    player1: "Joueur 1",
    player2: "Joueur 2",
    shotAngleInfo: "- Mesures",
    downTheLineShot: "Coup long de ligne",
    crossCourtShot: "Coup croisé",
    mediumShotBisector: "Coup médian (bissectrice)",
    opponentDistance: "Distance adversaire",
    shotsLengthDifference: "Différence meilleurs coups",
    angleBetweenShots: "Angle des meilleurs coups",

    // Info popup
    calculationDetails: "Détails des Calculs",
    shotAnalysis: "🎾 Analyse des coups",
    shotDistances: "Distances de coup :",
    shotDistancesDesc:
      "Calculées du point de contact du joueur aux extrémités des coups",
    opponentDistanceDesc:
      "Distance latérale nécessaire pour intercepter la trajectoire (pas la distance au point final)",
    colorCoding: "Code Couleur :",
    colorCodingDesc:
      "Vert = distance la plus courte, Rouge = distance la plus longue (seulement si différence >10%)",

    timeCalculations: "⏱️ Calculs de Temps",
    playerMovement: "Mouvement du Joueur :",
    playerMovementDesc: "Suppose une vitesse latérale de 4 m/s",
    ballTrajectory: "Trajectoire de Balle :",
    ballTrajectoryDesc:
      "Utilise des vitesses et facteurs de courbe spécifiques aux coups :",

    criticalAlerts: "🚨 Alertes Critiques",
    redBold: "Rouge + Gras :",
    redBoldDesc:
      "Le joueur ne peut pas atteindre la coup à temps (temps de mouvement > temps de balle)",
    comparison: "Comparaison :",
    comparisonDesc:
      '">" signifie que le joueur est trop lent, "<" signifie qu\'il peut l\'atteindre',

    physicsModel: "📐 Modèle Physique",
    curveFactors: "Facteurs de Courbe :",
    curveFactorsDesc:
      "Tiennent compte de la déviation de trajectoire du lift/slice par rapport à la ligne droite",
    rallyTopspinDesc: "+25% de distance due à une courbe significative",
    flatShotsDesc: "+5% d'ajustement minimal de courbe",
    interceptionLogic: "Logique d'Interception :",
    interceptionLogicDesc:
      "Calcule la distance perpendiculaire à la trajectoire de la frappe, pas la distance au point de rebond idéal",

    strategicInsights: "🎯 Aperçus Stratégiques",
    angleAnalysis: "Analyse d'Angle :",
    angleAnalysisDesc: "Montre l'angle tactique entre les options de frappe",
    distanceDifference: "Différence de Distance :",
    distanceDifferenceDesc: "Aide à identifier les avantages de positionnement",
    playerSwitching: "Changement de Joueur :",
    playerSwitchingDesc:
      "Survolez/glissez les joueurs pour voir leur perspective",

    // CanvasControls
    switchToLandscape: "Passer en mode paysage",
    switchToPortrait: "Passer en mode portrait",
    hideStatistics: "Masquer les statistiques",
    showStatistics: "Afficher les statistiques",
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
