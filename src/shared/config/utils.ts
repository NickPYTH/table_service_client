import dayjs from "dayjs";

export function formatDate(date: Date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
};

export function formatDateTime(date: Date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes();
    return `${day}.${month}.${year} ${hour < 10 ? "0"+hour : hour}:${minute < 10 ? "0"+minute : minute}`;
};

export function isValidDateString(dateString: string) {
    const date = dayjs(dateString, "DD.MM.YYYY")
    return date.isValid();
};
