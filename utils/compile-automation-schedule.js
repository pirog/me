const ALLOWED_FREQUENCIES = new Set(['daily', 'hourly', 'minutely', 'monthly', 'weekly']);
const ALLOWED_WEEKDAYS = new Map([
  ['monday', 'MO'],
  ['tuesday', 'TU'],
  ['wednesday', 'WE'],
  ['thursday', 'TH'],
  ['friday', 'FR'],
  ['saturday', 'SA'],
  ['sunday', 'SU'],
]);
const SCHEDULE_KEYS = new Set(['at', 'frequency', 'interval', 'minute', 'month-days', 'weekdays']);

function assertInteger(value, label, { maximum, minimum }) {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${label} must be an integer from ${minimum} through ${maximum}.`);
  }
}

function parseTime(value) {
  if (typeof value !== 'string' || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) {
    throw new Error('schedule.at must use 24-hour HH:MM format.');
  }

  const [hour, minute] = value.split(':').map(Number);
  return { hour, minute };
}

function assertAllowedKeys(schedule) {
  for (const key of Object.keys(schedule)) {
    if (!SCHEDULE_KEYS.has(key)) {
      throw new Error(`schedule contains an unknown field: ${key}`);
    }
  }
}

function assertOnlyFields(schedule, allowedFields) {
  for (const key of Object.keys(schedule)) {
    if (!allowedFields.has(key)) {
      throw new Error(`schedule.${key} is not supported for ${schedule.frequency} schedules.`);
    }
  }
}

/**
 * Compile one declarative automation schedule to the stable RRULE accepted by Codex.
 *
 * @param {object} schedule Structured schedule from AUTOMATIONS.yaml.
 * @returns {string} A deterministic RRULE string.
 */
export function compileAutomationSchedule(schedule) {
  if (!schedule || typeof schedule !== 'object' || Array.isArray(schedule)) {
    throw new Error('schedule must be an object.');
  }

  assertAllowedKeys(schedule);
  const frequency = String(schedule.frequency ?? '')
    .trim()
    .toLowerCase();
  if (!ALLOWED_FREQUENCIES.has(frequency)) {
    throw new Error(`schedule.frequency must be one of: ${[...ALLOWED_FREQUENCIES].join(', ')}.`);
  }

  const interval = schedule.interval ?? 1;
  assertInteger(interval, 'schedule.interval', { maximum: 999, minimum: 1 });
  const parts = [`FREQ=${frequency.toUpperCase()}`];
  if (interval !== 1) {
    parts.push(`INTERVAL=${interval}`);
  }

  if (frequency === 'minutely') {
    assertOnlyFields(schedule, new Set(['frequency', 'interval']));
  }

  if (frequency === 'hourly') {
    assertOnlyFields(schedule, new Set(['frequency', 'interval', 'minute']));
    if (schedule.minute !== undefined) {
      assertInteger(schedule.minute, 'schedule.minute', { maximum: 59, minimum: 0 });
      parts.push(`BYMINUTE=${schedule.minute}`);
    }
  }

  if (frequency === 'daily' || frequency === 'weekly' || frequency === 'monthly') {
    const { hour, minute } = parseTime(schedule.at);
    parts.push(`BYHOUR=${hour}`, `BYMINUTE=${minute}`);
  }

  if (frequency === 'daily') {
    assertOnlyFields(schedule, new Set(['at', 'frequency', 'interval']));
  }

  if (frequency === 'weekly') {
    assertOnlyFields(schedule, new Set(['at', 'frequency', 'interval', 'weekdays']));
    if (!Array.isArray(schedule.weekdays) || schedule.weekdays.length === 0) {
      throw new Error('schedule.weekdays must include at least one weekday.');
    }

    const weekdays = schedule.weekdays.map((weekday) => String(weekday).trim().toLowerCase());
    if (new Set(weekdays).size !== weekdays.length) {
      throw new Error('schedule.weekdays must not contain duplicates.');
    }
    for (const weekday of weekdays) {
      if (!ALLOWED_WEEKDAYS.has(weekday)) {
        throw new Error(`schedule.weekdays contains an unknown weekday: ${weekday}`);
      }
    }
    parts.push(`BYDAY=${weekdays.map((weekday) => ALLOWED_WEEKDAYS.get(weekday)).join(',')}`);
  }

  if (frequency === 'monthly') {
    assertOnlyFields(schedule, new Set(['at', 'frequency', 'interval', 'month-days']));
    if (!Array.isArray(schedule['month-days']) || schedule['month-days'].length === 0) {
      throw new Error('schedule.month-days must include at least one day.');
    }
    for (const day of schedule['month-days']) {
      assertInteger(day, 'schedule.month-days entry', { maximum: 31, minimum: 1 });
    }
    const days = [...new Set(schedule['month-days'])].sort((left, right) => left - right);
    if (days.length !== schedule['month-days'].length) {
      throw new Error('schedule.month-days must not contain duplicates.');
    }
    parts.push(`BYMONTHDAY=${days.join(',')}`);
  }

  return `RRULE:${parts.join(';')}`;
}
