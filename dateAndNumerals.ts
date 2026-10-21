/**
 * Utilities for Asia/Dhaka timezone, Bengali numerals, Hijri date, and prayer calculations
 */

export const BANGLADESH_CITIES: Record<string, { nameBn: string; lat: number; lng: number }> = {
  Dhaka: { nameBn: 'ঢাকা', lat: 23.8103, lng: 90.4125 },
  Chittagong: { nameBn: 'চট্টগ্রাম', lat: 22.3569, lng: 91.7832 },
  Sylhet: { nameBn: 'সিলেট', lat: 24.8949, lng: 91.8687 },
  Rajshahi: { nameBn: 'রাজশাহী', lat: 24.3636, lng: 88.6241 },
  Khulna: { nameBn: 'খুলনা', lat: 22.8456, lng: 89.5403 },
  Barisal: { nameBn: 'বরিশাল', lat: 22.7010, lng: 90.3535 },
  Rangpur: { nameBn: 'রংপুর', lat: 25.7439, lng: 89.2752 },
  Mymensingh: { nameBn: 'ময়মনসিংহ', lat: 24.7471, lng: 90.4203 },
};

export const HIJRI_MONTHS_BN = [
  'মুহররম',
  'সফর',
  'রবিউল আউয়াল',
  'রবিউস সানি',
  'জমাদিউল আউয়াল',
  'জমাদিউস সানি',
  'রজব',
  'শা\'বান',
  'রমজান',
  'শাওয়াল',
  'জিলকদ',
  'জিলহজ্জ',
];

export const HIJRI_MONTHS_AR = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الثاني',
  'جمادى الأولى',
  'جمادى الثانية',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliDigits(input: string | number, useBengali = true): string {
  if (!useBengali) return String(input);
  return String(input).replace(/[0-9]/g, (w) => BENGALI_DIGITS[parseInt(w, 10)]);
}

/**
 * Returns current Date in Asia/Dhaka timezone formatted as YYYY-MM-DD
 */
export function getDhakaDateString(date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    return date.toISOString().split('T')[0];
  }
}

/**
 * Returns readable Bengali date string for display (e.g. "বুধবার, ২১ অক্টোবর ২০২৬")
 */
export function formatBengaliDate(dateStr: string, useBengali = true): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);

  const daysBn = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const monthsBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  const dayName = daysBn[d.getDay()];
  const monthName = monthsBn[month - 1];
  const dayNum = toBengaliDigits(day, useBengali);
  const yearNum = toBengaliDigits(year, useBengali);

  return `${dayName}, ${dayNum} ${monthName} ${yearNum}`;
}

/**
 * Hijri Date Calculation with offset adjustment for Bangladesh moonsighting
 */
export function getHijriDate(dateStr: string, offsetDays = 0) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + offsetDays);

  const m = date.getMonth();
  const y = date.getFullYear();
  const d = date.getDate();

  // Julian day number calculation
  let jd = Math.floor((1461 * (y + 4800 + Math.floor((m - 13) / 12))) / 4) +
    Math.floor((367 * (m - 1 - 12 * Math.floor((m - 13) / 12))) / 12) -
    Math.floor((3 * Math.floor((y + 4900 + Math.floor((m - 13) / 12)) / 100)) / 4) +
    d - 32075;

  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) +
    (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
  l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) -
    (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  const hijriMonth = Math.floor((24 * l) / 709);
  const hijriDay = l - Math.floor((709 * hijriMonth) / 24);
  const hijriYear = 30 * n + j - 30;

  const validMonthIndex = Math.max(0, Math.min(11, hijriMonth - 1));

  return {
    day: hijriDay,
    month: hijriMonth,
    monthNameBn: HIJRI_MONTHS_BN[validMonthIndex],
    monthNameAr: HIJRI_MONTHS_AR[validMonthIndex],
    year: hijriYear,
  };
}

/**
 * Astronomical Prayer Time Calculation for Bangladesh
 */
export interface PrayerTimesResult {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  tahajjudEnd: string;
  isFajrOver: boolean;
}

export function calculatePrayerTimes(
  dateStr: string,
  cityName = 'Dhaka',
  asrMethod: 'Hanafi' | 'Standard' = 'Hanafi'
): PrayerTimesResult {
  const city = BANGLADESH_CITIES[cityName] || BANGLADESH_CITIES.Dhaka;
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const lat = city.lat;
  const lng = city.lng;
  const timeZone = 6; // Asia/Dhaka is UTC+6

  // Day of the year
  const startOfYear = new Date(year, 0, 0);
  const diff = (date.getTime() - startOfYear.getTime()) + ((startOfYear.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Sun calculation formulas
  const B = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const EoT = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B); // Equation of Time in minutes
  const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * (Math.PI / 180)); // Declination in degrees

  const degToRad = (d: number) => (d * Math.PI) / 180;
  const radToDeg = (r: number) => (r * 180) / Math.PI;

  const latRad = degToRad(lat);
  const decRad = degToRad(declination);

  // Solar Noon in UTC hours
  const solarNoonUTC = 12 - (lng / 15) - (EoT / 60);
  const solarNoonLocal = solarNoonUTC + timeZone;

  // Dhuhr is slightly after solar noon (about 2 minutes for precaution)
  const dhuhrTime = solarNoonLocal + 4 / 60;

  // Hour angle helper for sun angle below horizon
  const getHourAngle = (angleDeg: number) => {
    const angleRad = degToRad(angleDeg);
    const cosHA = (Math.sin(angleRad) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));
    if (cosHA > 1) return 0;
    if (cosHA < -1) return Math.PI;
    return Math.acos(cosHA);
  };

  // Fajr: 18 degrees below horizon (University of Islamic Sciences, Karachi & Islamic Foundation Bangladesh)
  const fajrHA = getHourAngle(-18);
  const fajrTime = solarNoonLocal - radToDeg(fajrHA) / 15;

  // Sunrise: 0.833 degrees below horizon (standard refraction)
  const sunriseHA = getHourAngle(-0.833);
  const sunriseTime = solarNoonLocal - radToDeg(sunriseHA) / 15;

  // Sunset / Maghrib: 0.833 degrees
  const sunsetTime = solarNoonLocal + radToDeg(sunriseHA) / 15 + 2 / 60; // 2 min precaution

  // Asr shadow multiplier (Hanafi: 2x shadow, Standard Shafi/Maliki/Hanbali: 1x shadow)
  const shadowMultiplier = asrMethod === 'Hanafi' ? 2 : 1;
  const asrAngleRad = Math.atan(1 / (shadowMultiplier + Math.tan(Math.abs(latRad - decRad))));
  const asrHA = Math.acos(
    (Math.sin(asrAngleRad) - Math.sin(latRad) * Math.sin(decRad)) /
    (Math.cos(latRad) * Math.cos(decRad))
  );
  const asrTime = solarNoonLocal + radToDeg(asrHA) / 15;

  // Isha: 18 degrees below horizon (Karachi / IFB)
  const ishaHA = getHourAngle(-18);
  const ishaTime = solarNoonLocal + radToDeg(ishaHA) / 15;

  const formatHours = (decHours: number): string => {
    let totalMinutes = Math.round(decHours * 60);
    totalMinutes = (totalMinutes + 1440) % 1440;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
  };

  return {
    fajr: formatHours(fajrTime),
    sunrise: formatHours(sunriseTime),
    dhuhr: formatHours(dhuhrTime),
    asr: formatHours(asrTime),
    maghrib: formatHours(sunsetTime),
    isha: formatHours(ishaTime),
    tahajjudEnd: formatHours(fajrTime - 0.25),
    isFajrOver: false,
  };
}
