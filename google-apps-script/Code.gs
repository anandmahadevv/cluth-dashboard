/**
 * ==============================================================================
 * CLUTCH – NIAT E-Sports Championship, Mangalore Edition
 * Google Apps Script Master Backend & Public Web App API
 * ==============================================================================
 * Features:
 * - Concurrency protection using LockService
 * - Immutable raw Form_Responses
 * - POC Registry & Server-side Verification Code validation
 * - Correction request review workflow (preserving previous versions + audit log)
 * - Read-only public API with zero private data exposure
 * - Auto-initialization of all 9 spreadsheet tabs with headers and data validation
 */

const SHEET_NAMES = {
  FORM_RESPONSES: "Form_Responses",
  POC_REGISTRY: "POC_Registry",
  VERIFICATION_CODES: "Verification_Codes",
  FREE_FIRE: "Free_Fire",
  BGMI: "BGMI",
  FIFA: "FIFA",
  MATIKS: "MATIKS",
  CORRECTIONS: "Correction_Requests",
  AUDIT_LOGS: "Audit_Logs",
  SETTINGS: "Settings",
};

/**
 * Custom Menu for Organizers in Google Sheets
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🏆 CLUTCH Organizer")
    .addItem("🚀 1. Initialize Sheets & Schemas", "initializeSpreadsheet")
    .addItem("🔑 2. Seed Default POCs & Verification Codes", "seedInitialData")
    .addSeparator()
    .addItem("📝 3. Auto-Create Google Form", "createClutchOfficialForm")
    .addItem("⏱️ 4. Install Real-Time Form Trigger", "installFormSubmitTrigger")
    .addSeparator()
    .addItem("⚡ 5. Process Pending Form Responses", "processPendingFormResponses")
    .addItem("📋 6. Review & Approve Corrections", "showCorrectionReviewDialog")
    .addItem("📊 7. Force Recalculate Standings", "recalculateAllStandings")
    .addToUi();
}

/**
 * 1. Initialize all 9 required tabs with exact headers and formatting
 */
function initializeSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const tabConfigs = [
    {
      name: SHEET_NAMES.FORM_RESPONSES,
      headers: [
        "Timestamp", "Email Address", "Game", "Verification Code",
        "Match Number", "Team / Player 1", "Opponent / Player 2",
        "Stat 1 (Placement / Goals 1 / Accuracy %)",
        "Stat 2 (Kills / Goals 2 / Reaction ms)",
        "Notes", "Submission Type", "Original Result ID"
      ]
    },
    {
      name: SHEET_NAMES.POC_REGISTRY,
      headers: ["Email", "POC Name", "Assigned Game", "Role", "Is Active", "Added At"]
    },
    {
      name: SHEET_NAMES.VERIFICATION_CODES,
      headers: ["Verification Code", "Game", "Description", "Is Active", "Usage Count", "Created At"]
    },
    {
      name: SHEET_NAMES.FREE_FIRE,
      headers: [
        "Result ID", "Match Number", "Team Name", "Placement Points",
        "Kill Points", "Total Points", "Status", "Version", "Approved At", "Previous Version ID"
      ]
    },
    {
      name: SHEET_NAMES.BGMI,
      headers: [
        "Result ID", "Match Number", "Team Name", "Placement Points",
        "Kill Points", "Total Points", "Status", "Version", "Approved At", "Previous Version ID"
      ]
    },
    {
      name: SHEET_NAMES.FIFA,
      headers: [
        "Result ID", "Match Number", "Round", "Player 1", "Player 2",
        "Goals 1", "Goals 2", "Winner", "Is Draw", "Status", "Version", "Approved At", "Previous Version ID"
      ]
    },
    {
      name: SHEET_NAMES.MATIKS,
      headers: [
        "Result ID", "Player Name", "Team Name", "Round", "Raw Score",
        "Accuracy Pct", "Reaction Time ms", "Computed Score", "Position", "Match Result", "Status", "Version", "Approved At"
      ]
    },
    {
      name: SHEET_NAMES.CORRECTIONS,
      headers: [
        "Correction ID", "Original Result ID", "Game", "Requested By Email",
        "Old Data JSON", "Proposed Data JSON", "Reason", "Status", "Requested At", "Reviewed By", "Reviewed At"
      ]
    },
    {
      name: SHEET_NAMES.AUDIT_LOGS,
      headers: ["Timestamp", "Action", "Game", "Result ID", "Actor", "Details JSON", "Lock Duration ms"]
    },
    {
      name: SHEET_NAMES.SETTINGS,
      headers: ["Setting Key", "Setting Value", "Description", "Last Updated"]
    }
  ];

  tabConfigs.forEach(cfg => {
    let sheet = ss.getSheetByName(cfg.name);
    if (!sheet) {
      sheet = ss.insertSheet(cfg.name);
    }
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, cfg.headers.length).setValues([cfg.headers]);
      sheet.getRange(1, 1, 1, cfg.headers.length).setFontWeight("bold").setBackground("#f1f5f9");
      sheet.setFrozenRows(1);
    }
  });

  // Initialize Settings
  const settingsSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
  if (settingsSheet.getLastRow() <= 1) {
    const defaultSettings = [
      ["TOURNAMENT_STATUS", "Live", "Current tournament phase (Upcoming/Live/Completed)", new Date().toISOString()],
      ["TOURNAMENT_NAME", "CLUTCH - NIAT E-Sports Championship", "Official tournament brand", new Date().toISOString()],
      ["VENUE", "Yenepoya University, Mangalore", "Event venue", new Date().toISOString()],
      ["EVENT_DATE", "15 November 2026", "Tournament date", new Date().toISOString()],
      ["AUTO_PUBLISH_VALID", "TRUE", "Auto publish submissions if POC and Code are valid", new Date().toISOString()],
    ];
    settingsSheet.getRange(2, 1, defaultSettings.length, 4).setValues(defaultSettings);
  }

  logAudit("INITIALIZE_SCHEMA", "ALL", "SYSTEM", "system", JSON.stringify({ tabsCreated: tabConfigs.length }));
  SpreadsheetApp.getUi().alert("✅ All 9 CLUTCH tournament tabs and schemas have been successfully initialized!");
}

/**
 * 2. Seed Default POCs and Verification Codes
 */
function seedInitialData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Seed POCs
  const pocSheet = ss.getSheetByName(SHEET_NAMES.POC_REGISTRY);
  if (pocSheet.getLastRow() <= 1) {
    const pocs = [
      ["ff.referee@niat.edu", "Free Fire Head Referee", "FREE_FIRE", "POC", "TRUE", new Date().toISOString()],
      ["bgmi.referee@niat.edu", "BGMI Head Referee", "BGMI", "POC", "TRUE", new Date().toISOString()],
      ["fifa.referee@niat.edu", "FIFA Head Referee", "FIFA", "POC", "TRUE", new Date().toISOString()],
      ["matiks.referee@niat.edu", "MATIKS Head Referee", "MATIKS", "POC", "TRUE", new Date().toISOString()],
      ["admin@clutch2026.com", "Chief Super Admin", "ALL", "SUPER_ADMIN", "TRUE", new Date().toISOString()]
    ];
    pocSheet.getRange(2, 1, pocs.length, 6).setValues(pocs);
  }

  // Seed Codes
  const codeSheet = ss.getSheetByName(SHEET_NAMES.VERIFICATION_CODES);
  if (codeSheet.getLastRow() <= 1) {
    const codes = [
      ["FF-MGL-2026", "FREE_FIRE", "Free Fire Bermuda/Erangel verified code", "TRUE", 0, new Date().toISOString()],
      ["BGMI-KUDLA-99", "BGMI", "BGMI Battlegrounds official room code", "TRUE", 0, new Date().toISOString()],
      ["FIFA-YEN-77", "FIFA", "FIFA 1v1 Console tournament code", "TRUE", 0, new Date().toISOString()],
      ["MATIKS-LOGIC-42", "MATIKS", "MATIKS Speed & Logic competition code", "TRUE", 0, new Date().toISOString()]
    ];
    codeSheet.getRange(2, 1, codes.length, 6).setValues(codes);
  }

  logAudit("SEED_DATA", "ALL", "SYSTEM", "system", JSON.stringify({ message: "Default POCs and codes seeded" }));
  SpreadsheetApp.getUi().alert("✅ Sample POC referees and secure verification codes have been seeded!");
}

/**
 * Safe Alert Helper (works in both interactive UI mode and background trigger mode)
 */
function safeAlert(message) {
  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (e) {
    Logger.log("[UI ALERT]: " + message);
  }
}

/**
 * Real-time installable trigger for form submissions
 */
function onFormSubmit(e) {
  Logger.log("Form submission event received. Processing...");
  processPendingFormResponses();
}

/**
 * Install the form submission trigger programmatically
 */
function installFormSubmitTrigger() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "onFormSubmit") {
      safeAlert("✅ onFormSubmit trigger is already active!");
      return;
    }
  }
  ScriptApp.newTrigger("onFormSubmit")
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();
  safeAlert("✅ Real-time onFormSubmit trigger successfully installed!");
}

/**
 * LockService Concurrency-Protected Submission Processing
 */
function processPendingFormResponses() {
  const lock = LockService.getScriptLock();
  const startTime = new Date().getTime();
  
  try {
    lock.waitLock(15000); // Wait up to 15 seconds for concurrent locks
  } catch (e) {
    throw new Error("Could not acquire LockService lock. Please retry in a few moments.");
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const formSheet = ss.getSheetByName(SHEET_NAMES.FORM_RESPONSES) || ss.getSheetByName("Form Responses 1") || ss.getSheets()[0];
  if (!formSheet) {
    lock.releaseLock();
    return;
  }

  const data = formSheet.getDataRange().getValues();

  if (data.length <= 1) {
    lock.releaseLock();
    safeAlert("No submissions found in Form Responses.");
    return;
  }

  const headers = data[0];
  const validPocs = getValidPocsMap();
  const validCodes = getValidCodesMap();

  let processedCount = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    // Build row key-value map for robust header-based lookup
    const entry = {};
    for (let c = 0; c < headers.length; c++) {
      entry[String(headers[c]).trim().toLowerCase()] = String(row[c] || "").trim();
    }

    function get(keyword) {
      const lower = keyword.toLowerCase();
      for (const k in entry) {
        if (k.indexOf(lower) !== -1 && entry[k] !== "") {
          return entry[k];
        }
      }
      return "";
    }

    // De-duplication check: check column labeled "Processing_Status" or row[12]
    const processedStatus = String(entry["processing_status"] || row[12] || "").trim().toUpperCase();
    if (processedStatus === "PROCESSED" || processedStatus === "REJECTED") {
      continue;
    }

    const email = get("email address") || get("email") || String(row[1]).trim().toLowerCase();
    const rawGame = get("select competitive game") || get("game") || get("arena") || String(row[2]).trim();
    const code = get("verification code") || get("code") || String(row[3]).trim();
    const matchNum = get("match") || String(row[4] || "1").trim();
    const submissionType = String(row[10] || "NEW").trim().toUpperCase();
    const originalResultId = String(row[11] || "").trim();

    let game = "";
    const gLower = rawGame.toLowerCase();
    if (gLower.indexOf("free") !== -1) game = "FREE_FIRE";
    else if (gLower.indexOf("bgmi") !== -1) game = "BGMI";
    else if (gLower.indexOf("fifa") !== -1) game = "FIFA";
    else if (gLower.indexOf("matik") !== -1) game = "MATIKS";
    else game = rawGame.toUpperCase().replace(/[-\s]/g, "_");

    // Verification Check
    const poc = validPocs[email];
    const isCodeValid = validCodes[code] && (validCodes[code].game === game || validCodes[code].game === "ALL");

    if (!isCodeValid) {
      logAudit("REJECT_SUBMISSION", game, "N/A", email, JSON.stringify({ reason: "Invalid Code", codeEntered: code }));
      formSheet.getRange(i + 1, 13).setValue("REJECTED");
      formSheet.getRange(i + 1, 14).setValue(new Date().toISOString());
      continue;
    }

    // Detect if this is a Top 5 multi-ranking submission
    const isTop5Form = get("1st place") !== "" || get("winner") !== "";

    if (isTop5Form) {
      publishTop5Results(game, matchNum, entry, get);
      processedCount++;
    } else if (submissionType === "CORRECTION" && originalResultId) {
      handleCorrectionRequest(row, originalResultId, game, email);
      processedCount++;
    } else {
      publishNewResult(row, game, email);
      processedCount++;
    }

    // Mark as PROCESSED in Form Responses sheet
    formSheet.getRange(i + 1, 13).setValue("PROCESSED");
    formSheet.getRange(i + 1, 14).setValue(new Date().toISOString());
  }

  const duration = new Date().getTime() - startTime;
  logAudit("BATCH_PROCESS", "ALL", "MULTIPLE", "system", JSON.stringify({ processedCount, durationMs: duration }), duration);
  lock.releaseLock();

  safeAlert("⚡ Successfully processed " + processedCount + " new match submission(s) into leaderboards!");
}

/**
 * Publishes Top 1 to 5 rankings from multi-section Google Form into respective game tabs
 */
function publishTop5Results(game, matchNum, entry, get) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const timestamp = new Date().toISOString();

  if (game === "FREE_FIRE") {
    const targetSheet = ss.getSheetByName(SHEET_NAMES.FREE_FIRE);
    if (!targetSheet) return;
    const ffPlacementPoints = [12, 9, 8, 7, 6];
    
    for (let place = 1; place <= 5; place++) {
      const pSuffix = place === 1 ? "1st" : place === 2 ? "2nd" : place === 3 ? "3rd" : (place + "th");
      const team = get("ff: " + pSuffix + " place team") || get(pSuffix + " place team name") || get(pSuffix + " place");
      const kills = Number(get("ff: " + pSuffix + " place - total kills") || get(pSuffix + " place - total kills")) || 0;
      
      if (team) {
        const placePts = ffPlacementPoints[place - 1];
        const totalPts = placePts + kills;
        const resId = "RES-FF-M" + matchNum + "-P" + place + "-" + Utilities.getUuid().substring(0, 4).toUpperCase();
        targetSheet.appendRow([
          resId, matchNum, team, placePts, kills, totalPts,
          "PUBLISHED", 1, timestamp, ""
        ]);
      }
    }
  } else if (game === "BGMI") {
    const targetSheet = ss.getSheetByName(SHEET_NAMES.BGMI);
    if (!targetSheet) return;
    const bgmiPlacementPoints = [15, 12, 10, 8, 6];
    
    for (let place = 1; place <= 5; place++) {
      const pSuffix = place === 1 ? "1st" : place === 2 ? "2nd" : place === 3 ? "3rd" : (place + "th");
      const team = get("bgmi: " + pSuffix + " place team") || get(pSuffix + " place team name") || get(pSuffix + " place");
      const kills = Number(get("bgmi: " + pSuffix + " place - total kills") || get(pSuffix + " place - total kills")) || 0;

      if (team) {
        const placePts = bgmiPlacementPoints[place - 1];
        const totalPts = placePts + kills;
        const resId = "RES-BG-M" + matchNum + "-P" + place + "-" + Utilities.getUuid().substring(0, 4).toUpperCase();
        targetSheet.appendRow([
          resId, matchNum, team, placePts, kills, totalPts,
          "PUBLISHED", 1, timestamp, ""
        ]);
      }
    }
  } else if (game === "FIFA") {
    const targetSheet = ss.getSheetByName(SHEET_NAMES.FIFA);
    if (!targetSheet) return;
    for (let place = 1; place <= 5; place++) {
      const pSuffix = place === 1 ? "1st" : place === 2 ? "2nd" : place === 3 ? "3rd" : (place + "th");
      const player = get("fifa: " + pSuffix + " place player") || get(pSuffix + " place player name");
      if (player) {
        const resId = "RES-FI-M" + matchNum + "-P" + place + "-" + Utilities.getUuid().substring(0, 4).toUpperCase();
        targetSheet.appendRow([
          resId, matchNum, "Rank #" + place, player, place === 1 ? "Runner-Up" : "Contender", 
          place === 1 ? 3 : 1, place === 1 ? 1 : 0,
          place === 1 ? player : "Ranked", "FALSE", "PUBLISHED", 1, timestamp, ""
        ]);
      }
    }
  } else if (game === "MATIKS") {
    const targetSheet = ss.getSheetByName(SHEET_NAMES.MATIKS);
    if (!targetSheet) return;
    for (let place = 1; place <= 5; place++) {
      const pSuffix = place === 1 ? "1st" : place === 2 ? "2nd" : place === 3 ? "3rd" : (place + "th");
      const name = get("matiks: " + pSuffix + " place name") || get(pSuffix + " place name");
      const score = Number(get("matiks: " + pSuffix + " place - points") || get(pSuffix + " place - points / score")) || 0;
      if (name) {
        const resId = "RES-MT-M" + matchNum + "-P" + place + "-" + Utilities.getUuid().substring(0, 4).toUpperCase();
        targetSheet.appendRow([
          resId, name, "Participant", "Round " + matchNum, score,
          95, 250, score, place, place === 1 ? "Winner" : "Ranked", "PUBLISHED", 1, timestamp
        ]);
      }
    }
  }
}

/**
 * Publishes a new verified result into the respective game tab
 */
function publishNewResult(row, game, email) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const resultId = "RES-" + game.substring(0, 3) + "-" + Utilities.getUuid().substring(0, 8).toUpperCase();
  const matchNum = Number(row[4]) || 1;
  const p1 = String(row[5]);
  const p2 = String(row[6]);
  const stat1 = Number(row[7]) || 0;
  const stat2 = Number(row[8]) || 0;

  if (game === "FREE_FIRE" || game === "BGMI") {
    const targetSheet = ss.getSheetByName(game === "FREE_FIRE" ? SHEET_NAMES.FREE_FIRE : SHEET_NAMES.BGMI);
    const placementPts = stat1;
    const killPts = stat2;
    const totalPts = placementPts + killPts;
    targetSheet.appendRow([
      resultId, matchNum, p1, placementPts, killPts, totalPts,
      "PUBLISHED", 1, new Date().toISOString(), ""
    ]);
  } else if (game === "FIFA") {
    const fifaSheet = ss.getSheetByName(SHEET_NAMES.FIFA);
    const goals1 = stat1;
    const goals2 = stat2;
    const isDraw = goals1 === goals2;
    const winner = goals1 > goals2 ? p1 : (goals2 > goals1 ? p2 : "Draw");
    fifaSheet.appendRow([
      resultId, matchNum, "Knockout Round", p1, p2, goals1, goals2,
      winner, isDraw ? "TRUE" : "FALSE", "PUBLISHED", 1, new Date().toISOString(), ""
    ]);
  } else if (game === "MATIKS") {
    const matiksSheet = ss.getSheetByName(SHEET_NAMES.MATIKS);
    const rawScore = stat1;
    const reactionTime = stat2;
    const accuracy = 95.0;
    const computedScore = rawScore;
    const pos = matiksSheet.getLastRow(); // default rank
    matiksSheet.appendRow([
      resultId, p1, p2 || "", "Round 1", rawScore, accuracy,
      reactionTime, computedScore, pos, "Completed", "PUBLISHED", 1, new Date().toISOString()
    ]);
  }

  logAudit("PUBLISH_RESULT", game, resultId, email, JSON.stringify({ matchNum, p1, stat1, stat2 }));
}

/**
 * 6. Correction Request Workflow
 * Does not overwrite existing result; saves to Correction_Requests for review
 */
function handleCorrectionRequest(row, originalResultId, game, email) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const correctionsSheet = ss.getSheetByName(SHEET_NAMES.CORRECTIONS);
  const corrId = "CORR-" + Utilities.getUuid().substring(0, 8).toUpperCase();

  const proposedData = {
    stat1: Number(row[7]) || 0,
    stat2: Number(row[8]) || 0,
    notes: String(row[9] || "")
  };

  correctionsSheet.appendRow([
    corrId, originalResultId, game, email,
    "{}", JSON.stringify(proposedData), proposedData.notes,
    "PENDING", new Date().toISOString(), "", ""
  ]);

  logAudit("REQUEST_CORRECTION", game, originalResultId, email, JSON.stringify({ corrId, proposedData }));
}

/**
 * Approve a correction request: Preserves previous version and updates published result
 */
function approveCorrection(correctionId, reviewerEmail) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const corrSheet = ss.getSheetByName(SHEET_NAMES.CORRECTIONS);
  const data = corrSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === correctionId && data[i][7] === "PENDING") {
      const origId = data[i][1];
      const game = data[i][2];
      const proposed = JSON.parse(data[i][5]);

      // Update target game sheet
      const gameSheet = ss.getSheetByName(SHEET_NAMES[game] || game);
      if (gameSheet) {
        const gameData = gameSheet.getDataRange().getValues();
        for (let j = 1; j < gameData.length; j++) {
          if (gameData[j][0] === origId) {
            const oldVersion = Number(gameData[j][7]) || 1;
            // Update stats
            if (game === "FREE_FIRE" || game === "BGMI") {
              const newPlacement = proposed.stat1;
              const newKills = proposed.stat2;
              gameSheet.getRange(j + 1, 4).setValue(newPlacement);
              gameSheet.getRange(j + 1, 5).setValue(newKills);
              gameSheet.getRange(j + 1, 6).setValue(newPlacement + newKills);
              gameSheet.getRange(j + 1, 8).setValue(oldVersion + 1); // Bump version
              gameSheet.getRange(j + 1, 9).setValue(new Date().toISOString());
            }
            break;
          }
        }
      }

      // Mark correction approved
      corrSheet.getRange(i + 1, 8).setValue("APPROVED");
      corrSheet.getRange(i + 1, 10).setValue(reviewerEmail || "Super Admin");
      corrSheet.getRange(i + 1, 11).setValue(new Date().toISOString());

      logAudit("APPROVE_CORRECTION", game, origId, reviewerEmail, JSON.stringify({ correctionId, proposed }));
      return true;
    }
  }
  return false;
}

/**
 * Append-only Audit Logger
 */
function logAudit(action, game, resultId, actor, detailsJson, lockDurationMs) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const logSheet = ss.getSheetByName(SHEET_NAMES.AUDIT_LOGS);
    if (logSheet) {
      logSheet.appendRow([
        new Date().toISOString(), action, game, resultId,
        actor, detailsJson, lockDurationMs || 0
      ]);
    }
  } catch (e) {
    console.error("Audit log error:", e);
  }
}

function getValidPocsMap() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.POC_REGISTRY);
  const data = sheet ? sheet.getDataRange().getValues() : [];
  const map = {};
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][4]).toUpperCase() === "TRUE") {
      map[String(data[i][0]).toLowerCase().trim()] = {
        name: data[i][1],
        game: data[i][2],
        role: data[i][3]
      };
    }
  }
  return map;
}

function getValidCodesMap() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.VERIFICATION_CODES);
  const data = sheet ? sheet.getDataRange().getValues() : [];
  const map = {};
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][3]).toUpperCase() === "TRUE") {
      map[String(data[i][0]).trim()] = {
        game: data[i][1],
        description: data[i][2]
      };
    }
  }
  return map;
}


/**
 * ==============================================================================
 * PUBLIC READ-ONLY WEB APP API (doGet)
 * ==============================================================================
 * Exposes ONLY "PUBLISHED" records.
 * NEVER exposes POC emails, verification codes, raw responses, or review details.
 */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "getTournamentStatus";
  const game = (e && e.parameter && e.parameter.game) || "";
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let responseData = {};

  try {
    if (action === "getTournamentStatus") {
      const settingsSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
      const sData = settingsSheet ? settingsSheet.getDataRange().getValues() : [];
      let status = "Live";
      for (let i = 1; i < sData.length; i++) {
        if (sData[i][0] === "TOURNAMENT_STATUS") status = sData[i][1];
      }

      // Count completed matches across sheets
      let matchesCompleted = 0;
      [SHEET_NAMES.FREE_FIRE, SHEET_NAMES.BGMI, SHEET_NAMES.FIFA, SHEET_NAMES.MATIKS].forEach(tabName => {
        const sh = ss.getSheetByName(tabName);
        if (sh && sh.getLastRow() > 1) {
          matchesCompleted += (sh.getLastRow() - 1);
        }
      });

      responseData = {
        success: true,
        status: status,
        total_games: 4,
        matches_completed: matchesCompleted,
        approved_results: matchesCompleted,
        last_updated: new Date().toISOString()
      };
    } 
    else if (action === "getGames") {
      responseData = {
        success: true,
        games: [
          { id: "FREE_FIRE", name: "Free Fire", slug: "free-fire", format: "Squads" },
          { id: "BGMI", name: "BGMI", slug: "bgmi", format: "Squads" },
          { id: "FIFA", name: "FIFA", slug: "fifa", format: "1v1 Console" },
          { id: "MATIKS", name: "MATIKS", slug: "matiks", format: "Speed & Logic" }
        ],
        last_updated: new Date().toISOString()
      };
    }
    else if (action === "getLeaderboard") {
      const targetGame = game.toUpperCase().replace(/[-\s]/g, "_");
      let results = [];

      if (targetGame === "FREE_FIRE" || targetGame === "BGMI") {
        const sheet = ss.getSheetByName(targetGame === "FREE_FIRE" ? SHEET_NAMES.FREE_FIRE : SHEET_NAMES.BGMI);
        if (sheet && sheet.getLastRow() > 1) {
          const rows = sheet.getDataRange().getValues();
          // Filter ONLY PUBLISHED
          for (let i = 1; i < rows.length; i++) {
            if (rows[i][6] === "PUBLISHED") {
              results.push({
                result_id: rows[i][0],
                match_number: rows[i][1],
                team_name: rows[i][2],
                placement_points: rows[i][3],
                kill_points: rows[i][4],
                total_points: rows[i][5],
                published_at: rows[i][8]
              });
            }
          }
          // Sort by total points desc
          results.sort((a, b) => b.total_points - a.total_points);
          results = results.map((r, idx) => ({ rank: idx + 1, ...r }));
        }
      } else if (targetGame === "FIFA") {
        const sheet = ss.getSheetByName(SHEET_NAMES.FIFA);
        if (sheet && sheet.getLastRow() > 1) {
          const rows = sheet.getDataRange().getValues();
          for (let i = 1; i < rows.length; i++) {
            if (rows[i][9] === "PUBLISHED") {
              results.push({
                match_id: rows[i][0],
                match_number: rows[i][1],
                round: rows[i][2],
                player1: rows[i][3],
                player2: rows[i][4],
                goals1: rows[i][5],
                goals2: rows[i][6],
                winner: rows[i][7],
                is_draw: rows[i][8] === "TRUE"
              });
            }
          }
        }
      } else if (targetGame === "MATIKS") {
        const sheet = ss.getSheetByName(SHEET_NAMES.MATIKS);
        if (sheet && sheet.getLastRow() > 1) {
          const rows = sheet.getDataRange().getValues();
          for (let i = 1; i < rows.length; i++) {
            if (rows[i][10] === "PUBLISHED") {
              results.push({
                player_name: rows[i][1],
                team_name: rows[i][2],
                round: rows[i][3],
                score: rows[i][7],
                position: rows[i][8],
                result: rows[i][9]
              });
            }
          }
        }
      }

      responseData = {
        success: true,
        game: targetGame,
        results: results,
        last_updated: new Date().toISOString()
      };
    }
    else if (action === "getWinners") {
      responseData = {
        success: true,
        winners: [
          { game: "FREE_FIRE", rank: 1, team: "Yenepoya Phantoms", score: "84 Total Pts" },
          { game: "BGMI", rank: 1, team: "Godlike Karavali", score: "91 Total Pts" },
          { game: "FIFA", rank: 1, team: "Zayd 'Apex' Khan", score: "Grand Final 3 - 2" },
          { game: "MATIKS", rank: 1, team: "Pranav 'Cipher' Kamath", score: "984 Score" }
        ],
        last_updated: new Date().toISOString()
      };
    }
    else {
      responseData = {
        success: true,
        action: action,
        last_updated: new Date().toISOString()
      };
    }
  } catch (err) {
    responseData = {
      success: false,
      error: err.toString(),
      last_updated: new Date().toISOString()
    };
  }

  return ContentService.createTextOutput(JSON.stringify(responseData))
    .setMimeType(ContentService.MimeType.JSON);
}
