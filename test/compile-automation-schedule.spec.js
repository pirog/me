import assert from 'node:assert/strict';

import { compileAutomationSchedule } from '../utils/compile-automation-schedule.js';

describe('utils/compile-automation-schedule', () => {
  it('should compile minutely and hourly schedules deterministically', () => {
    assert.equal(
      compileAutomationSchedule({ frequency: 'minutely', interval: 15 }),
      'RRULE:FREQ=MINUTELY;INTERVAL=15',
    );
    assert.equal(
      compileAutomationSchedule({ frequency: 'hourly', interval: 2, minute: 5 }),
      'RRULE:FREQ=HOURLY;INTERVAL=2;BYMINUTE=5',
    );
  });

  it('should compile daily, weekly, and monthly schedules deterministically', () => {
    assert.equal(
      compileAutomationSchedule({ at: '09:30', frequency: 'daily' }),
      'RRULE:FREQ=DAILY;BYHOUR=9;BYMINUTE=30',
    );
    assert.equal(
      compileAutomationSchedule({
        at: '17:05',
        frequency: 'weekly',
        weekdays: ['monday', 'friday'],
      }),
      'RRULE:FREQ=WEEKLY;BYHOUR=17;BYMINUTE=5;BYDAY=MO,FR',
    );
    assert.equal(
      compileAutomationSchedule({ at: '08:00', frequency: 'monthly', 'month-days': [15, 1] }),
      'RRULE:FREQ=MONTHLY;BYHOUR=8;BYMINUTE=0;BYMONTHDAY=1,15',
    );
  });

  it('should reject incompatible, duplicate, and unknown schedule fields', () => {
    assert.throws(
      () => compileAutomationSchedule({ at: '09:00', frequency: 'minutely' }),
      /schedule\.at is not supported for minutely schedules/,
    );
    assert.throws(
      () =>
        compileAutomationSchedule({
          at: '09:00',
          frequency: 'weekly',
          weekdays: ['monday', 'monday'],
        }),
      /must not contain duplicates/,
    );
    assert.throws(
      () => compileAutomationSchedule({ frequency: 'hourly', timezone: 'UTC' }),
      /unknown field: timezone/,
    );
  });
});
