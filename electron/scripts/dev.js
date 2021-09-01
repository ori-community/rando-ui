#!/usr/bin/node

const {spawn} = require('child_process');
const {build, createLogger} = require('vite');
const electronPath = require('electron');


/** @type 'production' | 'development' | 'test' */
const mode = process.env.NODE_ENV = process.env.NODE_ENV || 'development';


/** @type {import('vite').LogLevel} */
const LOG_LEVEL = 'warn';


/** @type {import('vite').InlineConfig} */
const sharedConfig = {
  mode,
  build: {
    watch: {},
  },
  logLevel: LOG_LEVEL,
};


/**
 * @param configFile
 * @param writeBundle
 * @param name
 * @returns {Promise<import('vite').RollupOutput | Array<import('vite').RollupOutput> | import('vite').RollupWatcher>}
 */
const getWatcher = ({name, configFile, writeBundle}) => {
  return build({
    ...sharedConfig,
    configFile,
    plugins: [{name, writeBundle}],
  });
};


/**
 * Start or restart App when source files are changed
 * @returns {Promise<import('vite').RollupOutput | Array<import('vite').RollupOutput> | import('vite').RollupWatcher>}
 */
const setupMainPackageWatcher = () => {
  const logger = createLogger(LOG_LEVEL, {
    prefix: '[main]',
  });

  /** @type {ChildProcessWithoutNullStreams | null} */
  let spawnProcess = null;

  return getWatcher({
    name: 'reload-app-on-main-package-change',
    configFile: 'electron/main/vite.config.js',
    writeBundle() {
      if (spawnProcess !== null) {
        spawnProcess.kill('SIGINT');
        spawnProcess = null;
      }

      spawnProcess = spawn(String(electronPath), ['.']);

      spawnProcess.stdout.on('data', d => d.toString().trim() && logger.warn(d.toString(), {timestamp: true}));
      spawnProcess.stderr.on('data', d => d.toString().trim() && logger.error(d.toString(), {timestamp: true}));
    },
  });
};

(async () => {
  try {
    await setupMainPackageWatcher();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
