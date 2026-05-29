import test from 'node:test';
import assert from 'node:assert';
import { encode, decode, parseUrl } from '../src/index.js';

test('codec roundtrip', async () => {
  const sampleXml = '<PathOfBuilding><Build level="100" class="Witch"></Build></PathOfBuilding>';
  const encoded = await encode(sampleXml);

  assert.ok(typeof encoded === 'string');
  assert.ok(encoded.length > 0);

  assert.ok(!encoded.includes('+'));
  assert.ok(!encoded.includes('/'));
  assert.ok(!encoded.includes('='));

  const decoded = await decode(encoded);
  assert.strictEqual(decoded, sampleXml);
});

test('decode with different paddings and standard base64', async () => {
  const sampleXml = 'hello world';
  const standardB64 = 'eJzLSM3JyVcozy/KSQEAGgsEXQ==';
  const urlSafeUnpadded = 'eJzLSM3JyVcozy_KSQEAGgsEXQ';

  const decoded1 = await decode(standardB64);
  assert.strictEqual(decoded1, sampleXml);

  const decoded2 = await decode(urlSafeUnpadded);
  assert.strictEqual(decoded2, sampleXml);
});

test('parseUrl validations', () => {
  const cases = [
    {
      url: 'https://pobb.in/eQVFNoqVZrza',
      expected: { id: 'eQVFNoqVZrza', rawUrl: 'https://pobb.in/eQVFNoqVZrza/raw' }
    },
    {
      url: 'http://www.pobb.in/u/test_user/abc1234',
      expected: { id: 'test_user/abc1234', rawUrl: 'https://pobb.in/u/test_user/abc1234/raw' }
    },
    {
      url: 'pobb.in/eQVFNoqVZrza/raw',
      expected: { id: 'eQVFNoqVZrza', rawUrl: 'https://pobb.in/eQVFNoqVZrza/raw' }
    },
  ];

  for (const tc of cases) {
    const res = parseUrl(tc.url);
    assert.deepStrictEqual(res, tc.expected);
  }

  assert.strictEqual(parseUrl('https://google.com'), null);
});
