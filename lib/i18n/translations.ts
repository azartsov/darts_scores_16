export type Language = "en" | "ru"

export interface Translations {
  // App
  appTitle: string
  appSubtitle: string

  // Game Setup
  gameType: string
  finishMode: string
  finishSimple: string
  finishSimpleDesc: string
  finishDouble: string
  finishDoubleDesc: string
  numberOfLegs: string
  leg: string
  legs: string
  legsHint: string
  players: string
  playersCount: string
  addPlayer: string
  add: string
  playerPlaceholder: string
  startGame: string
  startMatch: string

  // Game Board
  playersTitleSection: string
  legOf: string
  firstTo: string

  // Player Card
  nowThrowing: string
  bust: string
  legsWonLabel: string

  // Scoring Input
  playerTurn: string
  projectedScore: string
  winningThrow: string
  bustScoreRevert: string
  finish: string
  dart: string
  total: string
  highValues: string
  lowValues: string
  bull: string
  bullseye: string
  miss: string
  single: string
  double: string
  triple: string
  clear: string
  submitTurn: string
  multiplierHint: string
  tapToSelect: string
  doubleTapMultiplier: string

  // Game Controls
  undo: string
  howToPlay: string
  resetScores: string
  newGame: string

  // Rules Dialog
  rulesTitle: string
  rulesSimpleSubtitle: string
  rulesDoubleSubtitle: string
  objective: string
  objectiveSimpleDesc: string
  objectiveDoubleDesc: string
  scoring: string
  scoringDesc: string
  bustRule: string
  bustSimpleDesc: string
  bustDoubleDesc: string
  checkout: string
  checkoutSimpleDesc: string
  checkoutDoubleDesc: string

  // Victory Screen
  winner: string
  matchWinner: string
  legWinner: string
  finishedInTurnsDouble: string
  finishedInTurnsSimple: string
  rematch: string
  viewStats: string
  nextLeg: string
  wonLegMessage: string

  // Statistics
  statistics: string
  position: string
  playerName: string
  remainingPoints: string
  avgPer3Darts: string
  dartsThrown: string
  rounds: string
  busts: string
  legsHeader: string
  shareStats: string
  copyStats: string
  close: string
  statsCopied: string
  avgCalculationHint: string
  bustIncludedHint: string
  shareAsImage: string
  downloadImage: string
  copyImage: string
  imageCopied: string
  generatingImage: string

  // Dart Input Mode
  inputModeButtons: string
  inputModeDartboard: string
  switchInputMode: string
  dartboardMiss: string

  // Dart States
  dartEmpty: string
  dartMiss: string
  fillAllDarts: string

  // Setup Help
  helpTitle: string
  helpSetupTitle: string
  helpSetupDesc: string
  helpRulesTitle: string
  helpSimpleRuleDesc: string
  helpDoubleRuleDesc: string
  helpBustDesc: string
  helpInputTitle: string
  helpInputDesc: string
  helpScoringGuideTitle: string
  helpSingleZone: string
  helpDoubleZone: string
  helpTripleZone: string
  helpBullZone: string
  helpBullseyeZone: string
  helpExamplesTitle: string
  helpExample1: string
  helpExample2: string
  helpExample3: string
  helpExample4: string
  helpStatsTitle: string
  helpStatsDesc: string
  helpGotIt: string

  // Auth
  loginSubtitle: string
  emailPlaceholder: string
  passwordPlaceholder: string
  signIn: string
  signUp: string
  signingIn: string
  signingUp: string
  noAccountYet: string
  alreadyHaveAccount: string
  orContinueAsGuest: string
  playAsGuest: string
  logout: string
  guest: string
  myStats: string
  noGamesYet: string
  statsLoadError: string
  statsRanking: string
  statsByMonth: string
  statsGames: string
  statsWins: string
  gameSaved: string
  gameSaveError: string

  // Language
  language: string
  english: string
  russian: string
}

export const translations: Record<Language, Translations> = {
  en: {
    // App
    appTitle: "Darts",
    appSubtitle: "Set up and play",

    // Game Setup
    gameType: "Mode",
    finishMode: "Finish",
    finishSimple: "Simple",
    finishSimpleDesc: "Any dart to zero wins",
    finishDouble: "Double",
    finishDoubleDesc: "Must end on a double",
    numberOfLegs: "Legs",
    leg: "Leg",
    legs: "Legs",
    legsHint: "First to {count} wins",
    players: "Players",
    playersCount: "Players ({count}/10)",
    addPlayer: "+Player",
    add: "+",
    playerPlaceholder: "Player {num}",
    startGame: "Start",
    startMatch: "Start Match",

    // Game Board
    playersTitleSection: "Players",
    legOf: "Leg {current}/{total}",
    firstTo: "First to {count}",

    // Player Card
    nowThrowing: "Throwing",
    bust: "BUST",
    legsWonLabel: "Legs",

    // Scoring Input
    playerTurn: "{player}",
    projectedScore: "Projected",
    winningThrow: "Win!",
    bustScoreRevert: "BUST!",
    finish: "Finish",
    dart: "Dart",
    total: "Total",
    highValues: "High",
    lowValues: "Low",
    bull: "Bull",
    bullseye: "Bullseye",
    miss: "Miss",
    single: "x1",
    double: "x2",
    triple: "x3",
    clear: "Clear",
    submitTurn: "Submit",
    multiplierHint: "2x tap = multiplier",
    tapToSelect: "Select",
    doubleTapMultiplier: "2x tap",

    // Game Controls
    undo: "Undo",
    howToPlay: "Help",
    resetScores: "Reset",
    newGame: "New",

    // Rules Dialog
    rulesTitle: "How to Play",
    rulesSimpleSubtitle: "Simple Mode - Any finish to zero",
    rulesDoubleSubtitle: "Double Mode - Must finish on a double",
    objective: "Objective",
    objectiveSimpleDesc:
      "Reduce your score from 301 or 501 to exactly zero. Any dart that brings your score to 0 wins.",
    objectiveDoubleDesc:
      "Reduce your score from 301 or 501 to exactly zero. The final dart must be a double or bullseye.",
    scoring: "Scoring",
    scoringDesc:
      "Each turn, throw 3 darts. Enter each dart value (1-20, 25 bull, 50 bullseye) with single, double, or triple multiplier.",
    bustRule: "Bust Rule",
    bustSimpleDesc:
      "If your score goes below 0, it's a bust. Your score reverts to what it was at the start of your turn.",
    bustDoubleDesc:
      "If your score goes below 2 or to exactly 1, it's a bust. Your score reverts to what it was at the start of your turn.",
    checkout: "Checkout",
    checkoutSimpleDesc:
      "When your score is 170 or less, suggestions appear showing ways to finish.",
    checkoutDoubleDesc:
      "When your score is 170 or less, suggestions appear to help you finish with a double.",

    // Victory Screen
    winner: "Winner!",
    matchWinner: "Match Winner!",
    legWinner: "Leg Won!",
    finishedInTurnsDouble: "Double out in {turns} turns",
    finishedInTurnsSimple: "Finished in {turns} turns",
    rematch: "Rematch",
    viewStats: "Stats",
    nextLeg: "Next Leg",
    wonLegMessage: "{player} wins Leg {leg}!",

    // Statistics
    statistics: "Statistics",
    position: "#",
    playerName: "Player",
    remainingPoints: "Rem.",
    avgPer3Darts: "Avg/3",
    dartsThrown: "Darts",
    rounds: "Rnds",
    busts: "Busts",
    legsHeader: "Legs",
    shareStats: "Share",
    copyStats: "Copy",
    close: "Close",
    statsCopied: "Copied!",
    avgCalculationHint: "Avg/3 = (Points / Darts) x 3",
    bustIncludedHint: "Bust rounds included (0 pts)",
    shareAsImage: "Image",
    downloadImage: "Save",
    copyImage: "Copy Img",
    imageCopied: "Image copied!",
    generatingImage: "Generating...",

    // Dart Input Mode
    inputModeButtons: "Buttons",
    inputModeDartboard: "Board",
    switchInputMode: "Switch input",
    dartboardMiss: "Miss",

    // Dart States
    dartEmpty: "-",
    dartMiss: "Miss",
    fillAllDarts: "Fill all darts",

    // Setup Help
    helpTitle: "How to Play Darts",
    helpSetupTitle: "Game Setup",
    helpSetupDesc: "Choose 301 or 501 starting score, select finish mode (Simple or Double Out), set number of legs, and add 2-10 players.",
    helpRulesTitle: "Scoring Rules",
    helpSimpleRuleDesc: "Simple: reduce score to exactly 0 with any dart. If you go below 0, it's a bust.",
    helpDoubleRuleDesc: "Double Out: the final dart must land on a double (outer ring) or bullseye to win.",
    helpBustDesc: "Bust: your score reverts to the start of the turn. Bust rounds count as 0 points in stats.",
    helpInputTitle: "Input Methods",
    helpInputDesc: "Use buttons to tap number values, or switch to the interactive dartboard. Tap a dart card to edit a specific dart. Double-tap to cycle multiplier.",
    helpScoringGuideTitle: "Dartboard Scoring",
    helpSingleZone: "Single: face value (1-20)",
    helpDoubleZone: "Double (outer ring): x2 points",
    helpTripleZone: "Triple (inner ring): x3 points",
    helpBullZone: "Bull (outer bull): 25 points",
    helpBullseyeZone: "Bullseye (inner bull): 50 points",
    helpExamplesTitle: "Examples",
    helpExample1: "Triple 20 = 60 pts (max single dart)",
    helpExample2: "Double 18 = 36 pts",
    helpExample3: "Bullseye = 50 pts",
    helpExample4: "Single 1 = 1 pt (min single dart)",
    helpStatsTitle: "Statistics",
    helpStatsDesc: "Avg/3 = (Total points scored / Total darts thrown) x 3. Bust rounds are included as 0-point rounds.",
    helpGotIt: "Got it!",

    // Auth
    loginSubtitle: "Sign in to save game history",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Password",
    signIn: "Sign In",
    signUp: "Create Account",
    signingIn: "Signing in...",
    signingUp: "Creating...",
    noAccountYet: "Don't have an account? Create one",
    alreadyHaveAccount: "Already have an account? Sign in",
    orContinueAsGuest: "or",
    playAsGuest: "Play as Guest",
    logout: "Sign Out",
    guest: "Guest",
    myStats: "My Stats",
    noGamesYet: "No games saved yet. Play a game and it will appear here!",
    statsLoadError: "Failed to load stats",
    statsRanking: "Ranking",
    statsByMonth: "By Month",
    statsGames: "Games",
    statsWins: "Wins",
    gameSaved: "Game saved!",
    gameSaveError: "Failed to save game",

    // Language
    language: "Language",
    english: "English",
    russian: "Russian",
  },
  ru: {
    // App
    appTitle: "Дартс",
    appSubtitle: "Настройка и игра",

    // Game Setup
    gameType: "Режим",
    finishMode: "Финиш",
    finishSimple: "Простой",
    finishSimpleDesc: "Любой бросок до нуля",
    finishDouble: "Дабл",
    finishDoubleDesc: "Завершение удвоением",
    numberOfLegs: "Леги",
    leg: "Лег",
    legs: "Леги",
    legsHint: "До {count} побед",
    players: "Игроки",
    playersCount: "Игроки ({count}/10)",
    addPlayer: "+Игрок",
    add: "+",
    playerPlaceholder: "Игрок {num}",
    startGame: "Старт",
    startMatch: "Начать матч",

    // Game Board
    playersTitleSection: "Игроки",
    legOf: "Лег {current}/{total}",
    firstTo: "До {count}",

    // Player Card
    nowThrowing: "Бросает",
    bust: "ПЕРЕБОР",
    legsWonLabel: "Леги",

    // Scoring Input
    playerTurn: "{player}",
    projectedScore: "Прогноз",
    winningThrow: "Победа!",
    bustScoreRevert: "ПЕРЕБОР!",
    finish: "Финиш",
    dart: "Дротик",
    total: "Итого",
    highValues: "Верхние",
    lowValues: "Нижние",
    bull: "Булл",
    bullseye: "Буллзай",
    miss: "Мимо",
    single: "x1",
    double: "x2",
    triple: "x3",
    clear: "Сброс",
    submitTurn: "Ввод",
    multiplierHint: "2x тап = множитель",
    tapToSelect: "Выбрать",
    doubleTapMultiplier: "2x тап",

    // Game Controls
    undo: "Назад",
    howToPlay: "Правила",
    resetScores: "Сброс",
    newGame: "Новая",

    // Rules Dialog
    rulesTitle: "Правила игры",
    rulesSimpleSubtitle: "Простой режим - любой финиш до нуля",
    rulesDoubleSubtitle: "Дабл режим - финиш удвоением",
    objective: "Цель",
    objectiveSimpleDesc:
      "Уменьшите счёт с 301 или 501 до нуля. Любой бросок, доводящий счёт до 0, приносит победу.",
    objectiveDoubleDesc:
      "Уменьшите счёт с 301 или 501 до нуля. Последний бросок должен быть удвоением или буллзаем.",
    scoring: "Подсчёт",
    scoringDesc:
      "Каждый ход бросайте 3 дротика. Вводите значение каждого (1-20, 25 булл, 50 буллзай) с множителем x1, x2 или x3.",
    bustRule: "Перебор",
    bustSimpleDesc:
      "Если счёт уходит ниже 0 - перебор. Счёт возвращается к значению на начало хода.",
    bustDoubleDesc:
      "Если счёт уходит ниже 2 или становится 1 - перебор. Счёт возвращается к значению на начало хода.",
    checkout: "Завершение",
    checkoutSimpleDesc:
      "При счёте 170 или меньше появляются подсказки для завершения.",
    checkoutDoubleDesc:
      "При счёте 170 или меньше появляются подсказки для завершения удвоением.",

    // Victory Screen
    winner: "Победитель!",
    matchWinner: "Победитель матча!",
    legWinner: "Лег выигран!",
    finishedInTurnsDouble: "Дабл-аут за {turns} ходов",
    finishedInTurnsSimple: "Завершено за {turns} ходов",
    rematch: "Реванш",
    viewStats: "Стат.",
    nextLeg: "След. лег",
    wonLegMessage: "{player} выиграл лег {leg}!",

    // Statistics
    statistics: "Статистика",
    position: "#",
    playerName: "Игрок",
    remainingPoints: "Ост.",
    avgPer3Darts: "Ср/3",
    dartsThrown: "Броски",
    rounds: "Раунды",
    busts: "Перебр.",
    legsHeader: "Леги",
    shareStats: "Поделиться",
    copyStats: "Копировать",
    close: "Закрыть",
    statsCopied: "Скопировано!",
    avgCalculationHint: "Ср/3 = (Очки / Броски) x 3",
    bustIncludedHint: "Переборы включены (0 очков)",
    shareAsImage: "Картинка",
    downloadImage: "Сохранить",
    copyImage: "Копировать",
    imageCopied: "Скопировано!",
    generatingImage: "Создаём...",

    // Dart Input Mode
    inputModeButtons: "Кнопки",
    inputModeDartboard: "Мишень",
    switchInputMode: "Сменить ввод",
    dartboardMiss: "Мимо",

    // Dart States
    dartEmpty: "-",
    dartMiss: "Мимо",
    fillAllDarts: "Заполните все",

    // Setup Help
    helpTitle: "Как играть в дартс",
    helpSetupTitle: "Настройка игры",
    helpSetupDesc: "Выберите стартовый счёт 301 или 501, режим финиша (Простой или Дабл), количество легов и добавьте 2-10 игроков.",
    helpRulesTitle: "Правила подсчёта",
    helpSimpleRuleDesc: "Простой: уменьшите счёт до 0 любым броском. Если счёт уходит ниже 0 - перебор.",
    helpDoubleRuleDesc: "Дабл: последний бросок должен попасть в удвоение (внешнее кольцо) или буллзай.",
    helpBustDesc: "Перебор: счёт возвращается к началу хода. Переборы учитываются как 0 очков в статистике.",
    helpInputTitle: "Способы ввода",
    helpInputDesc: "Используйте кнопки для ввода значений или переключитесь на интерактивную мишень. Нажмите на карточку дротика для его редактирования. Двойной тап - смена множителя.",
    helpScoringGuideTitle: "Разметка мишени",
    helpSingleZone: "Сингл: номинал сектора (1-20)",
    helpDoubleZone: "Дабл (внешнее кольцо): x2 очков",
    helpTripleZone: "Трипл (внутреннее кольцо): x3 очков",
    helpBullZone: "Булл (внешний центр): 25 очков",
    helpBullseyeZone: "Буллзай (центр): 50 очков",
    helpExamplesTitle: "Примеры",
    helpExample1: "Трипл 20 = 60 оч. (макс. за 1 дротик)",
    helpExample2: "Дабл 18 = 36 оч.",
    helpExample3: "Буллзай = 50 оч.",
    helpExample4: "Сингл 1 = 1 оч. (мин. за 1 дротик)",
    helpStatsTitle: "Статистика",
    helpStatsDesc: "Ср/3 = (Очки / Броски) x 3. Переборы включены как раунды с 0 очков.",
    helpGotIt: "Понятно!",

    // Auth
    loginSubtitle: "Войдите для сохранения истории игр",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Пароль",
    signIn: "Войти",
    signUp: "Создать аккаунт",
    signingIn: "Вход...",
    signingUp: "Создание...",
    noAccountYet: "Нет аккаунта? Создать",
    alreadyHaveAccount: "Уже есть аккаунт? Войти",
    orContinueAsGuest: "или",
    playAsGuest: "Играть как гость",
    logout: "Выйти",
    guest: "Гость",
    myStats: "Мои игры",
    noGamesYet: "Игр пока нет. Сыграйте партию, и она появится здесь!",
    statsLoadError: "Не удалось загрузить статистику",
    statsRanking: "Рейтинг",
    statsByMonth: "По месяцам",
    statsGames: "Игры",
    statsWins: "Победы",
    gameSaved: "Игра сохранена!",
    gameSaveError: "Не удалось сохранить игру",

    // Language
    language: "Язык",
    english: "Английский",
    russian: "Русский",
  },
}
