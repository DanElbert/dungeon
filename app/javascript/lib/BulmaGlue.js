
function initEach(selector, func) {
  const elements = Array.prototype.slice.call(document.querySelectorAll(selector), 0);

  if (elements.length > 0) {
    elements.forEach(el => {
      func(el);
    });
  }
}


document.addEventListener('DOMContentLoaded', () => {

  initEach('.navbar-burger', el => {
    el.addEventListener('click', () => {

      // Get the target from the "data-target" attribute
      const target = el.dataset.target;
      const $target = document.getElementById(target);

      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      el.classList.toggle('is-active');
      $target.classList.toggle('is-active');

    });
  });

  initEach("input[type='file'].file-input", el => {
    el.addEventListener("change", () => {
      if (el.files.length > 0) {
        const nameLabel = el.parentElement.querySelector(".file-name");
        nameLabel.innerHTML = el.files[0].name;
      }
    });
  });

});