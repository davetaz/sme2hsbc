const express = require("express");
const path = require("path");
const { keyboard, Key, sleep } = require("@nut-tree-fork/nut-js");
const WebSocket = require('ws');
let cancelled = false;

keyboard.config.autoDelayMs = 80;
keyboard.config.delayBetweenKeystrokes = 80;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const wss = new WebSocket.Server({ port: 3001 });
let connectedClient = null;

wss.on('connection', (ws) => {
  console.log('Client connected');
  connectedClient = ws;
});

app.post("/go", (req, res) => {
  cancelled = false;
  res.json({ success: true });
});

app.post("/stop", (req, res) => {
  cancelled = true;
  res.json({ success: true });
});

app.post("/run-selector", async (req, res) => {
  const rows = req.body.rows;
  for (const row of rows) {
    if (connectedClient?.readyState === WebSocket.OPEN) {
      connectedClient.send(JSON.stringify({ type: 'row', data: row }));
    }
    if (cancelled) break;
    await keyboard.type(row.accountNumber);
    if (cancelled) break;
    await keyboard.type(Key.Enter);
    await sleep(2000);
    if (cancelled) break;
    await keyboard.type(Key.Tab);
    await keyboard.type(Key.Tab);
    await keyboard.type(Key.Tab);
    await keyboard.type(Key.Space);
    await sleep(300);
    await keyboard.pressKey(Key.LeftShift);
    await keyboard.type(Key.Tab);
    await keyboard.type(Key.Tab);
    await keyboard.type(Key.Tab);
    await keyboard.releaseKey(Key.LeftShift);
    await sleep(300);
  }
  res.json({ success: true });
});

app.post("/run-data-entry", async (req, res) => {
  const rows = req.body.rows;
  for (const row of rows) {
    if (connectedClient?.readyState === WebSocket.OPEN) {
      connectedClient.send(JSON.stringify({ type: 'row', data: row }));
    }
    if (cancelled) break;
    await keyboard.type(row.reference);
    if (cancelled) break;
    await keyboard.type(Key.Tab);
    await keyboard.type(row.amount);
    await keyboard.type(Key.Tab);
    await keyboard.type(Key.Tab);
    await sleep(300);
  }
  res.json({ success: true });
});

app.listen(3000, () => {
  console.log("✅ Express server running at http://localhost:3000");
});