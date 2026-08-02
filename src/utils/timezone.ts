export function getTimezoneOffsetHours(): number {
  return -(new Date().getTimezoneOffset() / 60);
}
