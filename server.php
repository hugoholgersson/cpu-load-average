<?php
header('Access-Control-Allow-Origin: *');
function get_total_cpu_cores() {
  return (int) ((PHP_OS_FAMILY == 'Windows') ?
      getenv("NUMBER_OF_PROCESSORS") + 0  :
      substr_count(file_get_contents("/proc/cpuinfo"), "processor"));
}
print(sys_getloadavg()[0]/get_total_cpu_cores());
?>
