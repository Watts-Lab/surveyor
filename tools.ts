/** @format */

export const dataError = (key: string, dictionary: any) => {
  if (typeof dictionary !== "object")
    throw `Data error, no ${key} due to no dictionary:\n\n${dictionary}\n`
  if (!(key in dictionary)) throw `Data error, no ${key}`
  if (dictionary[key] === "") throw `Data error, ${key} is not set`
}

export const pick = (narray: any[], draws = 1) => {
  const array = [...narray]
  if (draws < 1) return array
  if (array.length < 1) return array
  const choice = array.splice(Math.floor(Math.random() * array.length), 1)[0]
  if (draws === 1) return choice
  return [choice].concat(pick(array, draws - 1))
}
