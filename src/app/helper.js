export const createSlug = (name) => {
  if (!name) return "";

  return name
    .toString()
    .normalize("NFD")                 // Handle accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")             // Replace &
    .replace(/[^a-z0-9]+/g, "-")      // Replace non-alphanumeric with -
    .replace(/-{2,}/g, "-")           // Remove multiple -
    .replace(/^-+|-+$/g, "");         // Trim - from start/end
};
