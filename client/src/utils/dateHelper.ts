export const localDateTimeToUTC = (localDateTime: string): string => {
  if (!localDateTime) return '';
  const date = new Date(localDateTime);
  return date.toISOString();
};
