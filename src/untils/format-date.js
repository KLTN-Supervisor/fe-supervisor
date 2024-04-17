export function formatDate(date) {
    const dateOfBirth = new Date(date);
    const formattedDate = `${dateOfBirth.getDate().toString().padStart(2, '0')}/${(dateOfBirth.getMonth() + 1).toString().padStart(2, '0')}/${dateOfBirth.getFullYear()}`;
    return formattedDate;
}