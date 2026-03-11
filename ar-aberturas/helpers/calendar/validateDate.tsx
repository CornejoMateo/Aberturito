import { isBefore, startOfDay } from 'date-fns';

export function validateDate(date: Date | undefined): string | null {
    if (!date) {
        return 'La fecha es requerida';
    }

    if (isBefore(startOfDay(date), startOfDay(new Date()))) {
        return 'No se pueden crear eventos en fechas pasadas';
    }

    return null;
}
