import '/src/widgets/feedback-slider/feedback_slider.js'


// import './style.css'
// import javascriptLogo from './javascript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.js'

// document.querySelector('#app').innerHTML = `
//   <div>
//     <a href="https://vitejs.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
//       <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
//     </a>
//     <h1>Hello Vite!</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite logo to learn more
//     </p>
//   </div>
// `

// setupCounter(document.querySelector('#counter'))


import AirDatepicker from 'air-datepicker'
import flatpickr from "flatpickr";


const timePicker = flatpickr("#timePicker", {
  enableTime: true,
  noCalendar: true,
  dateFormat: "H:i",
  minTime: "8:00",
  maxTime: "19:00",
  time_24hr: true,
  // isMobile: true,
  defaultHour: "9",
  defaultMinute: "00",
  allowInput: true,
  minuteIncrement: 15,
  onClose: function (selectedDates, dateStr, instance) {
    let date = selectedDates[0];

    if (date) {
      let minutes = date.getMinutes();
      let roundedMinutes = Math.round(minutes / 15) * 15;
      if (this.parseDate(dateStr) < this.config.minTime) {
        date = this.config.minTime;
        // alert('В это время мы еще закрыты!')
      } else if (this.parseDate(dateStr) > this.config.maxTime) {
        date = this.config.maxTime;
      } else {
        date.setMinutes(roundedMinutes);
      }
      instance.setDate(date, true);
    }
  }
});


const datePicker = flatpickr('#datePicker', {
  minDate: "today",
  defaultDate: "today",
  dateFormat: "d-m-Y"
})



const onSubmitHadle = (event) => {
  event.preventDefault()
  const date = datePicker.selectedDates[0]
  const time = timePicker.selectedDates[0]
  if (!(date && time)) {
    console.log('enter date and time');
    return
  }

  date.setHours(time.getHours())
  date.setMinutes(time.getMinutes())

  console.log(date);

  createDialog(date, time)
}

const bookingForm = document.querySelector('#bookingForm').addEventListener('submit', onSubmitHadle);

const createDialog = (date, time, guests = 2) => {
  const dialog = document.querySelector('#popup')
  const popupContent = dialog.querySelector('.popup__content')

  let content = `<h3>World</h3>`




  // popupContent.innerHTML = content
  dialog.showModal()
}