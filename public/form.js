var currPage = 0

renderPage(currPage)

function renderPage(page) {
  var pages = document.getElementsByClassName("page")
  pages[page].style.display = "block"

  if (page == 0) {
    document.getElementById("prevBtn").style.display = "none";
    document.getElementById("nextBtn").style.display = "inline";
    document.getElementById("submit").style.display = "none";
  } else if (page == (pages.length - 1)) {
    document.getElementById("prevBtn").style.display = "inline";
    document.getElementById("nextBtn").style.display = "none";
    document.getElementById("submit").style.display = "inline"; 
  } else {
    document.getElementById("prevBtn").style.display = "inline";
    document.getElementById("nextBtn").style.display = "inline";
    document.getElementById("submit").style.display = "none";
  }

  window.scrollTo(0, 0);


}

function nextPrev(n) {
  var pages = document.getElementsByClassName("page")
  if (n == 1 && !validateForm()) return false;

  pages[currPage].style.display = "none"
  currPage = currPage + n
  
  if (currPage >= pages.length) {
    return false;
  }

  renderPage(currPage)
}

function validateForm(req) {
  var pages = document.getElementsByClassName("page")
  var inputBoxes = pages[currPage].getElementsByClassName("inputbox")
  
  console.log(inputBoxes)
  console.log(inputBoxes.length)
  for (let idx=0; idx < inputBoxes.length; idx ++) {
    var input = inputBoxes[idx].getElementsByTagName("input")
    console.log(input)
    if (input.length > 1) {
      var checked = false
      console.log(idx)
      for (let i = 0; i < input.length; i++) {
        checked = checked || input[i].checked
      }

      if (!checked) {
        alert("Please answer all questions on the page")
        return false
      }
       
    } else if (input[idx].value == "") {
      return false
    }
  }

  return true
}