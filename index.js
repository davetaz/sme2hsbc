// app.js
const express = require("express");
const { keyboard, Key, sleep } = require("@nut-tree-fork/nut-js");

keyboard.config.autoDelayMs = 80;         // Default is 300ms
keyboard.config.delayBetweenKeystrokes = 80; // Controls typing speed

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post("/run-selector", async (req, res) => {
  const rows = req.body.rows;
  for (const row of rows) {
    await keyboard.type(row.accountNumber);
    await keyboard.type(Key.Enter);
    await sleep(2000);
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
    await sleep(300); // small delay between rows
  }
  res.json({ success: true });
});

app.post("/run-data-entry", async (req, res) => {
  //await keyboard.type(Key.Tab);
  
  const rows = req.body.rows;
  for (const row of rows) {
    await keyboard.type(row.reference);
    await keyboard.type(Key.Tab);
    await keyboard.type(row.amount);
    await keyboard.type(Key.Tab);
    await keyboard.type(Key.Tab);
    await sleep(300);
  }

  res.json({ success: true });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));

