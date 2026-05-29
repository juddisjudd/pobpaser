#[cfg(feature = "blocking")]
use pob_parser::fetch_and_decode_blocking;

#[cfg(feature = "blocking")]
fn main() {
    let url = "https://pobb.in/E23x6r3rboyN";
    println!("Fetching and decoding PoB build from: {}", url);

    match fetch_and_decode_blocking(url, None) {
        Ok(xml) => {
            println!("Success! Decoded XML length: {} characters", xml.len());
            println!("--- XML Snippet (First 500 chars) ---");
            let snippet: String = xml.chars().take(500).collect();
            println!("{}", snippet);
            println!("-------------------------------------");
        }
        Err(e) => {
            eprintln!("Error fetching and decoding build: {:?}", e);
            std::process::exit(1);
        }
    }
}

#[cfg(not(feature = "blocking"))]
fn main() {
    println!("The 'blocking' feature is not enabled.");
    println!("Please run this example with the blocking feature enabled:");
    println!("cargo run --example fetch_pob --features=\"blocking\"");
}

