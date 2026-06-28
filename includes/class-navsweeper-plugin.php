<?php
/**
 * NavSweeper plugin class.
 *
 * @package NavSweeper
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Main plugin class for NavSweeper.
 */
class NavSweeper_Plugin {

	/**
	 * Constructor. Hooks into WordPress.
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
		add_action( 'admin_init', array( $this, 'handle_form_submission' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'after_setup_theme', array( $this, 'ensure_menu_support' ), 20 );
	}

	/**
	 * Enqueue admin assets.
	 *
	 * @param string $hook The current admin page hook.
	 */
	public function enqueue_assets( $hook ) {
		if ( 'appearance_page_nsw-bulk-delete' !== $hook ) {
			return;
		}

		// Enqueue Font Awesome for icons.
		wp_enqueue_style(
			'font-awesome',
			NAVSWEEPER_URL . 'assets/css/all.min.css',
			array(),
			'6.4.0'
		);

		wp_enqueue_script(
			'nsw-js',
			NAVSWEEPER_URL . 'assets/js/index.js',
			array(),
			NAVSWEEPER_VERSION,
			true
		);

		wp_localize_script(
			'nsw-js',
			'nswI18n',
			array(
				'selectEditItems'   => __( 'Please select at least one menu item to edit.', 'navsweeper' ),
				'selectFields'      => __( 'Please select at least one field to update.', 'navsweeper' ),
				'provideValues'     => __( 'Please provide values for all selected fields.', 'navsweeper' ),
				/* translators: %d: number of items */
				'confirmUpdate'     => __( 'Are you sure you want to update %d item(s)?', 'navsweeper' ),
				'selectMoveItems'   => __( 'Please select at least one menu item to move.', 'navsweeper' ),
				'selectDestination' => __( 'Please select a destination menu.', 'navsweeper' ),
				/* translators: %d: number of items */
				'confirmMoveSame'   => __( 'Are you sure you want to move %d item(s) within the current menu?', 'navsweeper' ),
				/* translators: %1$d: number of items, %2$s: destination menu name */
				'confirmMoveOther'  => __( 'Are you sure you want to move %1$d item(s) to "%2$s"?', 'navsweeper' ),
				'moveNote'          => __( 'Items will be reorganized as top-level items.', 'navsweeper' ),
				'currentLabel'      => __( '(current)', 'navsweeper' ),
			)
		);

		wp_enqueue_script(
			'nsw-add-item-js',
			NAVSWEEPER_URL . 'assets/js/add-item.js',
			array(),
			NAVSWEEPER_VERSION,
			true
		);

		wp_localize_script(
			'nsw-add-item-js',
			'nswAddItemI18n',
			array(
				'addAbove'    => __( 'Add Above', 'navsweeper' ),
				'addBelow'    => __( 'Add Below', 'navsweeper' ),
				/* translators: %s: menu item title */
				'aboveFormat' => __( 'above "%s"', 'navsweeper' ),
				/* translators: %s: menu item title */
				'belowFormat' => __( 'below "%s"', 'navsweeper' ),
				'enterLabel'  => __( 'Please enter a label for the menu item.', 'navsweeper' ),
				'enterURL'    => __( 'Please enter a URL for the menu item.', 'navsweeper' ),
			)
		);

		wp_enqueue_style(
			'nsw-css',
			NAVSWEEPER_URL . 'assets/css/style.css',
			array(),
			NAVSWEEPER_VERSION
		);
	}

	/**
	 * Ensure menu support for themes without registered locations.
	 */
	public function ensure_menu_support() {
		// Check if theme already has menu locations registered.
		$locations = get_nav_menu_locations();

		// If no menu locations are registered, register a default one.
		// This ensures the Menus submenu appears in Appearance.
		if ( empty( $locations ) ) {
			register_nav_menus(
				array(
					'primary' => __( 'Primary Menu', 'navsweeper' ),
				)
			);
		}
	}

	/**
	 * Add the admin submenu page.
	 */
	public function add_admin_menu() {
		add_submenu_page(
			'themes.php',
			__( 'NavSweeper', 'navsweeper' ),
			__( 'NavSweeper', 'navsweeper' ),
			'edit_theme_options',
			'nsw-bulk-delete',
			array( $this, 'render_admin_page' )
		);
	}

	/**
	 * Handle form submissions for delete, move, edit, and add item actions.
	 */
	public function handle_form_submission() {
		if ( ! isset( $_POST['nsw_bulk_delete'] ) && ! isset( $_POST['nsw_bulk_move'] ) && ! isset( $_POST['nsw_bulk_edit'] ) && ! isset( $_POST['nsw_add_item'] ) ) {
			return;
		}

		// Security Checks.
		if ( ! isset( $_POST['nsw_nonce'] ) || ! wp_verify_nonce( wp_unslash( $_POST['nsw_nonce'] ), 'nsw_action' ) ) { // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			wp_die( esc_html( __( 'Security check failed. Please try again.', 'navsweeper' ) ) );
		}

		if ( ! current_user_can( 'edit_theme_options' ) ) {
			wp_die( esc_html( __( 'You do not have permission to edit menus.', 'navsweeper' ) ) );
		}

		$count   = 0;
		$menu_id = isset( $_POST['current_menu_id'] ) ? intval( wp_unslash( $_POST['current_menu_id'] ) ) : ( isset( $_GET['menu_id'] ) ? intval( wp_unslash( $_GET['menu_id'] ) ) : 0 ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		$items       = isset( $_POST['menu_items_to_delete'] ) && is_array( $_POST['menu_items_to_delete'] ) ? array_map( 'intval', wp_unslash( $_POST['menu_items_to_delete'] ) ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$action_type = '';

		// Add Item functionality.
		if ( isset( $_POST['nsw_add_item'] ) ) {
			$action_type = 'added';

			// Validate required fields.
			$label = isset( $_POST['new_item_label'] ) ? sanitize_text_field( wp_unslash( $_POST['new_item_label'] ) ) : '';
			$url   = isset( $_POST['new_item_url'] ) ? esc_url_raw( wp_unslash( $_POST['new_item_url'] ) ) : '';

			if ( empty( $label ) || empty( $url ) ) {
				wp_safe_redirect(
					add_query_arg(
						array(
							'page'    => 'nsw-bulk-delete',
							'menu_id' => $menu_id,
							'error'   => 'missing_fields',
						),
						admin_url( 'themes.php' )
					)
				);
				exit;
			}

			// Get menu object.
			$nav_menu = wp_get_nav_menu_object( $menu_id );
			if ( ! $nav_menu || is_wp_error( $nav_menu ) ) {
				wp_safe_redirect(
					add_query_arg(
						array(
							'page'    => 'nsw-bulk-delete',
							'menu_id' => $menu_id,
							'error'   => 'invalid_menu',
						),
						admin_url( 'themes.php' )
					)
				);
				exit;
			}

			// Prepare menu item data.
			$menu_item_data = array(
				'menu-item-title'  => $label,
				'menu-item-url'    => $url,
				'menu-item-status' => 'publish',
				'menu-item-type'   => 'custom',
			);

			// Optional fields.
			if ( isset( $_POST['new_item_css_classes'] ) && ! empty( $_POST['new_item_css_classes'] ) ) {
				$classes                             = array_map( 'trim', explode( ' ', sanitize_text_field( wp_unslash( $_POST['new_item_css_classes'] ) ) ) );
				$classes                             = array_filter( $classes );
				$menu_item_data['menu-item-classes'] = implode( ' ', $classes );
			}

			if ( isset( $_POST['new_item_link_target'] ) && ! empty( $_POST['new_item_link_target'] ) ) {
				$menu_item_data['menu-item-target'] = sanitize_text_field( wp_unslash( $_POST['new_item_link_target'] ) );
			}

			if ( isset( $_POST['new_item_description'] ) && ! empty( $_POST['new_item_description'] ) ) {
				$menu_item_data['menu-item-description'] = sanitize_textarea_field( wp_unslash( $_POST['new_item_description'] ) );
			}

			// Get reference item and position.
			$reference_item_id = isset( $_POST['reference_item_id'] ) ? intval( wp_unslash( $_POST['reference_item_id'] ) ) : 0;
			$insert_position   = isset( $_POST['insert_position'] ) ? sanitize_text_field( wp_unslash( $_POST['insert_position'] ) ) : 'below';

			// Add the menu item.
			$new_item_id = wp_update_nav_menu_item( $menu_id, 0, $menu_item_data );

			if ( is_wp_error( $new_item_id ) ) {
				wp_safe_redirect(
					add_query_arg(
						array(
							'page'    => 'nsw-bulk-delete',
							'menu_id' => $menu_id,
							'error'   => 'add_failed',
						),
						admin_url( 'themes.php' )
					)
				);
				exit;
			}

			// If we have a reference item, adjust the menu order.
			if ( $reference_item_id > 0 ) {
				$menu_items = wp_get_nav_menu_items( $menu_id, array( 'post_status' => 'any' ) );

				// Find the reference item's menu order.
				$reference_order = null;
				foreach ( $menu_items as $item ) {
					if ( $item->ID === $reference_item_id ) {
						$reference_order = $item->menu_order;
						break;
					}
				}

				if ( null !== $reference_order ) {
					// Calculate new menu order.
					$new_order = ( 'above' === $insert_position ) ? $reference_order : $reference_order + 1;

					// Update menu order for the new item.
					update_post_meta( $new_item_id, '_menu_item_menu_order', $new_order );

					// Adjust menu orders for items that come after.
					foreach ( $menu_items as $item ) {
						if ( $item->ID === $new_item_id ) {
							continue;
						}

						$item_order = $item->menu_order;

						if ( 'above' === $insert_position && $item_order >= $reference_order ) {
							update_post_meta( $item->ID, '_menu_item_menu_order', $item_order + 1 );
						} elseif ( 'below' === $insert_position && $item_order > $reference_order ) {
							update_post_meta( $item->ID, '_menu_item_menu_order', $item_order + 1 );
						}
					}
				}
			}

			// Clear menu cache.
			wp_cache_delete( 'nav_menu_' . $menu_id, 'nav_menu' );

			$count = 1;

			// Redirect and exit.
			$redirect_url = add_query_arg(
				array(
					'page'        => 'nsw-bulk-delete',
					'count'       => $count,
					'action_type' => $action_type,
					'menu_id'     => $menu_id,
				),
				admin_url( 'themes.php' )
			);

			wp_safe_redirect( $redirect_url );
			exit;
		}

		// For delete, move, and edit operations, check if items are selected.
		if ( empty( $items ) ) {
			wp_safe_redirect(
				add_query_arg(
					array(
						'page'    => 'nsw-bulk-delete',
						'menu_id' => $menu_id,
						'error'   => 'no_items',
					),
					admin_url( 'themes.php' )
				)
			);
			exit;
		}

		// Delete functionality.
		if ( isset( $_POST['nsw_bulk_delete'] ) ) {
			$action_type = 'deleted';
			foreach ( $items as $item_id ) {
				$result = wp_delete_post( $item_id, true );
				if ( $result ) {
					++$count;
				}
			}
		}

		// Move functionality.
		if ( isset( $_POST['nsw_bulk_move'] ) ) {
			$action_type    = 'moved';
			$target_menu_id = isset( $_POST['destination_menu_id'] ) ? intval( wp_unslash( $_POST['destination_menu_id'] ) ) : 0;

			if ( $target_menu_id > 0 ) {
				$target_menu = wp_get_nav_menu_object( $target_menu_id );

				if ( ! $target_menu || is_wp_error( $target_menu ) ) {
					wp_safe_redirect(
						add_query_arg(
							array(
								'page'    => 'nsw-bulk-delete',
								'menu_id' => $menu_id,
								'error'   => 'invalid_menu',
							),
							admin_url( 'themes.php' )
						)
					);
					exit;
				}

				foreach ( $items as $item_id ) {
					// If moving to a different menu.
					if ( $target_menu_id !== $menu_id ) {
						wp_remove_object_terms( $item_id, $menu_id, 'nav_menu' );
						$term_result = wp_set_object_terms( $item_id, array( $target_menu_id ), 'nav_menu' );

						if ( ! is_wp_error( $term_result ) ) {
							update_post_meta( $item_id, '_menu_item_menu_item_parent', 0 );
							delete_post_meta( $item_id, '_menu_item_menu_order' );
							++$count;
						}
					} else {
						// Moving within same menu (resetting parents).
						update_post_meta( $item_id, '_menu_item_menu_item_parent', 0 );
						delete_post_meta( $item_id, '_menu_item_menu_order' );
						++$count;
					}
				}

				// Clear caches.
				wp_cache_delete( 'nav_menu_' . $menu_id, 'nav_menu' );
				if ( $target_menu_id !== $menu_id ) {
					wp_cache_delete( 'nav_menu_' . $target_menu_id, 'nav_menu' );
				}
			} else {
				wp_safe_redirect(
					add_query_arg(
						array(
							'page'    => 'nsw-bulk-delete',
							'menu_id' => $menu_id,
							'error'   => 'no_target',
						),
						admin_url( 'themes.php' )
					)
				);
				exit;
			}
		}

		// Bulk Edit functionality.
		if ( isset( $_POST['nsw_bulk_edit'] ) ) {
			$action_type      = 'edited';
			$fields_to_update = isset( $_POST['bulk_edit_fields'] ) && is_array( $_POST['bulk_edit_fields'] ) ? array_map( 'sanitize_text_field', wp_unslash( $_POST['bulk_edit_fields'] ) ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized

			if ( empty( $fields_to_update ) ) {
				wp_safe_redirect(
					add_query_arg(
						array(
							'page'    => 'nsw-bulk-delete',
							'menu_id' => $menu_id,
							'error'   => 'no_fields',
						),
						admin_url( 'themes.php' )
					)
				);
				exit;
			}

			foreach ( $items as $item_id ) {
				$item_updated = false;

				// Update Label (Title).
				if ( in_array( 'label', $fields_to_update, true ) && isset( $_POST['bulk_edit_label'] ) ) {
					$new_label = sanitize_text_field( wp_unslash( $_POST['bulk_edit_label'] ) );
					if ( ! empty( $new_label ) ) {
						wp_update_post(
							array(
								'ID'         => $item_id,
								'post_title' => $new_label,
							)
						);
						$item_updated = true;
					}
				}

				// Update URL.
				if ( in_array( 'url', $fields_to_update, true ) && isset( $_POST['bulk_edit_url'] ) ) {
					$new_url = esc_url_raw( wp_unslash( $_POST['bulk_edit_url'] ) );
					if ( ! empty( $new_url ) ) {
						update_post_meta( $item_id, '_menu_item_url', $new_url );
						$item_updated = true;
					}
				}

				// Update CSS Classes.
				if ( in_array( 'css_classes', $fields_to_update, true ) && isset( $_POST['bulk_edit_css_classes'] ) ) {
					$new_classes   = sanitize_text_field( wp_unslash( $_POST['bulk_edit_css_classes'] ) );
					$classes_array = ! empty( $new_classes ) ? array_map( 'trim', explode( ' ', $new_classes ) ) : array();
					$classes_array = array_filter( $classes_array );
					update_post_meta( $item_id, '_menu_item_classes', $classes_array );
					$item_updated = true;
				}

				// Update Link Target.
				if ( in_array( 'link_target', $fields_to_update, true ) && isset( $_POST['bulk_edit_link_target'] ) ) {
					$new_target = sanitize_text_field( wp_unslash( $_POST['bulk_edit_link_target'] ) );
					update_post_meta( $item_id, '_menu_item_target', $new_target );
					$item_updated = true;
				}

				// Update Description.
				if ( in_array( 'description', $fields_to_update, true ) && isset( $_POST['bulk_edit_description'] ) ) {
					$new_description = sanitize_textarea_field( wp_unslash( $_POST['bulk_edit_description'] ) );
					wp_update_post(
						array(
							'ID'           => $item_id,
							'post_content' => $new_description,
						)
					);
					$item_updated = true;
				}

				if ( $item_updated ) {
					++$count;
				}
			}

			// Clear menu cache.
			wp_cache_delete( 'nav_menu_' . $menu_id, 'nav_menu' );
		}

		$redirect_url = add_query_arg(
			array(
				'page'        => 'nsw-bulk-delete',
				'count'       => $count,
				'action_type' => $action_type,
				'menu_id'     => $menu_id,
			),
			admin_url( 'themes.php' )
		);

		wp_safe_redirect( $redirect_url );
		exit;
	}

	/**
	 * Render the admin page.
	 */
	public function render_admin_page() {
		if ( ! current_user_can( 'edit_theme_options' ) ) {
			return;
		}

		$file_path = NAVSWEEPER_PATH . 'views/admin-view.php';

		if ( file_exists( $file_path ) ) {
			include $file_path;
		} else {
			echo '<div class="notice notice-error"><p>' . esc_html(
				sprintf(
				/* translators: %s: file path */
					__( 'Error: View file not found at %s', 'navsweeper' ),
					$file_path
				)
			) . '</p></div>';
		}
	}
}
