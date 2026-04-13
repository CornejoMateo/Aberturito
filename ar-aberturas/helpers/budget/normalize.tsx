export const normalize = (str: string) =>
    str
        .toLowerCase()
        .normalize("NFD") // separa acentos
        .replace(/[\u0300-\u036f]/g, "") // elimina acentos
        .trim();