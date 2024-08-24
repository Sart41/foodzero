import { register } from 'swiper/element';
import { Navigation, Pagination } from 'swiper/modules';

document.addEventListener('DOMContentLoaded', function () {
  register();

  const feedbackSlider = document.querySelector('.home-feedback__slider');

  const params = {
    modules: [Navigation, Pagination],

    pagination: {
      el: '.home-feedback__pagination',
      clickable: true,
      type: 'fraction'
    },

    navigation: {
      nextEl: '.home-feedback__btn-next',
      prevEl: '.home-feedback__btn-prev',
    },
    // injectStylesUrls: '/src/widgets/feedback-slider/feedback_slider.scss',
  }

  Object.assign(feedbackSlider, params);
  feedbackSlider.initialize();
})