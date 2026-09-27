# AVL Sandbox

> [!IMPORTANT]
> AVL Sandbox's API may change before v1.0 is released

A TypeScript framework for creating fake commercial A/V devices to use for plugin/driver development.

I once needed to develop a plugin for a lighting control server that had its commands documented but not the server's responses. I wound up creating a small server I could run on my computer with a 1:1 compatible API so I didn't need to VPN into my workplace to turn the lights on and off from miles away while testing the Bitfocus Companion module I was writing. Having this would have made that task so much easier.

## Installation

`npm install avl-sandbox`

Requires Node 22 or later.

## Documentation

Documentation can be found in the [docs folder](/docs).

## Examples

Full examples are available in the examples folder on [GitHub](https://github.com/zklosko/avl-sandbox/tree/main/examples).

## Changelog

### 0.2.0

- Added the ability to declare groups of state in a single command, and nest groups as needed (good for channels, zones, etc.)
- Groups have a 1-based index
