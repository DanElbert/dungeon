
export function feetToText(feet) {
  const feetPerMile = 5280;
  const inchesPerFoot = 12;

  if (feet < 5) {
    const inches = Math.round((feet - Math.floor(feet)) * inchesPerFoot);
    feet = Math.floor(feet);
    if (inches !== 0) {
      return `${feet}' ${inches}"`;
    } else {
      return `${feet}'`;
    }
  }

  if (feet > 2000) {
    let miles = Math.floor((feet / feetPerMile) * 10) / 10.0;
    return `${miles} mi`
  }

  return `${Math.round(feet)}'`
}