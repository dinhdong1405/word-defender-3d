import { describe, it, expect, beforeEach } from 'vitest';
import { STORE_CATALOG, DEFAULT_INVENTORY_SEED } from '../../config/catalog';
import {
  getStyleColor,
  getSpriteForOutfit,
  HALLOWEEN_SPRITE_URLS,
  BASKETBALL_SPRITE_URLS,
  SOCCER_SPRITE_URLS,
  BUILDER_SPRITE_URLS,
  GLADIATOR_SPRITE_URLS,
} from '../../game/assets/PonpiRenderer';
import { equipItem, unequipItem } from '../../economy/inventory';
import { db } from '../../data/db';

describe('5 New Skins & Color Customization', () => {
  const newSkinIds = [
    'outfit_halloween',
    'outfit_basketball',
    'outfit_soccer',
    'outfit_builder',
    'outfit_gladiator',
  ];

  it('contains all 5 new skins in STORE_CATALOG with valid properties', () => {
    for (const skinId of newSkinIds) {
      const item = STORE_CATALOG.find((i) => i.id === skinId);
      expect(item).toBeDefined();
      expect(item?.category).toBe('outfit');
      expect(item?.title.length).toBeGreaterThan(0);
      expect(item?.description.length).toBeGreaterThan(0);
      expect(item?.priceCoins).toBeGreaterThan(0);
      expect(item?.iconUrl).toBeDefined();
    }
  });

  it('contains Purple and Lavender color styles in STORE_CATALOG', () => {
    const lavender = STORE_CATALOG.find((i) => i.id === 'style_lavender');
    const purple = STORE_CATALOG.find((i) => i.id === 'style_purple');
    expect(lavender).toBeDefined();
    expect(purple).toBeDefined();

    expect(getStyleColor('style_lavender')).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(getStyleColor('style_purple')).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('provides all 6 action pose URLs for all 5 new skins', () => {
    const maps = [
      HALLOWEEN_SPRITE_URLS,
      BASKETBALL_SPRITE_URLS,
      SOCCER_SPRITE_URLS,
      BUILDER_SPRITE_URLS,
      GLADIATOR_SPRITE_URLS,
    ];

    const requiredPoses = ['idle', 'fire_up', 'fire_up_left', 'fire_up_right', 'fire_left', 'fire_right'] as const;

    for (const map of maps) {
      for (const pose of requiredPoses) {
        expect(map[pose]).toBeDefined();
        expect(map[pose].length).toBeGreaterThan(0);
      }
    }
  });

  it('resolves correct sprite elements for all outfits and poses', () => {
    for (const skinId of newSkinIds) {
      const sprite = getSpriteForOutfit(skinId, 'idle');
      expect(sprite).toBeDefined();
      expect(sprite instanceof Image).toBe(true);
    }
  });

  it('allows equipping any of the 5 skins alongside a purple body style', async () => {
    await db.inventories.clear();
    const profileId = 'guest_profile';

    await db.inventories.add({
      profileId,
      ownedItemIds: [
        'style_yellow',
        'style_lavender',
        'style_purple',
        ...newSkinIds,
      ],
      equippedHatId: null,
      equippedShirtId: null,
      equippedStyleId: 'style_yellow',
      equippedSkillIds: [],
    });

    // 1. Equip purple style
    await equipItem('style', 'style_purple');
    let inv = await db.inventories.get(profileId);
    expect(inv?.equippedStyleId).toBe('style_purple');

    // 2. Equip Basketball skin
    await equipItem('outfit', 'outfit_basketball');
    inv = await db.inventories.get(profileId);
    expect(inv?.equippedOutfitId).toBe('outfit_basketball');
    // Confirm body color remains purple!
    expect(inv?.equippedStyleId).toBe('style_purple');

    // 3. Equip Halloween skin
    await equipItem('outfit', 'outfit_halloween');
    inv = await db.inventories.get(profileId);
    expect(inv?.equippedOutfitId).toBe('outfit_halloween');
    expect(inv?.equippedStyleId).toBe('style_purple');

    // 4. Unequip outfit back to default Ponpi with purple body
    await unequipItem('outfit');
    inv = await db.inventories.get(profileId);
    expect(inv?.equippedOutfitId).toBeNull();
    expect(inv?.equippedStyleId).toBe('style_purple');
  });

  it('includes all 5 new skins and purple styles in DEFAULT_INVENTORY_SEED', () => {
    for (const skinId of newSkinIds) {
      expect(DEFAULT_INVENTORY_SEED.ownedItemIds).toContain(skinId);
    }
    expect(DEFAULT_INVENTORY_SEED.ownedItemIds).toContain('style_lavender');
    expect(DEFAULT_INVENTORY_SEED.ownedItemIds).toContain('style_purple');
  });
});
