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
const othercheck = el => {
  const conditionals = document.getElementsByClassName("conditional");
  Array.from(conditionals).forEach(c => {
    const condition = c.innerHTML.split(" | ");
    if (condition[0] == el.name) {
      if (condition[1] == el.value) {
        c.parentNode.hidden = false;
        Array.from(c.parentNode.getElementsByTagName("input")).forEach(
          i => (i.required = true)
        );
      } else {
        c.parentNode.hidden = true;
        Array.from(c.parentNode.getElementsByTagName("input")).forEach(
          i => (i.required = false)
        );
      }
    }
  });
};