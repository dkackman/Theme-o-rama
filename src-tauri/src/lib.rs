use rustls::crypto::aws_lc_rs::default_provider;
use tauri_specta::{Builder, ErrorHandlingMode};

#[cfg(all(debug_assertions, not(mobile)))]
use specta_typescript::{BigIntExportBehavior, Typescript};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    default_provider()
        .install_default()
        .expect("could not install AWS LC provider");

    let builder = Builder::<tauri::Wry>::new()
        .error_handling(ErrorHandlingMode::Throw);


    // On mobile or release mode we should not export the TypeScript bindings
    #[cfg(all(debug_assertions, not(mobile)))]
    builder
        .export(
            Typescript::default().bigint(BigIntExportBehavior::Number),
            "../src/bindings.ts",
        )
        .expect("Failed to export TypeScript bindings");

    let mut tauri_builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_os::init());

    #[cfg(not(mobile))]
    {
        tauri_builder = tauri_builder
            .plugin(tauri_plugin_window_state::Builder::new().build())
            .plugin(tauri_plugin_fs::init())
            .plugin(tauri_plugin_dialog::init());
    }

    #[cfg(mobile)]
    {
        tauri_builder = tauri_builder
            .plugin(tauri_plugin_barcode_scanner::init())
            .plugin(tauri_plugin_safe_area_insets::init())
            .plugin(tauri_plugin_biometric::init())
            .plugin(tauri_plugin_sharesheet::init())
    }

    tauri_builder
        .invoke_handler(builder.invoke_handler())
        .setup(move |app| {
            builder.mount_events(app);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
