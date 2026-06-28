<?php
/**
 * Plugin Name:       NavSweeper
 * Plugin URI:        https://github.com/mgiannopoulos24/navsweeper
 * Description:       Expand your menu capabilities. Bulk select, delete, and move navigation menu items.
 * Version:           1.0.0
 * Author:            Marios Giannopoulos
 * Author URI:        https://github.com/mgiannopoulos24
 * License:           GPL v3
 * Requires PHP:      8.3
 * Tested up to:      7.0
 * Text Domain:       navsweeper
 *
 * @package           NavSweeper
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'NAVSWEEPER_VERSION' ) ) {
	define( 'NAVSWEEPER_VERSION', '1.0.0' );
}
if ( ! defined( 'NAVSWEEPER_PATH' ) ) {
	define( 'NAVSWEEPER_PATH', plugin_dir_path( __FILE__ ) );
}
if ( ! defined( 'NAVSWEEPER_URL' ) ) {
	define( 'NAVSWEEPER_URL', plugin_dir_url( __FILE__ ) );
}

add_action( 'plugins_loaded', 'navsweeper_load_textdomain' );
/**
 * Load plugin textdomain.
 */
function navsweeper_load_textdomain() {
	load_plugin_textdomain( 'navsweeper', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
}

$class_file = NAVSWEEPER_PATH . 'includes/class-navsweeper-plugin.php';

if ( ! file_exists( $class_file ) ) {
	if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
		error_log( 'NavSweeper Error: Class file not found at ' . $class_file );
	}
	return;
}

require_once $class_file;

if ( class_exists( 'NavSweeper_Plugin' ) ) {
	new NavSweeper_Plugin();
}
