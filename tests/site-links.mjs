import assert from 'node:assert/strict';
import { test } from 'node:test';
import { gardenerWebsiteUrl, legacyGardenerUrl } from '../lib/site-links.mjs';

test('Gardener links accept a dedicated HTTPS origin', () => {
  assert.equal(gardenerWebsiteUrl(' https://gardener.example.test/ '), 'https://gardener.example.test');
  assert.equal(gardenerWebsiteUrl('https://crossomics-gardener.vercel.app'), 'https://crossomics-gardener.vercel.app');
});

test('missing, unsafe, or Community targets cannot create redirects', () => {
  for (const value of ['', 'invalid', 'http://gardener.example.test', '//gardener.example.test',
    'https://user:password@gardener.example.test', 'https://gardener.example.test/path',
    'https://gardener.example.test/?redirect=/community', 'https://gardener.example.test/#part',
    'https://cross-omics.com', 'https://www.cross-omics.com', 'https://cross-omics-website.vercel.app',
    'https://cross-omics-website-git-branch-team.vercel.app']) {
    assert.equal(gardenerWebsiteUrl(value), null, value);
    assert.equal(legacyGardenerUrl(['about'], {}, value), null, value);
  }
});

test('known product routes retain nested paths and repeated query parameters', () => {
  assert.equal(legacyGardenerUrl(['tutorial','setup','sphere-node'], {from:'old site',tag:['one','two']}, 'https://gardener.example.test'),
    'https://gardener.example.test/tutorial/setup/sphere-node?from=old+site&tag=one&tag=two');
  for (const path of ['about','tutorial','tutorial/analysis','tutorial/pipelines','research','approach','roadmap','future','value']) {
    assert.equal(legacyGardenerUrl(path.split('/'), {}, 'https://gardener.example.test'), 'https://gardener.example.test/' + path);
  }
});

test('unknown, Community, and API paths cannot cross to Gardener', () => {
  for (const path of ['unknown','tutorial/unknown','community','community/mine','api/community/auth/callback','../about','about/extra']) {
    assert.equal(legacyGardenerUrl(path.split('/'), {}, 'https://gardener.example.test'), null, path);
  }
});
