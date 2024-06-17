export function formatDate(date) {
  const dateOfBirth = new Date(date);
  const formattedDate = `${dateOfBirth
    .getDate()
    .toString()
    .padStart(2, "0")}/${(dateOfBirth.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${dateOfBirth.getFullYear()}`;

  return formattedDate;
}

export function formatHour(datetime) {
  const time = new Date(datetime);
  const formattedHour = `${time.getHours().toString().padStart(2, "0")}:${time
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
  return formattedHour;
}

export function formatDateExtend(date) {
  const dateOfBirth = new Date(date);
  const formattedDate = `${dateOfBirth
    .getDate()
    .toString()
    .padStart(2, "0")}.${(dateOfBirth.getMonth() + 1)
    .toString()
    .padStart(2, "0")}.${dateOfBirth.getFullYear()}`;

  return formattedDate;
}

export function formatHourExtend(datetime) {
  const time = new Date(datetime);
  const formattedHour = `${time.getHours().toString().padStart(2, "0")}.${time
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
  return formattedHour;
}

export function formatDateSpecial(dateString) {
  const [day, month, year] = dateString.split('/');
  return `${day}.${month}.${year}`;
}
