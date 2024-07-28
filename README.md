# Ori Randomizer UI

This repository contains the web frontend as well as the Electron based desktop client, which builds upon that frontend.


## Prerequisites

- [Bun](https://bun.sh/)
- [Node](https://nodejs.org/)


## Development Setup

- In the `launcher` directory
  - Run `bun install`
  - Run `bun link` to make the package locally linkable on your machine
- In the `web`
  - Run `bun install`


## Run the UI

In the `web` directory, run `bun run dev`.


## Run the Launcher

The launcher requires the UI to be already running. If it is not running, start it before trying to run the launcher.

In the `launcher` directory, run `bun run start` to start the launcher.
