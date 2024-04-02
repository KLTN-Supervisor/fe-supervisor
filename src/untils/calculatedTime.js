import { differenceInYears, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, parseISO } from 'date-fns';

export function calculatedTime(start) {
    const timeStart = parseISO(start);
    const timeEnd = Date.now();
    const secondsDiff = differenceInSeconds(timeEnd, timeStart);
    let result;
    if(secondsDiff<60){
        result = secondsDiff.toString() + "s"
    } else if (secondsDiff < 3600){
        const minutesDiff = differenceInMinutes(timeEnd, timeStart);
        result = minutesDiff.toString() + "m"
    } else if (secondsDiff < 86400){
        const hoursDiff = differenceInHours(timeEnd, timeStart);
        result = hoursDiff.toString() + "h"
    } else if (secondsDiff < 604800){
        const daysDiff = differenceInDays(timeEnd, timeStart);
        result = daysDiff.toString() + "d"
    } else if (secondsDiff < 31449600){
        const daysDiff = differenceInDays(timeEnd, timeStart);
        const weeksDiff = Math.floor(daysDiff / 7);
        result = weeksDiff.toString() + "w"
    } else{
        const yearsDiff = differenceInYears(timeEnd, timeStart);
        result = yearsDiff.toString() + "y"
    }
    console.log(result);
    return result;
}