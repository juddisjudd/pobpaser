# pob-parser

[![npm version](https://img.shields.io/npm/v/pob-parser.svg?style=flat-square)](https://www.npmjs.com/package/pob-parser)
[![npm downloads](https://img.shields.io/npm/dm/pob-parser.svg?style=flat-square)](https://www.npmjs.com/package/pob-parser)
[![crates.io version](https://img.shields.io/crates/v/pob-parser.svg?style=flat-square)](https://crates.io/crates/pob-parser)
[![crates.io downloads](https://img.shields.io/crates/d/pob-parser.svg?style=flat-square)](https://crates.io/crates/pob-parser)
[![docs.rs](https://img.shields.io/docsrs/pob-parser?style=flat-square)](https://docs.rs/pob-parser)

A high-performance, robust, and zero-dependency library for parsing, encoding, decoding, and fetching Path of Building (PoB) import codes and pobb.in links. Available in both TypeScript/JavaScript (npm) and Rust (crates.io).

## Features

- Zero external dependencies (JS/TS version) using modern Web Streams.
- High performance and safe encoding/decoding using base64 and zlib.
- Link parsing and retrieval: Resolves standard and user-profile URLs for pobb.in to fetch the raw import codes.
- Idiomatic Rust version with conditional async/blocking fetching using features.
- Local playground demo: A minimal, terminal-inspired web application included in the repository to test, edit, and re-encode builds.

## Installation

### TypeScript / JavaScript (npm)

```bash
npm install pob-parser
```

### Rust (crates.io)

Add to your Cargo.toml:
```toml
[dependencies]
pob-parser = "1.0.0"
```

To enable HTTP fetching (async/blocking):
```toml
pob-parser = { version = "1.0.0", features = ["fetch", "blocking"] }
```

## Quick Start Examples

### TypeScript / JavaScript

```typescript
import { encode, decode, parseUrl, fetchRawCode, fetchAndDecode } from 'pob-parser';

// 1. Decode a PoB code to XML
const pobCode = "eJzLSM3JyVcozy/KSQEAGgsEXQ=="; // "hello world" compressed
const xml = await decode(pobCode);
console.log(xml); // "hello world"

// 2. Encode XML to PoB Code
const newPobCode = await encode(xml);
console.log(newPobCode); // "eJzLSM3JyVcozy_KSQEAGgsEXQ" (URL-safe, no padding)

// 3. Parse a pobb.in URL
const parsed = parseUrl("https://pobb.in/eQVFNoqVZrza");
console.log(parsed);
// { id: 'eQVFNoqVZrza', rawUrl: 'https://pobb.in/eQVFNoqVZrza/raw' }

// 4. Fetch and decode from pobb.in
const fetchedXml = await fetchAndDecode("https://pobb.in/eQVFNoqVZrza");
console.log(fetchedXml);
```

### Rust

```rust
use pob_parser::{decode, encode, parse_url};

fn main() -> Result<(), pob_parser::Error> {
    // 1. Decode PoB code
    let xml = decode("eJzLSM3JyVcozy/KSQEAGgsEXQ==")?;
    println!("{}", xml); // "hello world"

    // 2. Encode XML
    let encoded = encode(&xml)?;
    println!("{}", encoded); // "eJzLSM3JyVcozy_KSQEAGgsEXQ"
    
    // 3. Parse pobb.in link
    let parsed = parse_url("https://pobb.in/eQVFNoqVZrza").unwrap();
    println!("Raw URL: {}", parsed.raw_url);
    
    Ok(())
}

// 4. Fetch and decode (requires the "fetch" feature)
#[cfg(feature = "fetch")]
async fn fetch_example() -> Result<(), pob_parser::Error> {
    let xml = pob_parser::fetch_and_decode("https://pobb.in/eQVFNoqVZrza", None).await?;
    println!("{}", xml);
    Ok(())
}
```

## Local Playground

### Run Locally with CORS Proxy

Since browsers block cross-origin requests (CORS) when executing client-side fetches directly to pobb.in, a local dev server with a built-in proxy is provided for testing:

1. Build the library bundles:
   ```bash
   cd js
   npm run build
   ```
2. Start the dev server:
   ```bash
   npm start
   ```
3. Open http://localhost:3000 in your browser to access the playground.

## Credits

- [PathOfBuildingAPI](https://github.com/ppoelzl/PathOfBuildingAPI) by ppoelzl
- [pasteofexile](https://github.com/Dav1dde/pasteofexile) by Dav1dde
