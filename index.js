// app.js
const express = require("express");
const { keyboard, Key, sleep } = require("@nut-tree-fork/nut-js");
let cancelled = false;

keyboard.config.autoDelayMs = 80;         // Default is 300ms
keyboard.config.delayBetweenKeystrokes = 80; // Controls typing speed

const app = express();

app.use(express.json());
app.use(express.static("public"));

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3001 });

let connectedClient = null;

wss.on('connection', (ws) => {
  console.log('Client connected');
  connectedClient = ws;
});

app.post("/run-selector", async (req, res) => {
  const rows = req.body.rows;
  for (const row of rows) {
    if (connectedClient && connectedClient.readyState === WebSocket.OPEN) {
      connectedClient.send(JSON.stringify({
        type: 'row',
        data: row
      }));
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
    if (cancelled) break;
    await keyboard.pressKey(Key.LeftShift);
    await keyboard.type(Key.Tab);
    await keyboard.type(Key.Tab);
    await keyboard.type(Key.Tab);
    await keyboard.releaseKey(Key.LeftShift);
    await sleep(300); // small delay between rows
  }
  res.json({ success: true });
});

app.post("/run-data-entry", async (req, res) => {
  //await keyboard.type(Key.Tab);
  
  const rows = req.body.rows;
  for (const row of rows) {
    if (connectedClient && connectedClient.readyState === WebSocket.OPEN) {
      connectedClient.send(JSON.stringify({
        type: 'row',
        data: row
      }));
    }
    if (cancelled) break;
    await keyboard.type(row.reference);
    if (cancelled) break;
    await keyboard.type(Key.Tab);
    if (cancelled) break;
    await keyboard.type(row.amount);
    await keyboard.type(Key.Tab);
    await keyboard.type(Key.Tab);
    await sleep(300);
    if (cancelled) break;
  }

  res.json({ success: true });
});

app.post("/go", (req, res) => {
  cancelled = false;
  res.json({ success: true });
});

app.post("/stop", (req, res) => {
  cancelled = true;
  res.json({ success: true });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));

