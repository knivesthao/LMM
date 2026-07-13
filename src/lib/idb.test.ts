import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  storeScene,
  getScene,
  isSceneDownloaded,
  getDownloadedScenes,
  removeContent,
} from './idb';

const DB_NAME = 'lmm-content';

/**
 * Delete the test database between each test to ensure isolation.
 */
function deleteDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

beforeEach(async () => {
  await deleteDB();
});

describe('storeScene', () => {
  it('stores a scene and allows retrieval via getScene', async () => {
    await storeScene('abc', 1, '<p>Hello</p>', 'https://example.com/1');

    const html = await getScene('abc', 1);
    expect(html).toBe('<p>Hello</p>');
  });

  it('stores multiple scenes under the same contentId', async () => {
    await storeScene('abc', 1, '<p>One</p>', 'https://example.com/1');
    await storeScene('abc', 2, '<p>Two</p>', 'https://example.com/2');

    expect(await getScene('abc', 1)).toBe('<p>One</p>');
    expect(await getScene('abc', 2)).toBe('<p>Two</p>');
  });

  it('overwrites an existing scene', async () => {
    await storeScene('abc', 1, '<p>Old</p>', 'https://example.com/old');
    await storeScene('abc', 1, '<p>New</p>', 'https://example.com/new');

    const html = await getScene('abc', 1);
    expect(html).toBe('<p>New</p>');
  });
});

describe('getScene', () => {
  it('returns null for a scene that was never stored', async () => {
    const result = await getScene('nonexistent', 99);
    expect(result).toBeNull();
  });

  it('returns null when the contentId matches but the sceneNumber does not', async () => {
    await storeScene('abc', 1, '<p>Hello</p>', 'https://example.com/1');

    const result = await getScene('abc', 2);
    expect(result).toBeNull();
  });
});

describe('isSceneDownloaded', () => {
  it('returns true for a stored scene', async () => {
    await storeScene('abc', 1, '<p>Hello</p>', 'https://example.com/1');

    const downloaded = await isSceneDownloaded('abc', 1);
    expect(downloaded).toBe(true);
  });

  it('returns false for a missing scene', async () => {
    const downloaded = await isSceneDownloaded('abc', 1);
    expect(downloaded).toBe(false);
  });

  it('returns false when the contentId matches but the sceneNumber does not', async () => {
    await storeScene('abc', 1, '<p>Hello</p>', 'https://example.com/1');

    const downloaded = await isSceneDownloaded('abc', 2);
    expect(downloaded).toBe(false);
  });
});

describe('getDownloadedScenes', () => {
  it('returns an empty array when nothing is stored', async () => {
    const scenes = await getDownloadedScenes('abc');
    expect(scenes).toEqual([]);
  });

  it('returns the scene numbers for a given contentId', async () => {
    await storeScene('abc', 1, '<p>One</p>', 'https://example.com/1');
    await storeScene('abc', 3, '<p>Three</p>', 'https://example.com/3');
    await storeScene('abc', 5, '<p>Five</p>', 'https://example.com/5');

    const scenes = await getDownloadedScenes('abc');
    expect(scenes).toEqual(expect.arrayContaining([1, 3, 5]));
    expect(scenes).toHaveLength(3);
  });

  it('only returns scenes for the matching contentId', async () => {
    await storeScene('abc', 1, '<p>A</p>', 'https://example.com/a');
    await storeScene('xyz', 2, '<p>B</p>', 'https://example.com/b');

    const abcScenes = await getDownloadedScenes('abc');
    expect(abcScenes).toEqual([1]);

    const xyzScenes = await getDownloadedScenes('xyz');
    expect(xyzScenes).toEqual([2]);
  });
});

describe('removeContent', () => {
  it('deletes all scenes for a contentId', async () => {
    await storeScene('abc', 1, '<p>One</p>', 'https://example.com/1');
    await storeScene('abc', 2, '<p>Two</p>', 'https://example.com/2');

    await removeContent('abc');

    expect(await getScene('abc', 1)).toBeNull();
    expect(await getScene('abc', 2)).toBeNull();
    expect(await getDownloadedScenes('abc')).toEqual([]);
  });

  it('does not affect scenes with a different contentId', async () => {
    await storeScene('abc', 1, '<p>A</p>', 'https://example.com/a');
    await storeScene('xyz', 2, '<p>B</p>', 'https://example.com/b');

    await removeContent('abc');

    // 'abc' scenes are gone
    expect(await getScene('abc', 1)).toBeNull();

    // 'xyz' scenes remain untouched
    expect(await getScene('xyz', 2)).toBe('<p>B</p>');
    expect(await isSceneDownloaded('xyz', 2)).toBe(true);
  });

  it('resolves gracefully when there is nothing to delete', async () => {
    await expect(removeContent('nonexistent')).resolves.toBeUndefined();
  });
});
