// TODO: Make a TypeScript class or, a even a React component
// (if this widget is going to be displayed by a React app).

let chart = undefined;
let highLoad = false;
let highLoadStart = -1;
let highLoadEnd = -1;
let warning = undefined;
let fetchTimer = null;

/*
Spec:
- A CPU is considered under high average load when it has exceeded 1 for 2 minutes or more.
- A CPU is considered recovered from high average load when it drops below 1 for 2 minutes or more.
*/
let ALERT_SENSITIVITY = 2*60*1000;
let SAMPLE_RATE = 10*1000;  // Spec: Get new data after 10 sec.
let EXTRA_LOAD_SIMULATION = 0.0;

const maybeUpdateWarning = function(sampleNum) {
  const nowHighLoad = sampleNum > 1.0;

  if (highLoad && !nowHighLoad)
    highLoadEnd = Date.now();

  else if (!highLoad && nowHighLoad)
    highLoadStart = Date.now();

  else if (!nowHighLoad && Date.now() - highLoadEnd >= ALERT_SENSITIVITY)
    removeWarning();

  else if (nowHighLoad && Date.now() - highLoadStart >= ALERT_SENSITIVITY)
    showWarning();

  highLoad = nowHighLoad;
}

const removeWarning = function() {
  if (!warning.classList.contains('alert'))
    return;

  warning.classList.remove('alert');
  warning.insertAdjacentHTML("beforeend", new Date().toUTCString() + ": High load recovered.<br/>")
}

const showWarning = function() {
  if (warning.classList.contains('alert'))
    return;

  warning.classList.add('alert');
  warning.insertAdjacentHTML("beforeend", new Date().toUTCString() + ": High load.<br/>")
}

const requestData = async function() {
  try {
    // TODO: Pass as parameter to allow for configurability and testing.
    const result = await fetch('https://logikbyran.se/demos/cpuload/server.php')
    if (result.ok) {
      const sample = await result.text();
      const sampleNum = new Number(sample);
      addDataPoint(sampleNum);
      fetchTimer = setTimeout(requestData, SAMPLE_RATE);
    }
  } catch (e) {
    // For demo, in case back-end is not answering.
    warning.insertAdjacentHTML("beforeend", new Date().toUTCString() + ": Cannot reach backend. Faking CPU data.<br/>")
    fakeCPUload();
  }
}

const fakeCPUload = function() {
  addDataPoint(0.5);
  fetchTimer = setTimeout(fakeCPUload, SAMPLE_RATE);
}

export const addDataPoint = function(sampleNum) {
  const roundedNum = Math.round((sampleNum + EXTRA_LOAD_SIMULATION + Number.EPSILON) * 1000) / 1000;
  maybeUpdateWarning(roundedNum);
  updateGraph(roundedNum);
}

const updateGraph = function(roundedNum) {
  const series = chart.series[0];
  const crop = series.data.length > 60;  // Spec: Only keep a window of 10 min.
  series.addPoint(roundedNum, true, crop);
}

export const initCpuGraph = function(cpuGraph, alertLog, chartApi) {
  warning = alertLog;
  chart = new chartApi.chart(cpuGraph, {
    chart: {
      type: 'line',
      styledMode: true,
    },
    title: { text: null},
    subtitle: { text: '/proc/loadavg, sampled every 10 seconds.' },
    xAxis: { type: 'linear', },
    yAxis: { title: { text: 'System load' } },
    credits: { enabled: false },
    plotOptions: {
      line: {
        dataLabels: {
            enabled: true
        },
        enableMouseTracking: false
      }
    },
    series: [{
        name: '1-minute load average',
        data: [],
        zones: [{value: 1.0, className: 'zone-1'}]
    }]
  });
  requestData();
}

let stableValueTimer = null;
export const initDemoSlider = function(slider) {
  // Demo only: Speed up everything during UX testing,
  slider.oninput = function() {
    clearTimeout(fetchTimer);
    clearTimeout(stableValueTimer);

    let rangeNumber = Number(this.value) / 100;
    loadunits.innerHTML = rangeNumber;

    EXTRA_LOAD_SIMULATION = rangeNumber;
    SAMPLE_RATE = 1000;
    ALERT_SENSITIVITY = 5 * SAMPLE_RATE;

    // Only once the slider value is left unchanged for 1 sec,
    // trigger a new fetch (avoids waiting 10 sec the first time).
    stableValueTimer = setTimeout(() => {
      clearTimeout(fetchTimer);
      setTimeout(requestData, SAMPLE_RATE / 2);
    }, SAMPLE_RATE);
  }
}
