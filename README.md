# Ori Randomizer UI

This repository contains the web frontend as well as the Electron based desktop client, which builds upon that frontend.


## Running locally

```shell
yarn install # Install dependencies

yarn run dev # Run the frontend on localhost:3000
```

You can also specify the API host that the frontend should use as well as if secure connections should be used (https, wss) as environment variables. E.g. on UNIX systems:

```shell
API_HOST=dev.wotw.orirando.com API_SECURE=true yarn run dev
```

The API host will default to `127.0.0.1:8081` and secure connections are disabled by default, which matches the default configuration for `ori-rando/wotw-server`.


## Running the desktop client

**In addition to running the web frontend**, to launch the desktop client, run:

```shell
cd electron
yarn run electron:serve
```

On Windows, the base directory when running in development mode is `C:\moon`. The default settings of `ori-rando/wotw-client` should automatically install into `C:\moon\randomizer`. You might need to copy additional files in there. The easiest way is to install an official release of the Randomizer into `C:\moon` and build `ori-rando/wotw-client` afterwards to override the binaries to the newly compiled ones.
