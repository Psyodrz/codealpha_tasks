(() => {
    'use strict';

    /* ── DOM refs ────────────────────────────────────────── */

    const form      = document.getElementById('ageForm');
    const dayInput   = document.getElementById('day');
    const monthInput = document.getElementById('month');
    const yearInput  = document.getElementById('year');
    const errorMsg   = document.getElementById('errorMsg');
    const resultsEl  = document.getElementById('results');

    const elAgeYears    = document.getElementById('ageYears');
    const elAgeMonths   = document.getElementById('ageMonths');
    const elAgeDays     = document.getElementById('ageDays');
    const elTotalDays   = document.getElementById('totalDays');
    const elTotalWeeks  = document.getElementById('totalWeeks');
    const elTotalHours  = document.getElementById('totalHours');
    const elTotalMinutes = document.getElementById('totalMinutes');
    const elBornDay     = document.getElementById('bornDay');
    const elNextBday    = document.getElementById('nextBday');
    const elZodiac      = document.getElementById('zodiac');

    /* ── Helpers ─────────────────────────────────────────── */

    function isLeapYear(y) {
        return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
    }

    function daysInMonth(m, y) {
        const table = [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return table[m - 1];
    }

    /* ── Validation ──────────────────────────────────────── */

    function validate(day, month, year) {
        const now = new Date();
        const currentYear = now.getFullYear();

        if (!day || !month || !year) {
            return 'Please fill in all fields.';
        }

        if (isNaN(day) || isNaN(year)) {
            return 'Day and year must be numbers.';
        }

        day   = parseInt(day, 10);
        month = parseInt(month, 10);
        year  = parseInt(year, 10);

        if (year < 1900 || year > currentYear) {
            return 'Enter a year between 1900 and ' + currentYear + '.';
        }

        if (month < 1 || month > 12) {
            return 'Enter a valid month.';
        }

        const maxDay = daysInMonth(month, year);
        if (day < 1 || day > maxDay) {
            const monthNames = [
                'January','February','March','April','May','June',
                'July','August','September','October','November','December'
            ];
            return monthNames[month - 1] + ' ' + year + ' only has ' + maxDay + ' days.';
        }

        const inputDate = new Date(year, month - 1, day);
        inputDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (inputDate > today) {
            return "That date hasn't happened yet.";
        }

        return null;
    }

    /* ── Age Calculation ─────────────────────────────────── */

    function calculateAge(day, month, year) {
        const today = new Date();
        const tDay   = today.getDate();
        const tMonth = today.getMonth() + 1;
        const tYear  = today.getFullYear();

        let years  = tYear - year;
        let months = tMonth - month;
        let days   = tDay - day;

        if (days < 0) {
            months--;
            const prevMonth = tMonth - 1 === 0 ? 12 : tMonth - 1;
            const prevYear  = prevMonth === 12 ? tYear - 1 : tYear;
            days += daysInMonth(prevMonth, prevYear);
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        /* Totals */
        const birthDate = new Date(year, month - 1, day);
        birthDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffMs      = today - birthDate;
        const totalDays    = Math.floor(diffMs / 86400000);
        const totalWeeks   = Math.floor(totalDays / 7);
        const totalHours   = totalDays * 24;
        const totalMinutes = totalHours * 60;

        /* Day of birth */
        const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const bornOn = dayNames[birthDate.getDay()];

        /* Next birthday */
        let nextBday = new Date(tYear, month - 1, day);
        nextBday.setHours(0, 0, 0, 0);
        if (nextBday <= today) {
            nextBday = new Date(tYear + 1, month - 1, day);
            nextBday.setHours(0, 0, 0, 0);
        }
        const daysUntil = Math.ceil((nextBday - today) / 86400000);

        /* Zodiac sign */
        const zodiac = getZodiac(month, day);

        return { years, months, days, totalDays, totalWeeks, totalHours, totalMinutes, bornOn, daysUntil, zodiac };
    }

    /* ── Zodiac ──────────────────────────────────────────── */

    function getZodiac(month, day) {
        const signs = [
            { name: 'Capricorn',   end: [1, 19] },
            { name: 'Aquarius',    end: [2, 18] },
            { name: 'Pisces',      end: [3, 20] },
            { name: 'Aries',       end: [4, 19] },
            { name: 'Taurus',      end: [5, 20] },
            { name: 'Gemini',      end: [6, 20] },
            { name: 'Cancer',      end: [7, 22] },
            { name: 'Leo',         end: [8, 22] },
            { name: 'Virgo',       end: [9, 22] },
            { name: 'Libra',       end: [10, 22] },
            { name: 'Scorpio',     end: [11, 21] },
            { name: 'Sagittarius', end: [12, 21] },
        ];

        for (const sign of signs) {
            if (month < sign.end[0] || (month === sign.end[0] && day <= sign.end[1])) {
                return sign.name;
            }
        }
        return 'Capricorn';
    }

    /* ── Number Animation ────────────────────────────────── */

    function animateNumber(el, target, duration) {
        const start = performance.now();

        function tick(now) {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease     = 1 - Math.pow(1 - progress, 3);
            const current  = Math.floor(target * ease);
            el.textContent = current.toLocaleString();
            if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
    }

    /* ── Display Results ─────────────────────────────────── */

    function showResults(data) {
        /* Reset animation state */
        resultsEl.classList.remove('visible');
        void resultsEl.offsetWidth;
        resultsEl.classList.add('visible');

        /* Scroll into view */
        setTimeout(() => {
            resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

        /* Animate primary age */
        animateNumber(elAgeYears,  data.years,  700);
        animateNumber(elAgeMonths, data.months, 700);
        animateNumber(elAgeDays,   data.days,   700);

        /* Animate stats */
        animateNumber(elTotalDays,    data.totalDays,    900);
        animateNumber(elTotalWeeks,   data.totalWeeks,   900);
        animateNumber(elTotalHours,   data.totalHours,   900);
        animateNumber(elTotalMinutes, data.totalMinutes,  1100);

        /* Next birthday */
        elNextBday.textContent = data.daysUntil;

        /* Text stats */
        elBornDay.textContent  = data.bornOn;
        elZodiac.textContent   = data.zodiac;
    }

    /* ── Error Handling ──────────────────────────────────── */

    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.classList.add('visible');
    }

    function clearError() {
        errorMsg.textContent = '';
        errorMsg.classList.remove('visible');
    }

    function clearFieldErrors() {
        dayInput.classList.remove('invalid');
        monthInput.classList.remove('invalid');
        yearInput.classList.remove('invalid');
    }

    /* ── Form Submit ─────────────────────────────────────── */

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        clearError();
        clearFieldErrors();

        const day   = dayInput.value.trim();
        const month = monthInput.value;
        const year  = yearInput.value.trim();

        /* Mark empty fields */
        if (!day)   dayInput.classList.add('invalid');
        if (!month) monthInput.classList.add('invalid');
        if (!year)  yearInput.classList.add('invalid');

        const err = validate(day, month, year);
        if (err) {
            showError(err);
            return;
        }

        const result = calculateAge(
            parseInt(day, 10),
            parseInt(month, 10),
            parseInt(year, 10)
        );

        showResults(result);
    });

    /* ── Input cleanup: allow only digits ────────────────── */

    function numericOnly(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    }

    dayInput.addEventListener('input', numericOnly);
    yearInput.addEventListener('input', numericOnly);

    /* Auto-advance: day → month → year */
    dayInput.addEventListener('input', function () {
        if (this.value.length === 2) monthInput.focus();
    });

    monthInput.addEventListener('change', function () {
        yearInput.focus();
    });

    /* Clear errors on interaction */
    [dayInput, monthInput, yearInput].forEach(el => {
        el.addEventListener('focus', () => {
            clearError();
            clearFieldErrors();
        });
    });

})();
