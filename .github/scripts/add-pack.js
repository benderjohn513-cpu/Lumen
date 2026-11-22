// Reads an issue-form body, checks the pack link, and appends it to docs/packs.json.
const fs = require('fs'), zlib = require('zlib');
const body = process.env.BODY || '';
const field = h => { const m = body.match(new RegExp(`### ${h}\\s*\\n+([\\s\\S]*?)(?=\\n### |$)`)); const v = m ? m[1].replace(/```\w*/g, '').trim() : ''; return v === '_No response_' ? '' : v; };
const link = field('Pack link').split(/\s+/)[0];
const d = (link.match(/^lumen:\/\/pack\/?([A-Za-z0-9_-]+)/i) || link.match(/#([A-Za-z0-9_-]{8,})$/) || [])[1];
if (!d) throw new Error('No pack link');
let bytes = Buffer.from(d.slice(1), 'base64url'); if (d[0] === '1') bytes = zlib.inflateRawSync(bytes);
const p = JSON.parse(bytes.toString('utf8'));
if (p.lumenPack !== 1 || !Array.isArray(p.addons) || !p.addons.length) throw new Error('Not a Lumen pack');
// Lumen strips keys when it makes a pack; refuse anything that still looks like one (a Real-Debrid key is 52 letters/numbers)
const raw = JSON.stringify(p).replace(/\{\{\w+\}\}/g, '');
if (/(?<![A-Za-z0-9])[A-Z0-9]{52}(?![A-Za-z0-9])/.test(raw)) throw new Error('Pack still holds a key');
const clip = (s, n) => String(s || '').replace(/[\r\n]+/g, ' ').trim().slice(0, n);
const g = JSON.parse(fs.readFileSync('docs/packs.json', 'utf8'));
const page = `https://${process.env.GITHUB_REPOSITORY.split('/')[0].toLowerCase()}.github.io/${process.env.GITHUB_REPOSITORY.split('/')[1]}/pack#${d}`;
g.packs = g.packs.filter(x => x.issue !== +process.env.ISSUE);
g.packs.unshift({ name: clip(field('Pack name') || p.name, 60), by: clip(field('Your name or alias') || p.by, 40), about: clip(field("What it's for") || p.about, 200),
  free: !!p.free, count: p.addons.length, link: page, issue: +process.env.ISSUE, added: new Date().toISOString().slice(0, 10) });
fs.writeFileSync('docs/packs.json', JSON.stringify(g, null, 2) + '\n');
console.log('Added', g.packs[0].name);
