#!/usr/bin/env node
// One-off migration: pulls your data out of the old PocketBase server and
// writes it as a Time logger backup file you can load via "Restore" in the app.
//
// Usage:
//   PB_PASSWORD=... node scripts/export-from-pocketbase.mjs <server-url> <email> [output.json]
//
// Requires Node 18+ (built-in fetch). Talks to the PocketBase 0.7 REST API.

import { writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';

const COLLECTIONS = [
  'projects',
  'workhour_details',
  'workday_logs',
  'signatures',
  'companies',
  'companies_contract_details',
];

const [serverUrl, email, output = 'time-logger-backup-from-server.json'] = process.argv.slice(2);
if (!serverUrl || !email) {
  console.error('Usage: PB_PASSWORD=... node scripts/export-from-pocketbase.mjs <server-url> <email> [output.json]');
  process.exit(1);
}

const baseUrl = serverUrl.replace(/\/+$/, '');

async function askPassword() {
  if (process.env.PB_PASSWORD) {
    return process.env.PB_PASSWORD;
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const password = await rl.question('Password: ');
  rl.close();
  return password;
}

async function request(path, token, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `User ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`${init.method || 'GET'} ${path} failed: ${response.status} ${await response.text()}`);
  }
  return response;
}

async function listAll(collection, token) {
  const items = [];
  for (let page = 1; ; page++) {
    const response = await request(`/api/collections/${collection}/records?page=${page}&perPage=200`, token);
    const body = await response.json();
    items.push(...body.items);
    if (page >= body.totalPages) {
      return items;
    }
  }
}

async function fileToDataUrl(record, fileName, token) {
  const collectionId = record['@collectionId'];
  const response = await request(`/api/files/${collectionId}/${record.id}/${encodeURIComponent(fileName)}`, token);
  const mime = response.headers.get('content-type') || 'image/jpeg';
  const buffer = Buffer.from(await response.arrayBuffer());
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

function clean(record) {
  // Drop PocketBase metadata (@collectionId, @expand, ...) and the per-user owner field.
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => !key.startsWith('@') && key !== 'userId'),
  );
}

const password = await askPassword();
const auth = await (await request('/api/users/auth-via-email', null, {
  method: 'POST',
  body: JSON.stringify({ email, password }),
})).json();

const collections = {};
for (const name of COLLECTIONS) {
  const records = await listAll(name, auth.token);

  if (name === 'signatures') {
    for (const record of records) {
      record.field = record.field ? await fileToDataUrl(record, record.field, auth.token) : '';
    }
  }

  collections[name] = records.map(clean);
  console.log(`${name}: ${records.length}`);
}

const backup = {
  app: 'time-logger',
  version: 1,
  exportedAt: new Date().toISOString(),
  collections,
};

await writeFile(output, JSON.stringify(backup, null, 2));
console.log(`Saved ${output}. Open the app and use "Restore" to load it.`);
