/* ========================================
   Mobile Menu Toggle
   ======================================== */
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav__link');

navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.classList.toggle('active');
  navToggle.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close menu when a nav link is clicked
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Close menu when CTA is clicked
const navCta = document.querySelector('.nav__cta');
if (navCta) {
  navCta.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
}

/* ========================================
   About — Read More Toggle
   ======================================== */
const aboutWrapper = document.getElementById('about-text-wrapper');
const aboutBtn = document.getElementById('about-read-more');

if (aboutWrapper && aboutBtn) {
  aboutBtn.addEventListener('click', () => {
    const expanded = aboutWrapper.classList.toggle('expanded');
    aboutBtn.querySelector('svg');
    aboutBtn.firstChild.textContent = expanded ? 'Zwiń ' : 'Czytaj więcej ';
  });
}

/* ========================================
   FAQ Accordion
   ======================================== */
const faqItems = document.querySelectorAll('.faq__item');

faqItems.forEach(item => {
  const button = item.querySelector('.faq__question');
  button.addEventListener('click', () => {
    const isActive = item.classList.contains('active');

    // Close all other items
    faqItems.forEach(other => {
      if (other !== item) {
        other.classList.remove('active');
        other.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
      }
    });

    // Toggle current item
    item.classList.toggle('active', !isActive);
    button.setAttribute('aria-expanded', !isActive);
  });
});

/* ========================================
   Booking Calendar
   ======================================== */
(function() {
  const MONTHS_PL = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
  // dayOfWeek: 1=Mon, 2=Tue, 4=Thu
  const SLOTS_BY_DAY = {
    1: ['8:00','9:00','10:00','11:00','12:00','13:00'],
    2: ['12:00','13:00'],
    4: ['11:00','12:00','13:00','14:00']
  };
  const AVAILABLE_DAYS = [1, 2, 4]; // Mon, Tue, Thu
  const FORMSUBMIT_URL = 'https://formsubmit.co/ajax/f.szaynok@gmail.com';

  const today = new Date();
  today.setHours(0,0,0,0);

  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  let selectedDate = null;
  let selectedSlot = null;

  const calDays = document.getElementById('cal-days');
  const calMonthLabel = document.getElementById('cal-month-label');
  const calPrev = document.getElementById('cal-prev');
  const calNext = document.getElementById('cal-next');
  const timeslotsEl = document.getElementById('timeslots');
  const timeslotsLabel = document.getElementById('timeslots-label');
  const timeslotsGrid = document.getElementById('timeslots-grid');
  const selectedInfo = document.getElementById('booking-selected-info');
  const bookingForm = document.getElementById('booking-form');
  const submitBtn = document.getElementById('booking-submit');
  const statusEl = document.getElementById('booking-status');

  if (!calDays) return;

  function getMaxDate() {
    const d = new Date(today);
    d.setMonth(d.getMonth() + 2);
    return d;
  }

  function renderCalendar() {
    calMonthLabel.textContent = MONTHS_PL[currentMonth] + ' ' + currentYear;
    calDays.innerHTML = '';

    calPrev.disabled = (currentYear === today.getFullYear() && currentMonth === today.getMonth());

    const maxDate = getMaxDate();
    calNext.disabled = (currentYear > maxDate.getFullYear() || (currentYear === maxDate.getFullYear() && currentMonth >= maxDate.getMonth()));

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const startOffset = (firstDay === 0) ? 6 : firstDay - 1;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < startOffset; i++) {
      const empty = document.createElement('button');
      empty.className = 'calendar__day calendar__day--empty';
      empty.disabled = true;
      empty.type = 'button';
      calDays.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const btn = document.createElement('button');
      btn.className = 'calendar__day';
      btn.textContent = day;
      btn.type = 'button';

      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay();
      const isAvailableDay = AVAILABLE_DAYS.includes(dayOfWeek);
      const isPast = date <= today;
      const isBeyondMax = date > getMaxDate();
      const isToday = date.getTime() === today.getTime();

      if (isToday) {
        btn.classList.add('calendar__day--today', 'calendar__day--disabled');
        btn.disabled = true;
      } else if (isPast || !isAvailableDay || isBeyondMax) {
        btn.classList.add('calendar__day--disabled');
        btn.disabled = true;
      } else {
        const dateStr = currentYear + '-' + String(currentMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
        btn.dataset.date = dateStr;
        if (selectedDate && dateStr === selectedDate) {
          btn.classList.add('calendar__day--selected');
        }
        btn.addEventListener('click', () => selectDate(dateStr));
      }
      calDays.appendChild(btn);
    }
  }

  function selectDate(dateStr) {
    selectedDate = dateStr;
    selectedSlot = null;
    renderCalendar();

    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const dayName = date.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });
    timeslotsLabel.textContent = 'Dostępne godziny — ' + dayName;
    timeslotsGrid.innerHTML = '';

    const dayOfWeek = date.getDay();
    const slots = SLOTS_BY_DAY[dayOfWeek] || [];
    slots.forEach(slot => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'timeslot';
      btn.textContent = slot;
      btn.addEventListener('click', () => selectSlot(slot));
      timeslotsGrid.appendChild(btn);
    });

    timeslotsEl.style.display = 'block';
    updateFormState();
  }

  function selectSlot(slot) {
    selectedSlot = slot;
    timeslotsGrid.querySelectorAll('.timeslot').forEach(btn => {
      btn.classList.toggle('timeslot--selected', btn.textContent === slot);
    });
    updateFormState();
  }

  function updateFormState() {
    if (selectedDate && selectedSlot) {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      const formatted = date.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      selectedInfo.innerHTML = '<strong>Wybrany termin:</strong> ' + formatted + ', godz. ' + selectedSlot;
      selectedInfo.classList.add('booking__selected-info--visible');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Zarezerwuj wizytę';
    } else if (selectedDate) {
      selectedInfo.innerHTML = '<strong>Wybrany dzień:</strong> wybierz godzinę poniżej';
      selectedInfo.classList.add('booking__selected-info--visible');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wybierz godzinę';
    } else {
      selectedInfo.classList.remove('booking__selected-info--visible');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wybierz termin, aby kontynuować';
    }
  }

  function showStatus(type, message) {
    statusEl.className = 'booking__status booking__status--' + type;
    statusEl.textContent = message;
  }

  calPrev.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar();
  });

  calNext.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar();
  });

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;

    const name = document.getElementById('booking-name').value.trim();
    const phone = document.getElementById('booking-phone').value.trim();
    const note = document.getElementById('booking-note').value.trim();

    if (!name || !phone) {
      showStatus('error', 'Proszę wypełnić wymagane pola.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Wysyłanie...';
    statusEl.className = 'booking__status';

    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const dateFormatted = date.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const formData = new FormData();
    formData.append('Imię i nazwisko', name);
    formData.append('Telefon', phone);
    formData.append('Data wizyty', dateFormatted);
    formData.append('Godzina', selectedSlot);
    formData.append('Notatka', note || '(brak)');
    formData.append('_subject', 'Nowa rezerwacja wizyty — ' + name + ' — ' + dateFormatted + ' ' + selectedSlot);
    formData.append('_cc', 'piotreksedzik@gmail.com');

    fetch(FORMSUBMIT_URL, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showStatus('success', 'Rezerwacja wysłana! Skontaktuję się z Tobą SMS-owo.');
        bookingForm.reset();
        selectedDate = null;
        selectedSlot = null;
        timeslotsEl.style.display = 'none';
        selectedInfo.classList.remove('booking__selected-info--visible');
        submitBtn.textContent = 'Wybierz termin, aby kontynuować';
        submitBtn.disabled = true;
        renderCalendar();
      } else {
        showStatus('error', 'Wystąpił błąd. Spróbuj ponownie lub skontaktuj się telefonicznie.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Zarezerwuj wizytę';
      }
    })
    .catch(() => {
      showStatus('error', 'Błąd połączenia. Sprawdź internet i spróbuj ponownie.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Zarezerwuj wizytę';
    });
  });

  renderCalendar();
})();

/* ========================================
   Clean Anchor Scroll (no hash in URL)
   ======================================== */
document.querySelectorAll('a[href^="#"]').forEach(function(link) {
  link.addEventListener('click', function(e) {
    var target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Scroll to hash section on page load (e.g. coming from /#contact-section)
if (window.location.hash) {
  var hashTarget = document.querySelector(window.location.hash);
  if (hashTarget) {
    setTimeout(function() {
      hashTarget.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    history.replaceState(null, '', window.location.pathname);
  }
}

