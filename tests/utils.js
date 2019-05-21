export function assertEqual(firstValue, secondValue) {
  if (firstValue != secondValue)
    throw new Error('Assert failed, ' + firstValue + ' is not equal to ' + secondValue + '.');
}

export function assertNotEqual(firstValue, secondValue) {
  if (firstValue === secondValue)
    throw new Error('Assert failed, ' + firstValue + ' is equal to ' + secondValue + '.');
}
