use base64::{engine::general_purpose::STANDARD, Engine as _};
use flate2::read::ZlibDecoder;
use flate2::write::ZlibEncoder;
use flate2::Compression;
use std::io::{Read, Write};
use crate::error::{Error, Result};

/// Decodes a raw base64 zlib-compressed Path of Building import code into its XML string.
/// Supports both standard and URL-safe base64, with or without padding.
pub fn decode(code: &str) -> Result<String> {
    let mut normalized = code.trim().replace('-', "+").replace('_', "/");
    
    // Add padding if missing
    while normalized.len() % 4 != 0 {
        normalized.push('=');
    }
    
    let decoded_bytes = STANDARD.decode(&normalized)?;
    
    let mut decoder = ZlibDecoder::new(&decoded_bytes[..]);
    let mut xml = String::new();
    decoder.read_to_string(&mut xml)?;
    Ok(xml)
}

/// Encodes an XML build string into a URL-safe, zlib-compressed base64 Path of Building import code.
pub fn encode(xml: &str) -> Result<String> {
    let mut encoder = ZlibEncoder::new(Vec::new(), Compression::default());
    encoder.write_all(xml.as_bytes()).map_err(Error::Compress)?;
    let compressed_bytes = encoder.finish().map_err(Error::Compress)?;
    
    let encoded = STANDARD.encode(&compressed_bytes);
    
    // Convert to URL-safe base64 and strip padding (which is standard for PoB sharing)
    let url_safe = encoded
        .replace('+', "-")
        .replace('/', "_")
        .trim_end_matches('=')
        .to_string();
        
    Ok(url_safe)
}
