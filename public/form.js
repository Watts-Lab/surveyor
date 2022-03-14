var currPage = 0

renderPage(currPage)

function renderPage(page) {
  var pages = document.getElementsByClassName("page")
  pages[page].style.display = "block"

  if (page == 0) {
    document.getElementById("prevBtn").style.display = "none";
  } else {
    document.getElementById("prevBtn").style.display = "inline";
  }
  if (page == (pages.length - 1)) {
    document.getElementById("nextBtn").innerHTML = "Submit";
  } else {
    document.getElementById("nextBtn").innerHTML = "Next";
  }
}

function nextPrev(n) {
  var pages = document.getElementsByClassName("page")
  if (n == 1 && !validateForm()) return false;

  pages[currPage].style.display = "none"
  currPage = currPage + n
  
  if (currPage >= pages.length) {
    document.getElementById("surveyForm").submit()
    return false;
  }

  renderPage(currPage)
}

function validateForm() {
  return true;
}