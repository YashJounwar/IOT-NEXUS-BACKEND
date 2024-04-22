export function currentDateFormat(currentDate){

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    const targetDate = `${day}-${month}-${year}`;
    return targetDate;
}
