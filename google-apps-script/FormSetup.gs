/**
 * ==============================================================================
 * CLUTCH – Google Form Automation Script
 * Creates the official 5-page Google Form with Section Branching:
 * Page 1: POC Email, Code, Match #, Game Selection
 * Page 2: Free Fire Top 1 to 5 Winners & Kills -> SUBMIT
 * Page 3: BGMI Top 1 to 5 Winners & Kills -> SUBMIT
 * Page 4: FIFA Top 1 to 5 Winners & Score -> SUBMIT
 * Page 5: MATIKS Top 1 to 5 Winners & Score -> SUBMIT
 * ==============================================================================
 */

function createClutchOfficialForm() {
  const form = FormApp.create("CLUTCH 2026 – Match Results Submission");
  
  form.setDescription(
    "NIAT E-Sports Championship, Mangalore Edition (15 November 2026)\n" +
    "Official referee submission portal. Requires verified POC email & game code.\n" +
    "Select your game on Page 1 to enter Top 1 to 5 winner details."
  );

  form.setCollectEmail(true);

  // ============================================================================
  // PAGE 1: POC DETAILS, CODE, MATCH NUMBER & GAME SELECTION
  // ============================================================================
  
  // 1. POC Email Address (Manual field in case user submits from personal email)
  const pocEmailItem = form.addTextItem();
  pocEmailItem.setTitle("POC Registered Email Address")
    .setHelpText("Enter the authorized email address registered in the CLUTCH POC Registry.")
    .setRequired(true);

  // 2. POC Name
  const pocNameItem = form.addTextItem();
  pocNameItem.setTitle("POC / Referee Full Name")
    .setRequired(true);

  // 3. Verification Code
  const codeItem = form.addTextItem();
  codeItem.setTitle("Game Verification Code")
    .setHelpText("Confidential room code (e.g. CLT-FF-2026X, CLT-BG-2026X, CLT-FI-2026X, CLT-MT-2026X)")
    .setRequired(true);

  // 4. Match / Round Number
  const matchNumItem = form.addTextItem();
  matchNumItem.setTitle("Match / Round Number")
    .setHelpText("e.g. 1, 2, 3, Semi-Finals, Grand Finals")
    .setRequired(true);

  // 5. Game Selection Question (Choices will be wired up after page breaks are created)
  const gameItem = form.addMultipleChoiceItem();
  gameItem.setTitle("Select Competitive Game Arena")
    .setHelpText("Choose the game you are refereeing. You will be routed to its Top 5 winner submission page.")
    .setRequired(true);


  // ============================================================================
  // PAGE 2: FREE FIRE (TOP 1 TO 5 WINNERS)
  // ============================================================================
  const pageFF = form.addPageBreakItem();
  pageFF.setTitle("🔥 Free Fire – Top 5 Winners & Results")
    .setHelpText("Enter the Top 5 finishing teams and their kill counts for this Free Fire match.");

  // Rank 1
  form.addTextItem().setTitle("FF: 🥇 1st Place Team Name (Winner)").setRequired(true);
  form.addTextItem().setTitle("FF: 1st Place - Total Kills").setRequired(true);

  // Rank 2
  form.addTextItem().setTitle("FF: 🥈 2nd Place Team Name (Runner-up)").setRequired(true);
  form.addTextItem().setTitle("FF: 2nd Place - Total Kills").setRequired(true);

  // Rank 3
  form.addTextItem().setTitle("FF: 🥉 3rd Place Team Name").setRequired(true);
  form.addTextItem().setTitle("FF: 3rd Place - Total Kills").setRequired(true);

  // Rank 4
  form.addTextItem().setTitle("FF: 4th Place Team Name").setRequired(true);
  form.addTextItem().setTitle("FF: 4th Place - Total Kills").setRequired(true);

  // Rank 5
  form.addTextItem().setTitle("FF: 5th Place Team Name").setRequired(true);
  form.addTextItem().setTitle("FF: 5th Place - Total Kills").setRequired(true);

  // Proof & Notes
  form.addTextItem().setTitle("FF: Screenshot / Scoreboard Drive Link").setRequired(false);
  form.addParagraphTextItem().setTitle("FF: Referee Notes / Disqualifications").setRequired(false);

  // Automatically submit after Free Fire
  pageFF.setGoToPage(FormApp.PageNavigationType.SUBMIT);


  // ============================================================================
  // PAGE 3: BGMI (TOP 1 TO 5 WINNERS)
  // ============================================================================
  const pageBGMI = form.addPageBreakItem();
  pageBGMI.setTitle("🎯 BGMI – Top 5 Winners & Results")
    .setHelpText("Enter the Top 5 finishing teams and their kill counts for this BGMI match.");

  // Rank 1
  form.addTextItem().setTitle("BGMI: 🥇 1st Place Team Name (Winner)").setRequired(true);
  form.addTextItem().setTitle("BGMI: 1st Place - Total Kills").setRequired(true);

  // Rank 2
  form.addTextItem().setTitle("BGMI: 🥈 2nd Place Team Name (Runner-up)").setRequired(true);
  form.addTextItem().setTitle("BGMI: 2nd Place - Total Kills").setRequired(true);

  // Rank 3
  form.addTextItem().setTitle("BGMI: 🥉 3rd Place Team Name").setRequired(true);
  form.addTextItem().setTitle("BGMI: 3rd Place - Total Kills").setRequired(true);

  // Rank 4
  form.addTextItem().setTitle("BGMI: 4th Place Team Name").setRequired(true);
  form.addTextItem().setTitle("BGMI: 4th Place - Total Kills").setRequired(true);

  // Rank 5
  form.addTextItem().setTitle("BGMI: 5th Place Team Name").setRequired(true);
  form.addTextItem().setTitle("BGMI: 5th Place - Total Kills").setRequired(true);

  // Proof & Notes
  form.addTextItem().setTitle("BGMI: Screenshot / Scoreboard Drive Link").setRequired(false);
  form.addParagraphTextItem().setTitle("BGMI: Referee Notes / Disqualifications").setRequired(false);

  // Automatically submit after BGMI
  pageBGMI.setGoToPage(FormApp.PageNavigationType.SUBMIT);


  // ============================================================================
  // PAGE 4: FIFA (TOP 1 TO 5 WINNERS)
  // ============================================================================
  const pageFIFA = form.addPageBreakItem();
  pageFIFA.setTitle("⚽ FIFA – Top 5 Players & Bracket")
    .setHelpText("Enter the Top 5 finishing players and match result for this FIFA round.");

  form.addTextItem().setTitle("FIFA: 🥇 1st Place Player Name (Champion)").setRequired(true);
  form.addTextItem().setTitle("FIFA: 🥈 2nd Place Player Name (Runner-up)").setRequired(true);
  form.addTextItem().setTitle("FIFA: 🥉 3rd Place Player Name").setRequired(true);
  form.addTextItem().setTitle("FIFA: 4th Place Player Name").setRequired(true);
  form.addTextItem().setTitle("FIFA: 5th Place Player Name").setRequired(true);
  form.addTextItem().setTitle("FIFA: Final Match Score (e.g. 3 - 1)").setRequired(false);
  form.addTextItem().setTitle("FIFA: Screenshot / Proof Link").setRequired(false);
  form.addParagraphTextItem().setTitle("FIFA: Referee Notes").setRequired(false);

  // Automatically submit after FIFA
  pageFIFA.setGoToPage(FormApp.PageNavigationType.SUBMIT);


  // ============================================================================
  // PAGE 5: MATIKS (TOP 1 TO 5 WINNERS)
  // ============================================================================
  const pageMATIKS = form.addPageBreakItem();
  pageMATIKS.setTitle("🧠 MATIKS – Top 5 Participants & Scores")
    .setHelpText("Enter the Top 5 participants and their scores for this MATIKS round.");

  form.addTextItem().setTitle("MATIKS: 🥇 1st Place Name (Winner)").setRequired(true);
  form.addTextItem().setTitle("MATIKS: 1st Place - Points / Score").setRequired(true);

  form.addTextItem().setTitle("MATIKS: 🥈 2nd Place Name (Runner-up)").setRequired(true);
  form.addTextItem().setTitle("MATIKS: 2nd Place - Points / Score").setRequired(true);

  form.addTextItem().setTitle("MATIKS: 🥉 3rd Place Name").setRequired(true);
  form.addTextItem().setTitle("MATIKS: 3rd Place - Points / Score").setRequired(true);

  form.addTextItem().setTitle("MATIKS: 4th Place Name").setRequired(true);
  form.addTextItem().setTitle("MATIKS: 4th Place - Points / Score").setRequired(true);

  form.addTextItem().setTitle("MATIKS: 5th Place Name").setRequired(true);
  form.addTextItem().setTitle("MATIKS: 5th Place - Points / Score").setRequired(true);

  form.addTextItem().setTitle("MATIKS: Proof Link / Notes").setRequired(false);

  // Automatically submit after MATIKS
  pageMATIKS.setGoToPage(FormApp.PageNavigationType.SUBMIT);


  // ============================================================================
  // WIRE UP PAGE 1 BRANCHING TO EACH GAME PAGE
  // ============================================================================
  gameItem.setChoices([
    gameItem.createChoice("Free Fire", pageFF),
    gameItem.createChoice("BGMI", pageBGMI),
    gameItem.createChoice("FIFA", pageFIFA),
    gameItem.createChoice("MATIKS", pageMATIKS)
  ]);

  // Link form responses directly to the active tournament spreadsheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  const pubUrl = form.getPublishedUrl();
  const editUrl = form.getEditUrl();

  Logger.log("✅ 5-Page Branching Form created successfully!");
  Logger.log("Public URL: " + pubUrl);
  Logger.log("Edit URL: " + editUrl);

  SpreadsheetApp.getUi().alert(
    "✅ 5-Page Branching Form Created Successfully!\n\n" +
    "Public Form URL: " + pubUrl + "\n\n" +
    "• Page 1: Email, Code, Match #, Game Selection\n" +
    "• Pages 2-5: Game-specific Top 1 to 5 Winners\n" +
    "• Submitting each game immediately submits the form!"
  );
}
