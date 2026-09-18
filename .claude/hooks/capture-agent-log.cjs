#!/usr/bin/env node
'use strict';

/**
 * Claude Code hook: appends verbatim user prompts and final assistant
 * responses to a per-session Markdown log under .agent-logs/.
 *
 * Invoked as:
 *   node capture-agent-log.js UserPromptSubmit   (stdin: UserPromptSubmit payload)
 *   node capture-agent-log.js Stop               (stdin: Stop payload)
 *
 * Never throws into the conversation and never prints to stdout/stderr:
 * any failure here degrades to a silent no-op so it can't disrupt a turn.
 */

const fs = require('fs');
const path = require('path');

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    try {
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', (chunk) => { data += chunk; });
      process.stdin.on('end', () => resolve(data));
      process.stdin.on('error', () => resolve(data));
    } catch (err) {
      resolve('');
    }
  });
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function fileTimestampUtc(date) {
  return (
    `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}` +
    `_${pad(date.getUTCHours())}-${pad(date.getUTCMinutes())}-${pad(date.getUTCSeconds())}`
  );
}

function sanitizeSessionId(id) {
  const str = String(id || 'unknown-session');
  return str.replace(/[^a-zA-Z0-9-]/g, '_');
}

function findExistingLogFile(logsDir, sessionId) {
  let entries;
  try {
    entries = fs.readdirSync(logsDir);
  } catch (err) {
    return null;
  }
  const suffix = `_${sessionId}.md`;
  const match = entries.find((name) => name.endsWith(suffix));
  return match ? path.join(logsDir, match) : null;
}

// Picks a backtick-fence long enough that it cannot be closed early by
// backtick runs already present inside the captured text.
function codeFenceFor(text) {
  const runs = text.match(/`+/g) || [];
  const longest = runs.reduce((max, run) => Math.max(max, run.length), 0);
  return '`'.repeat(Math.max(3, longest + 1));
}

function fencedBlock(text) {
  const fence = codeFenceFor(text);
  return `${fence}text\n${text}\n${fence}`;
}

// Best-effort only: reads the JSONL transcript to find the model name of
// the most recent assistant message. Never used for response text itself
// (last_assistant_message is the source of truth for that), only for the
// model label in the log header.
function extractModelFromTranscript(transcriptPath) {
  if (!transcriptPath) return null;
  try {
    const content = fs.readFileSync(transcriptPath, 'utf8');
    const lines = content.split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (!line) continue;
      let entry;
      try {
        entry = JSON.parse(line);
      } catch (err) {
        continue;
      }
      const model = entry && entry.message && entry.message.model;
      if (typeof model === 'string' && model) {
        return model;
      }
    }
  } catch (err) {
    // best-effort only
  }
  return null;
}

function ensureLogFile(logsDir, sessionIdRaw, sessionId, now) {
  const existing = findExistingLogFile(logsDir, sessionId);
  if (existing) return existing;

  const fileName = `${fileTimestampUtc(now)}_${sessionId}.md`;
  const filePath = path.join(logsDir, fileName);
  const header =
    `# Agent Capture Log\n\n` +
    `- Session ID: ${sessionIdRaw}\n` +
    `- Log created (UTC): ${now.toISOString()}\n` +
    `- Model: _pending_\n\n` +
    `---\n\n`;

  try {
    // 'wx' fails if the file already exists, avoiding a race that would
    // otherwise overwrite a concurrently created log for the same session.
    fs.writeFileSync(filePath, header, { flag: 'wx' });
    return filePath;
  } catch (err) {
    // Another process may have just created it (or it now exists for some
    // other reason) - prefer whatever is on disk over creating a duplicate.
    const raced = findExistingLogFile(logsDir, sessionId);
    return raced || filePath;
  }
}

function setModelInHeader(filePath, model) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('- Model: _pending_')) {
      fs.writeFileSync(filePath, content.replace('- Model: _pending_', `- Model: ${model}`));
    }
  } catch (err) {
    // best-effort only
  }
}

function appendSafely(filePath, text) {
  try {
    fs.appendFileSync(filePath, text);
  } catch (err) {
    // never throw into the conversation
  }
}

async function main() {
  const eventName = process.argv[2] || 'unknown-event';
  const raw = await readStdin();

  let input = {};
  try {
    input = raw ? JSON.parse(raw) : {};
  } catch (err) {
    return; // malformed input - silently do nothing
  }

  const sessionIdRaw = input.session_id || 'unknown-session';
  const sessionId = sanitizeSessionId(sessionIdRaw);
  const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const logsDir = path.join(projectDir, '.agent-logs');

  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch (err) {
    return;
  }

  const now = new Date();
  const logFile = ensureLogFile(logsDir, sessionIdRaw, sessionId, now);
  const timestamp = now.toISOString();

  if (eventName === 'UserPromptSubmit') {
    const prompt = typeof input.prompt === 'string' ? input.prompt : '';
    const block =
      `## Turn - ${timestamp}\n\n` +
      `### User Prompt (verbatim)\n\n` +
      `${fencedBlock(prompt)}\n\n`;
    appendSafely(logFile, block);
  } else if (eventName === 'Stop') {
    const response =
      typeof input.last_assistant_message === 'string' ? input.last_assistant_message : '';
    const model = extractModelFromTranscript(input.transcript_path) || 'unknown';

    const block =
      `### Assistant Final Response (verbatim) - ${timestamp}\n\n` +
      `${fencedBlock(response)}\n\n` +
      `---\n\n`;
    appendSafely(logFile, block);
    setModelInHeader(logFile, model);
  }
}

main()
  .catch(() => {})
  .finally(() => {
    process.exit(0);
  });
