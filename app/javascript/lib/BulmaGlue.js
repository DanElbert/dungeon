
function initEach(selector, func) {
  const elements = Array.prototype.slice.call(document.querySelectorAll(selector), 0);

  if (elements.length > 0) {
    elements.forEach(el => {
      func(el);
    });
  }
}

function setupNavbarBurger(el) {
  el.addEventListener('click', () => {

    // Get the target from the "data-target" attribute
    const target = el.dataset.target;
    const $target = document.getElementById(target);

    // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
    el.classList.toggle('is-active');
    $target.classList.toggle('is-active');

  });
}

document.addEventListener('DOMContentLoaded', () => {

  initEach('.navbar-burger', el => {
    setupNavbarBurger(el);
  });

});


export { setupNavbarBurger };