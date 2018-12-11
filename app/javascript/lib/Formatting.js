
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

  if (feet > feetPerMile) {
    const miles = Math.floor(feet / feetPerMile);
    feet = Math.round(feet % feetPerMile);

    return `${miles} mi ${feet}'`
  }

  return `${Math.round(feet)}'`
}