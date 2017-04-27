(function() {
  var cards = document.getElementsByClassName('card');

  function hideCards() {
    Array.prototype.forEach.call(cards, function(el, i) {
      el.classList.add('hide');
    });
  }

  function showCards() {
    Array.prototype.forEach.call(cards, function(el, i) {
      setTimeout(function() {
        el.classList.remove('hide');
        el.classList.add('animate');
      }, 150 * (i + 1));
    });
  }

  hideCards();

  window.addEventListener('load', function() {
    setTimeout(function() {
      showCards();
    }, 300);
  });
}());
