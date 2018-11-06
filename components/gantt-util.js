export function resetHMS(d) {
  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
}
export function resetHMSfromEpoc(epoc) {
  return resetHMS(new Date(epoc)).getTime();
}
export function roundHMSfromEpoc(epoc) {
  return resetHMS(new Date(epoc + (24 * 60 * 60 * 1000) / 2)).getTime();
}
export function getRelativeDate(day) {
  let d = new Date();
  resetHMS(d);
  d.setDate(d.getDate() + day);
  return d;
}
export function getNewDate(str, offset) {
  let d = new Date(str);
  resetHMS(d);
  if (offset !== undefined) {
    d.setDate(d.getDate() + offset);
  }
  return d;
}
