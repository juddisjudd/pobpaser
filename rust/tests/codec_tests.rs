use pob_parser::{decode, encode, parse_url, ParsedUrl};

#[test]
fn test_codec_roundtrip() {
    let sample_xml = "<PathOfBuilding><Build level=\"100\" class=\"Witch\"></Build></PathOfBuilding>";
    let encoded = encode(sample_xml).unwrap();
    
    assert!(!encoded.contains('+'));
    assert!(!encoded.contains('/'));
    assert!(!encoded.contains('='));
    
    let decoded = decode(&encoded).unwrap();
    assert_eq!(decoded, sample_xml);
}

#[test]
fn test_decode_different_paddings() {
    let sample_xml = "hello world";
    // "hello world" compressed and base64 encoded
    let standard_b64 = "eJzLSM3JyVcozy/KSQEAGgsEXQ==";
    let url_safe_unpadded = "eJzLSM3JyVcozy_KSQEAGgsEXQ";
    
    assert_eq!(decode(standard_b64).unwrap(), sample_xml);
    assert_eq!(decode(url_safe_unpadded).unwrap(), sample_xml);
}

#[test]
fn test_parse_url() {
    let cases = vec![
        (
            "https://pobb.in/eQVFNoqVZrza",
            Some(ParsedUrl {
                id: "eQVFNoqVZrza".to_string(),
                raw_url: "https://pobb.in/eQVFNoqVZrza/raw".to_string(),
            }),
        ),
        (
            "http://www.pobb.in/u/test_user/abc1234",
            Some(ParsedUrl {
                id: "test_user/abc1234".to_string(),
                raw_url: "https://pobb.in/u/test_user/abc1234/raw".to_string(),
            }),
        ),
        (
            "pobb.in/eQVFNoqVZrza/raw",
            Some(ParsedUrl {
                id: "eQVFNoqVZrza".to_string(),
                raw_url: "https://pobb.in/eQVFNoqVZrza/raw".to_string(),
            }),
        ),
    ];

    for (url, expected) in cases {
        assert_eq!(parse_url(url), expected);
    }

    assert_eq!(parse_url("https://google.com"), None);
}
