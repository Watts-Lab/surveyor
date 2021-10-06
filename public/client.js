function clientThrow(message) {
  let errorBlock = document.createElement("code");
  errorBlock.innerHTML = message;
  console.log(typeof errorBlock);
  document.body.prepend(errorBlock);
}

// function dataError(key, dictionary) {
//   if (typeof dictionary !== "object")
//     clientThrow(
//       `Data error, no <strong>${key}</strong> due to no dictionary:\n\n${dictionary}\n`
//     );
//   if (!dictionary.hasOwnProperty(key))
//     clientThrow(`Data error, no <strong>${key}</strong>`);
//   if (dictionary[key] === "")
//     clientThrow(`Data error, <strong>${key}</strong> is not set`);
// }

// function pick(array) {
//   return array[Math.floor(Math.random() * array.length)];
// }

const details = {};
function countDetails(id) {
  details[id] ? (details[id] += 1) : (details[id] = 1);
  document.getElementById(id + "_input").value = details[id];
}
