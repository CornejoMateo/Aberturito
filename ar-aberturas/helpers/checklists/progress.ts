export const calculateProgress = (items: any[] = []) => {
    if (items.length === 0) return 100;
    const completed = items.filter((item) => item.done).length;
    return Math.round((completed / items.length) * 100);
};