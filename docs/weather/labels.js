// Potlačení kolizí popisků u markerů.
//
// Bubliny s teplotou se nikdy neskrývají — nesou data. Skrývá se jen název
// lokality, a to tehdy, když by zasahoval do cizí bubliny nebo do popisku,
// který si místo nárokoval dřív. Pořadí určuje priorita, ne pořadí ve vstupu.

const overlaps = (a, b, padding) => a.left - padding < b.right
  && a.right + padding > b.left
  && a.top - padding < b.bottom
  && a.bottom + padding > b.top;

/**
 * @param {Array<{id: string, priority: number, badge: object, label: object|null}>} items
 *   obdélníky ve společné souřadnicové soustavě (left/right/top/bottom)
 * @param {number} padding minimální odstup mezi popisky v pixelech
 * @returns {Set<string>} identifikátory lokalit, jejichž popisek se má skrýt
 */
export function hideCollidingLabels(items, padding = 3) {
  const hidden = new Set();
  const badges = items.filter((item) => item.badge).map((item) => ({ id: item.id, rect: item.badge }));
  const placed = [];

  const byPriority = [...items]
    .filter((item) => item.label)
    .sort((a, b) => a.priority - b.priority);

  for (const item of byPriority) {
    // Proti bublinám se měří skutečný překryv: popisek smí těsně sousedit se
    // spodkem cizí bubliny, protože jsou to zjevně různé prvky. Odstup má smysl
    // jen mezi dvěma texty, aby nesplynuly v jeden.
    const blockedByBadge = badges.some((b) => b.id !== item.id && overlaps(item.label, b.rect, 0));
    const blockedByLabel = placed.some((rect) => overlaps(item.label, rect, padding));

    if (blockedByBadge || blockedByLabel) hidden.add(item.id);
    else placed.push(item.label);
  }

  return hidden;
}
