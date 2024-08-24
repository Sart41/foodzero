// document.documentElement.style.overflow = 'hidden'

const targetElement = document.querySelector('h1');
const animatedElement = document.querySelector('.animation-text');
const container = document.querySelector(".animation-text__overlay");

let virtualScrollY = 0; // Текущее "виртуальное" значение прокрутки
const maxVirtualScroll = window.innerHeight; // Максимальная "виртуальная" высота прокрутки

let startX, startY, targetX, targetY

const targetFontSize = parseFloat(window.getComputedStyle(targetElement).fontSize)
const startFontSize = parseFloat(window.getComputedStyle(animatedElement).fontSize)

const setInitialCoordinates = () => {
  targetX = targetElement.getBoundingClientRect().left
  targetY = targetElement.getBoundingClientRect().top

  startX = animatedElement.getBoundingClientRect().left
  startY = animatedElement.getBoundingClientRect().top

  animatedElement.style.position = 'absolute';
  animatedElement.style.left = `${startX}px`;
  animatedElement.style.top = `${startY}px`;
}

const animateText = (scrollPercent) => {
  const newX = startX + (targetX - startX) * scrollPercent;
  const newY = startY + (targetY - startY) * scrollPercent;
  const newFontSize = startFontSize - (startFontSize - targetFontSize) * scrollPercent;

  animatedElement.style.fontSize = `${newFontSize}px`;
  animatedElement.style.transform = `translate(${newX - startX}px, ${newY - startY}px)`;
  container.style.backgroundColor = `rgba(35, 48, 0, ${1 - scrollPercent})`;
}

const handleScroll = (event) => {
  event.preventDefault()

  virtualScrollY += event.deltaY;
  virtualScrollY = Math.max(0, Math.min(virtualScrollY, maxVirtualScroll));

  const scrollPercent = virtualScrollY / maxVirtualScroll;

  if (scrollPercent >= 1) {
    container.style.display = 'none'
    targetElement.style.opacity = '0.57'
    window.removeEventListener("wheel", handleScroll)
  }
  animateText(scrollPercent);
}

const onAnimationEnd = () => {
  requestAnimationFrame(() => {
    setInitialCoordinates();
  });
  animatedElement.removeEventListener("animationend", onAnimationEnd);
}

window.addEventListener("wheel", handleScroll, { passive: false });

animatedElement.addEventListener("animationend", onAnimationEnd)

// const observer = new MutationObserver(() => {
//   // Проверяем, завершена ли анимация
//   const computedStyle = window.getComputedStyle(animatedElement);
//   if (computedStyle.animationName === 'text-scale' && computedStyle.animationPlayState === 'paused') {
//     setCoordinates();
//     observer.disconnect(); // Отключаем наблюдателя после установки координат
//   }
// });

// observer.observe(animatedElement, { attributes: true, attributeFilter: ['style'] });

// window.addEventListener("load", () => {
//   requestAnimationFrame(() => {
//     setInitialCoordinates();
//   });
// });
