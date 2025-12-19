# Ori Randomizer UI

This repository contains the web frontend as well as the Electron based desktop client, which builds upon that frontend.


## Prerequisites

- [Node](https://nodejs.org/)


## Development Setup

- In the `launcher` directory
  - Run `npm install`
- In the `web` directory
  - Run `npm install`


## Run the UI

In the `web` directory, run `npm run dev`.


## Run the Launcher

The launcher requires the UI to be already running. If it is not running, start it before trying to run the launcher.

In the `launcher` directory, run `npm run start` to start the launcher.

When running the launcher in development mode, the `development-install-dir` directory is used as the global installation directory. It should contain all the necessary files for everything to work as in a real installation. If you also have a local development setup of the client project, you can set the `WOTWR_INSTALL_DIR` CMake variable in the client project to the absolute path of `development-install-dir/client` so you don't need to copy files on every rebuild.
