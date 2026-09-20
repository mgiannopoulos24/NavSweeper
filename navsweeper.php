<?php
/**
 * Plugin Name: NavSweeper
 * Plugin URI: https://github.com/mgiannopoulos24/navsweeper
 * Description: Expand your menu capabilities. Bulk select, delete, and move navigation menu items.
 * Version: 1.0.0
 * Requires at least: 6.5
 * Tested up to: 7.1
 * Requires PHP: 8.1
 * Author: Marios Giannopoulos
 * Author URI: https://github.com/mgiannopoulos24
 * License: GNU General Public License v3
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain: navsweeper
 * Domain Path: /languages
 *
 * @package NavSweeper
 */

/**
 * Exit if accessed directly
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Define plugin constants
 */
define( 'NAVSWEEPER_VERSION', '1.0.0' );
define( 'NAVSWEEPER_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'NAVSWEEPER_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'NAVSWEEPER_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

/**
 * Initialize the plugin
 */
require_once NAVSWEEPER_PLUGIN_DIR . 'includes/class-navsweeper-plugin.php';

/**
 * Get the main plugin instance
 *
 * @return NavSweeper_Plugin
 */
function navsweeper() {
	return NavSweeper_Plugin::get_instance();
}

/**
 * Initialize the plugin
 */
navsweeper();
