pub mod codec;
pub mod error;
pub mod url;

pub use codec::{decode, encode};
pub use error::{Error, Result};
pub use url::{parse_url, ParsedUrl};

#[cfg(feature = "fetch")]
pub use url::{fetch_and_decode, fetch_raw_code};

#[cfg(feature = "blocking")]
pub use url::{fetch_and_decode_blocking, fetch_raw_code_blocking};
