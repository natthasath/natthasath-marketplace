/**
 * ebook-drive — Google Apps Script (Drive Queue + Web App)
 * ------------------------------------------------------------------
 * WHY THIS EXISTS
 * Claude usually runs inside a network-sandboxed environment that can only
 * reach an allowlist of domains — it cannot fetch an arbitrary PDF URL
 * directly, and even if it could, passing a multi-MB binary file through a
 * single tool call is impractical.
 *
 * This script moves the actual file transfer onto Google's own servers:
 *   1. It fetches the source URL using UrlFetchApp — Google's
 *      infrastructure has full internet access, no sandbox restriction.
 *   2. It saves the result straight into your Google Drive using
 *      DriveApp — the bytes never have to pass through Claude at all.
 *
 * ------------------------------------------------------------------
 * TWO WAYS TO TRIGGER IT
 *
 * MODE A — DRIVE QUEUE (recommended, fully automatic)
 *   Claude writes a job into `_queue.json` inside your Drive folder using
 *   its authenticated Google Drive connector. A time-based trigger runs
 *   processQueue() every minute, picks up pending jobs, downloads them, and
 *   writes the results back into the same file.
 *
 *   Why this matters: Claude never makes an HTTP request to
 *   script.google.com at all. In several sandboxes (Cowork in particular)
 *   that domain is blocked at the network proxy with HTTP 403, which used
 *   to force a manual click. Drive becomes the message bus instead, and
 *   Drive is reachable because it is a first-party authenticated connector
 *   rather than a raw web fetch. Zero clicks required.
 *
 * MODE B — WEB APP (fallback, kept for compatibility)
 *   The original doGet/doPost path. Still useful if you want to trigger a
 *   download yourself from a browser, or from an environment where
 *   script.google.com is reachable.
 *
 * ------------------------------------------------------------------
 * ONE-TIME SETUP — see references/setup-guide.md for click-by-click steps.
 *   1. Paste this whole file into a new Apps Script project (script.google.com).
 *   2. Replace SECRET_TOKEN below with your own random string.
 *   3. Run installTrigger() once from the editor (enables MODE A).
 *   4. Optionally also Deploy > New deployment > Web app (enables MODE B).
 *
 * SECURITY NOTE
 * The queue file lives in your own Drive folder, so MODE A needs no secret
 * to be shared anywhere — only you and apps you have authorised can write
 * to it. For MODE B, anyone holding both the deployment URL AND the secret
 * token can make this script save files into your target folder (they
 * cannot read or modify anything else in your Drive).
 */
 
// TODO: replace with your own long random string before deploying.
// Only used by MODE B (web app). MODE A does not need it.
var SECRET_TOKEN = 'REPLACE_WITH_YOUR_OWN_SECRET';
 
// Folder Claude saves books into. Jobs may override this per-job.
var DEFAULT_FOLDER = 'ebook';
 
// Name of the queue file Claude writes jobs into.
var QUEUE_FILENAME = '_queue.json';
 
// Max jobs handled in a single trigger run. Keeps each run well inside the
// 6-minute Apps Script execution limit even for large files.
var MAX_JOBS_PER_RUN = 3;
 
 
/* ==================================================================
 * MODE A — DRIVE QUEUE
 * ================================================================== */
 
/**
 * Run this ONCE from the Apps Script editor to enable automatic mode.
 * Removes any previous copy of the trigger first so it is safe to re-run.
 */
function installTrigger() {
  var existing = ScriptApp.getProjectTriggers();
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].getHandlerFunction() === 'processQueue') {
      ScriptApp.deleteTrigger(existing[i]);
    }
  }
  ScriptApp.newTrigger('processQueue')
    .timeBased()
    .everyMinutes(1)
    .create();
  Logger.log('Trigger installed: processQueue() will run every minute.');
}
 
/**
 * Remove the automatic trigger (stops MODE A).
 */
function uninstallTrigger() {
  var existing = ScriptApp.getProjectTriggers();
  var removed = 0;
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].getHandlerFunction() === 'processQueue') {
      ScriptApp.deleteTrigger(existing[i]);
      removed++;
    }
  }
  Logger.log('Removed ' + removed + ' trigger(s).');
}
 
/**
 * The worker. Invoked by the time-based trigger once a minute.
 * Reads _queue.json, processes pending jobs, writes results back.
 */
function processQueue() {
  // Serialise runs so an overlapping trigger can never double-download a job
  // or clobber the results file mid-write.
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return; // another run is already working; try again next minute
  }
 
  try {
    var folder = getOrCreateFolder(DEFAULT_FOLDER);
    var queueFile = findFileByName(folder, QUEUE_FILENAME);
    if (!queueFile) {
      return; // nothing queued yet
    }
 
    var queue;
    try {
      queue = JSON.parse(queueFile.getBlob().getDataAsString());
    } catch (parseErr) {
      return; // Claude may be mid-write; leave it alone and retry next run
    }
 
    if (!queue || !queue.jobs || !queue.jobs.length) {
      return;
    }
 
    var processed = 0;
    var changed = false;
 
    for (var i = 0; i < queue.jobs.length && processed < MAX_JOBS_PER_RUN; i++) {
      var job = queue.jobs[i];
      if (!job || job.status !== 'pending') {
        continue;
      }
 
      processed++;
      changed = true;
      job.startedAt = new Date().toISOString();
 
      var result = downloadToDrive(job.url, job.filename, job.folder || DEFAULT_FOLDER);
 
      if (result.success) {
        job.status = 'done';
        job.fileId = result.fileId;
        job.fileName = result.fileName;
        job.fileSizeBytes = result.fileSizeBytes;
        job.driveUrl = result.url;
      } else {
        job.status = 'error';
        job.error = result.error;
      }
      job.finishedAt = new Date().toISOString();
    }
 
    if (changed) {
      queue.lastRunAt = new Date().toISOString();
      queueFile.setContent(JSON.stringify(queue, null, 2));
    }
  } catch (err) {
    Logger.log('processQueue failed: ' + err);
  } finally {
    lock.releaseLock();
  }
}
 
 
/* ==================================================================
 * MODE B — WEB APP (unchanged behaviour)
 * ================================================================== */
 
function doGet(e) {
  return handleRequest(e);
}
 
function doPost(e) {
  return handleRequest(e);
}
 
function handleRequest(e) {
  var params = (e && e.parameter) || {};
  try {
    if (!SECRET_TOKEN) {
      return jsonOutput({ success: false, error: 'SECRET_TOKEN not configured in the script' });
    }
    if (params.secret !== SECRET_TOKEN) {
      return jsonOutput({ success: false, error: 'unauthorized' });
    }
 
    if (!params.url || !params.filename) {
      return jsonOutput({ success: false, error: 'missing required "url" or "filename" parameter' });
    }
 
    var result = downloadToDrive(
      params.url,
      params.filename,
      params.folder || DEFAULT_FOLDER,
      params.overwrite !== 'false'
    );
    return jsonOutput(result);
  } catch (err) {
    return jsonOutput({ success: false, error: String(err) });
  }
}
 
 
/* ==================================================================
 * SHARED CORE — used by both modes
 * ================================================================== */
 
/**
 * Fetch a URL and save it into Drive as a PDF.
 * Returns a plain object; never throws.
 */
function downloadToDrive(sourceUrl, filename, folderName, overwrite) {
  if (overwrite === undefined) {
    overwrite = true;
  }
  try {
    if (!sourceUrl || !filename) {
      return { success: false, error: 'missing url or filename' };
    }
 
    var response = UrlFetchApp.fetch(sourceUrl, {
      muteHttpExceptions: true,
      followRedirects: true,
      validateHttpsCertificates: true
    });
 
    var code = response.getResponseCode();
    if (code < 200 || code >= 300) {
      return { success: false, error: 'source URL returned HTTP ' + code };
    }
 
    var blob = response.getBlob();
 
    // Guard against sites that return an HTML error/login/paywall page with a
    // 200 status instead of the actual PDF — check the standard PDF magic
    // bytes so we never silently save junk into Drive.
    var bytes = blob.getBytes();
    var header = '';
    for (var i = 0; i < Math.min(5, bytes.length); i++) {
      header += String.fromCharCode(bytes[i] & 0xff);
    }
    if (header.indexOf('%PDF') !== 0) {
      return {
        success: false,
        error: 'downloaded content is not a valid PDF (content-type: ' + blob.getContentType() + ')'
      };
    }
 
    if (!/\.pdf$/i.test(filename)) {
      filename = filename + '.pdf';
    }
    blob.setName(filename);
 
    var folder = getOrCreateFolder(folderName);
 
    if (overwrite) {
      var existing = folder.getFilesByName(filename);
      while (existing.hasNext()) {
        existing.next().setTrashed(true);
      }
    }
 
    var file = folder.createFile(blob);
 
    return {
      success: true,
      fileId: file.getId(),
      fileName: file.getName(),
      fileSizeBytes: file.getSize(),
      url: file.getUrl(),
      folder: folderName
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
 
function findFileByName(folder, name) {
  var it = folder.getFilesByName(name);
  return it.hasNext() ? it.next() : null;
}
 
function getOrCreateFolder(name) {
  var folders = DriveApp.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(name);
}
 
function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
 