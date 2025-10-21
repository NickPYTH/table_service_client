export function formatDate(date: Date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
};

export function isValidDateString(dateString: string) {
    const date = new Date(dateString.replace(".", "-"));
    //@ts-ignore
    return date instanceof Date && !isNaN(date);
};
