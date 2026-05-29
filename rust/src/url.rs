#[cfg(any(feature = "fetch", feature = "blocking"))]
use crate::error::Result;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParsedUrl {
    pub id: String,
    pub raw_url: String,
}

/// Parses pobb.in URLs to extract the paste ID and raw URL.
/// Supports:
/// - https://pobb.in/XYZ123
/// - pobb.in/XYZ123
/// - https://pobb.in/u/username/XYZ123
/// - https://pobb.in/XYZ123/raw
pub fn parse_url(url: &str) -> Option<ParsedUrl> {
    let mut s = url.trim();
    
    // Remove protocol
    if s.starts_with("https://") {
        s = &s[8..];
    } else if s.starts_with("http://") {
        s = &s[7..];
    }
    
    // Remove "www." if present
    if s.starts_with("www.") {
        s = &s[4..];
    }
    
    if s.starts_with("pobb.in/") {
        let path = &s[8..];
        if path.starts_with("u/") {
            // User profile: u/username/id or u/username/id/raw
            let parts: Vec<&str> = path.split('/').collect();
            if parts.len() >= 3 {
                let username = parts[1];
                let id = parts[2];
                if username.is_empty() || id.is_empty() {
                    return None;
                }
                return Some(ParsedUrl {
                    id: format!("{}/{}", username, id),
                    raw_url: format!("https://pobb.in/u/{}/{}/raw", username, id),
                });
            }
            return None;
        } else {
            // Standard: id or id/raw or raw/id
            let parts: Vec<&str> = path.split('/').collect();
            if parts.is_empty() {
                return None;
            }
            let mut id = parts[0];
            if id == "raw" && parts.len() >= 2 {
                id = parts[1];
            }
            if id.is_empty() {
                return None;
            }
            return Some(ParsedUrl {
                id: id.to_string(),
                raw_url: format!("https://pobb.in/{}/raw", id),
            });
        }
    }
    
    None
}

#[cfg(any(feature = "fetch", feature = "blocking"))]
const DEFAULT_USER_AGENT: &str = "pob-parser-rust/1.0.0 (https://github.com/pob-parser; contact: pob-parser-rust@example.com)";

#[cfg(feature = "fetch")]
pub async fn fetch_raw_code(url_or_id: &str, user_agent: Option<&str>) -> Result<String> {
    let raw_url = get_raw_url(url_or_id)?;
    let client = reqwest::Client::builder()
        .user_agent(user_agent.unwrap_or(DEFAULT_USER_AGENT))
        .build()?;
        
    let response = client.get(&raw_url).send().await?;
    if !response.status().is_success() {
        return Err(crate::error::Error::InvalidUrl(format!(
            "Failed to fetch build: HTTP {}",
            response.status()
        )));
    }
    
    let text = response.text().await?;
    Ok(text.trim().to_string())
}

#[cfg(feature = "fetch")]
pub async fn fetch_and_decode(url_or_id: &str, user_agent: Option<&str>) -> Result<String> {
    let raw_code = fetch_raw_code(url_or_id, user_agent).await?;
    crate::codec::decode(&raw_code)
}

#[cfg(feature = "blocking")]
pub fn fetch_raw_code_blocking(url_or_id: &str, user_agent: Option<&str>) -> Result<String> {
    let raw_url = get_raw_url(url_or_id)?;
    let client = reqwest::blocking::Client::builder()
        .user_agent(user_agent.unwrap_or(DEFAULT_USER_AGENT))
        .build()?;
        
    let response = client.get(&raw_url).send()?;
    if !response.status().is_success() {
        return Err(crate::error::Error::InvalidUrl(format!(
            "Failed to fetch build: HTTP {}",
            response.status()
        )));
    }
    
    let text = response.text()?;
    Ok(text.trim().to_string())
}

#[cfg(feature = "blocking")]
pub fn fetch_and_decode_blocking(url_or_id: &str, user_agent: Option<&str>) -> Result<String> {
    let raw_code = fetch_raw_code_blocking(url_or_id, user_agent)?;
    crate::codec::decode(&raw_code)
}

#[cfg(any(feature = "fetch", feature = "blocking"))]
fn get_raw_url(url_or_id: &str) -> Result<String> {
    if let Some(parsed) = parse_url(url_or_id) {
        Ok(parsed.raw_url)
    } else {
        let trimmed_id = url_or_id.trim();
        // Check if it's alphanumeric and format accordingly
        if trimmed_id.is_empty() || trimmed_id.contains(' ') {
            return Err(crate::error::Error::InvalidUrl(url_or_id.to_string()));
        }
        if trimmed_id.contains('/') {
            Ok(format!("https://pobb.in/u/{}/raw", trimmed_id))
        } else {
            Ok(format!("https://pobb.in/{}/raw", trimmed_id))
        }
    }
}
