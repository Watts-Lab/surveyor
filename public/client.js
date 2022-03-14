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
function othercheck (obj){
  val = obj.value;
  if (val.includes("#")) {
    var inputElem = document.createElement('input');
                    inputElem.id = val.substring(1);
                    inputElem.setAttribute('name', val.substring(1));
                    inputElem.setAttribute('value', val.substring(1));
                    inputElem.setAttribute('placeholder', 'Ajuste' + i);
                    inputElem.setAttribute('type', 'text');
                    inputElem.setAttribute('required', true);
                    inputElem.nodeName = val.substring(1);
                    inputElem.style.margin = '5px';
    groupElem.appendChild(inputElem);
    document.getElementById("adjustments").appendChild(groupElem);
  }
}