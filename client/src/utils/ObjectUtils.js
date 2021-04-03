export function isEmptyObject(obj) {
  if (obj === undefined || obj === null || Object.keys(obj).length === 0) {
    return true;
  }
  return false;
}

export function isNonEmptyObject(obj) {
  if (obj !== undefined && obj !== null && Object.keys(obj).length > 0) {
    return true;
  }
  return false;
}

export function isNonEmptyString(str) {
  if (str === undefined || str === null || !str || str.trim().length  === 0) {
    return false;
  }
  return true;
}

export function isEmptyString(str) {
  if (str === undefined || str === null ||  !str ||  str.trim().length === 0) {
    return true;
  }
  return false;
}
