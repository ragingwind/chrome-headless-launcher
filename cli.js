#!/usr/bin/env node
'use strict';

const meow = require('meow');
const { ChromeLauncher } = require('lighthouse/lighthouse-cli/chrome-launcher');
const decamelizeKeys = require('decamelize-keys');

const cli = meow(`
	Usage
	  $ chrome-headless [url] [options]

	Options
	  --port         same as remote-debugging-port [default: 9222]

	Chrome headless options will be by-passed
	  --print-to-pdf
	  --screenshot
	  --window-size

	Examples
	  $ headless https://google.com
	  $ headless https://google.com --port=9000
		$ headless https://google.com --screenshot --window-size=1280,1696
`);

if (cli.input.length <= 0) {
	console.error('Target URL must be exist');
	process.exit(-1);
}

if (cli.flags.port) {
	cli.flags['remote-debugging-port'] = cli.flags.port;
	delete cli.flags.port;
} else {
	cli.flags['remote-debugging-port'] = 9222;
}

const flags = decamelizeKeys(cli.flags, '-');
const additionalFlags = Object.keys(flags).map(f => {
	return `--${f}${typeof flags[f] !== 'boolean' ? '=' + flags[f] : ''}`;
});

const launcher = new ChromeLauncher({
	startingUrl: cli.input[0],
	port: 9222,
	autoSelectChrome: true,
	additionalFlags: additionalFlags.concat([
		'--disable-gpu',
		'--headless'
	])
});

// run headless chrome browser
launcher.run();

// manage terminating of headless chrome browser
const exitHandler = err => {
	launcher.kill().then(() => {
		process.exit(-1);
	});
}

process.on('SIGINT', exitHandler.bind(null));
process.on('unhandledRejection', exitHandler.bind(null));
process.on('rejectionHandled', exitHandler.bind(null));
process.on('uncaughtException', exitHandler.bind(null));
