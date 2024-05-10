const numberRegex = /^\d*$/

export const preprocessValue = (
  newValue: string,
  value: string,
  {
    firstLetterUppercase,
    maxDigits,
    maxLines,
    multiline,
    onlyNumbers,
  }: {
    onlyNumbers?: boolean
    maxDigits?: number
    firstLetterUppercase?: boolean
    multiline?: boolean
    maxLines?: number
  }
) => {
  //* Breaking constraints
  // Only numbers
  if (onlyNumbers && !numberRegex.test(newValue)) return value

  //* Mutating constraints
  // No multiline by default
  if (!multiline && newValue.includes("\n")) newValue = newValue.replace(/\n/g, "")
  // Max lines
  if (maxLines) {
    const lines = newValue.split("\n")
    if (lines.length > maxLines) newValue = lines.slice(0, maxLines).join("\n")
  }
  // Max digits
  if (maxDigits && newValue.length > maxDigits) newValue = newValue.substring(0, maxDigits)
  // First letter uppercase
  if (firstLetterUppercase) newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1)
  return newValue
}
