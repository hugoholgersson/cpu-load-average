import { initCpuGraph, addDataPoint } from './cpugraph.js';

let dummyGraph = undefined;
let alertLog = undefined;
let mockChartApi = undefined;
const MIN = 60*1000;

function setUnixTime(time) {
  jest.spyOn(global.Date, 'now').mockImplementationOnce(() => time);
}

beforeEach(() => {
  dummyGraph = document.createElement('div');
  alertLog = document.createElement('div');
  mockChartApi = {
    "chart": function() {
      this.series = [{
        "addPoint": function() {},
        "data": []
      }];
    }
  }

  // Dependency injection.
  initCpuGraph(dummyGraph, alertLog, mockChartApi);
  setUnixTime(0);
});

describe('Alert log', () => {
  test('should warn after >= 2 minutes of high load', () => {
    addDataPoint(1.234234); // High load.
    expect(alertLog.getAttribute('class')).not.toBe('alert') // Warning is not shown.

    setUnixTime(1.5*MIN);
    addDataPoint(1.1123); // Still high load.
    expect(alertLog.getAttribute('class')).not.toBe('alert') // Warning is not shown.

    // Almost 2 minutes, but not yet.
    setUnixTime(2*MIN-1000);
    addDataPoint(1.02); // Still high load.
    expect(alertLog.getAttribute('class')).not.toBe('alert') // Warning is not shown.

    setUnixTime(2*MIN);
    addDataPoint(1.112355555); // Still high load.
    expect(alertLog.getAttribute('class')).toBe('alert') // Warning is finally shown.
  });
});

describe('Alert log', () => {
  test('should not warn if high load drops within 2 minutes', () => {
    addDataPoint(1.14); // High load.
    expect(alertLog.getAttribute('class')).not.toBe('alert') // Warning is not shown.

    setUnixTime(1.5*MIN);
    addDataPoint(0.893); // Normal load.
    expect(alertLog.getAttribute('class')).not.toBe('alert') // Warning is not shown.

    setUnixTime(2*MIN);
    addDataPoint(1.1123); // High load.
    expect(alertLog.getAttribute('class')).not.toBe('alert') // Warning is not shown.
  });
});

describe('Alert log', () => {
  test('should remove warning once load has been normal for 2 minutes', () => {
    addDataPoint(1.14); // High load.
    expect(alertLog.getAttribute('class')).not.toBe('alert') // Warning is not shown.

    setUnixTime(2*MIN);
    addDataPoint(1.074); // High load.
    expect(alertLog.getAttribute('class')).toBe('alert') // Warning is shown.

    setUnixTime(2*MIN+1.5*MIN);
    addDataPoint(0.423); // Normal load starts now.
    expect(alertLog.getAttribute('class')).toBe('alert') // Warning is still shown.

    // Almost 2 minutes, but not yet.
    setUnixTime(2*MIN+1.5*MIN+2*MIN-1000);
    addDataPoint(0.23); // Normal load continues.
    expect(alertLog.getAttribute('class')).toBe('alert') // Warning is still shown.

    setUnixTime(2*MIN+1.5*MIN+2*MIN);
    addDataPoint(0.723);
    expect(alertLog.getAttribute('class')).not.toBe('alert') // Warning is finally removed.
  });
});
