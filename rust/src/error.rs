#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Base64 decode error: {0}")]
    Base64(#[from] base64::DecodeError),
    
    #[error("Decompression/Zlib error: {0}")]
    Decompress(#[from] std::io::Error),
    
    #[error("Compression/Zlib error: {0}")]
    Compress(std::io::Error),

    #[error("Invalid URL or ID: {0}")]
    InvalidUrl(String),

    #[cfg(any(feature = "fetch", feature = "blocking"))]
    #[error("HTTP request error: {0}")]
    Http(#[from] reqwest::Error),
}

pub type Result<T> = std::result::Result<T, Error>;
