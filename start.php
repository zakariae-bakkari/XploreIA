<?php

$rootDir = __DIR__;
$isWindows = PHP_OS_FAMILY === 'Windows';
$script = $isWindows ? 'start.bat' : 'start.sh';
$scriptPath = $rootDir . DIRECTORY_SEPARATOR . $script;

if (!file_exists($scriptPath)) {
   fwrite(STDERR, "Launcher not found: {$scriptPath}\n");
   exit(1);
}

echo "Starting XploreIA using {$script}...\n";

if ($isWindows) {
   passthru('cmd /c ""' . $scriptPath . '""', $exitCode);
} else {
   passthru('bash ' . escapeshellarg($scriptPath), $exitCode);
}

exit($exitCode ?? 0);