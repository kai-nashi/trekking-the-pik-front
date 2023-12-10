export function measurement(value: number, postfix= '₽') {
    const [valueAsNumber, error] = validateNumber(value)
    if (error) {
        return error
    }

    const price = valueAsNumber.toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true,
    }).replace(/,/g, ".")

    return postfix ? `${price} ${postfix}` : price
}


export function validateNumber(value: any): [number, string | null] {
    const valueAsNumber = Number(value)
    if (isNaN(valueAsNumber)) {
        return [0, 'Invalid Number']
    } else {
        return [valueAsNumber, null]
    }
}
