export const getPercentages = (items: any[], total: number) => {
  const raw = items.map((item, index) => ({
    ...item,
    index,
    rawPercent: (item.count / (total || 1)) * 100
  }));

  const floored = raw.map(item => ({
    ...item,
    percent: Math.floor(item.rawPercent)
  }));

  let sum = floored.reduce((acc, item) => acc + item.percent, 0);
  let diff = 100 - sum;

  const sorted = [...floored].sort(
    (a, b) => (b.rawPercent % 1) - (a.rawPercent % 1)
  );

  for (let i = 0; i < diff; i++) {
    sorted[i].percent += 1;
  }

  // 👇 clave: volver al orden original
  return sorted.sort((a, b) => a.index - b.index);
};
