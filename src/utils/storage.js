export function loadJSON(key, defaultValue) {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultValue;
}

export function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}