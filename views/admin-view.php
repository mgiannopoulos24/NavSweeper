<?php
/**
 * Admin view for NavSweeper
 *
 * @package NavSweeper
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$menus            = wp_get_nav_menus();
$selected_menu_id = isset( $_GET['menu_id'] ) ? intval( wp_unslash( $_GET['menu_id'] ) ) : ( ! empty( $menus ) ? $menus[0]->term_id : 0 ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
?>

<div class="wrap">
	<h1 class="wp-heading-inline"><?php _e( 'NavSweeper', 'navsweeper' ); ?></h1>
	<hr class="wp-header-end">

	<!-- Success Notices -->
	<?php if ( isset( $_GET['count'] ) && isset( $_GET['action_type'] ) ) : // phpcs:ignore WordPress.Security.NonceVerification.Recommended ?>
		<?php
		$count       = intval( wp_unslash( $_GET['count'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$action_type = sanitize_text_field( wp_unslash( $_GET['action_type'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		$action_labels = array(
			'deleted' => __( 'deleted', 'navsweeper' ),
			'moved'   => __( 'moved', 'navsweeper' ),
			'added'   => __( 'added', 'navsweeper' ),
			'edited'  => __( 'edited', 'navsweeper' ),
		);
		$action_label  = isset( $action_labels[ $action_type ] ) ? $action_labels[ $action_type ] : $action_type;
		?>
		<div class="notice notice-success is-dismissible">
			<p>
				<?php
				printf(
					/* translators: %1$s is the action type, %2$d is the number of items. */
					esc_html( _n( 'Successfully %1$s %2$d menu item.', 'Successfully %1$s %2$d menu items.', $count, 'navsweeper' ) ),
					esc_html( $action_label ),
					intval( $count )
				);
				?>
			</p>
		</div>
	<?php endif; ?>

	<!-- Error Notices -->
	<?php if ( isset( $_GET['error'] ) ) : // phpcs:ignore WordPress.Security.NonceVerification.Recommended ?>
		<?php
		$error_type = sanitize_text_field( wp_unslash( $_GET['error'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		$error_messages = array(
			'invalid_menu'   => __( 'Invalid destination menu.', 'navsweeper' ),
			'no_target'      => __( 'Please select a destination menu.', 'navsweeper' ),
			'no_items'       => __( 'No items selected.', 'navsweeper' ),
			'no_fields'      => __( 'Please select at least one field to update.', 'navsweeper' ),
			'missing_fields' => __( 'Please fill in all required fields (Label and URL).', 'navsweeper' ),
			'add_failed'     => __( 'Failed to add menu item. Please try again.', 'navsweeper' ),
		);
		$err_msg        = isset( $error_messages[ $error_type ] ) ? $error_messages[ $error_type ] : __( 'An error occurred.', 'navsweeper' );
		?>
		<div class="notice notice-error is-dismissible">
			<p><?php echo esc_html( $err_msg ); ?></p>
		</div>
	<?php endif; ?>

	<?php if ( empty( $menus ) ) : ?>
		<div class="notice notice-info"><p><?php _e( 'No menus found. Create a menu in Appearance > Menus first.', 'navsweeper' ); ?></p></div>
	<?php else : ?>

		<!-- Menu Selector -->
		<form method="get" action="<?php echo esc_url( admin_url( 'themes.php' ) ); ?>">
			<input type="hidden" name="page" value="nsw-bulk-delete" />
			<div class="nsw-tablenav">
				<div class="nsw-menu-selector">
					<label for="menu_id" class="screen-reader-text"><?php _e( 'Select Menu', 'navsweeper' ); ?></label>
					<select name="menu_id" id="menu_id">
						<?php foreach ( $menus as $menu_item ) : ?>
							<option value="<?php echo esc_attr( $menu_item->term_id ); ?>" <?php selected( $selected_menu_id, $menu_item->term_id ); ?>>
								<?php echo esc_html( $menu_item->name ); ?>
							</option>
						<?php endforeach; ?>
					</select>
					<input type="submit" class="button" value="<?php esc_attr_e( 'Load Menu Items', 'navsweeper' ); ?>">
				</div>
			</div>
		</form>

		<?php
		$menu_items = wp_get_nav_menu_items( $selected_menu_id );
		?>

		<?php if ( ! $menu_items ) : ?>
			<div class="card nsw-empty-menu">
				<p><?php _e( 'This menu is empty.', 'navsweeper' ); ?></p>
			</div>
		<?php else : ?>
			<form method="post" id="nsw-form" action="<?php echo esc_url( admin_url( 'themes.php?page=nsw-bulk-delete&menu_id=' . $selected_menu_id ) ); ?>">
				<?php wp_nonce_field( 'nsw_action', 'nsw_nonce' ); ?>
				<input type="hidden" name="current_menu_id" value="<?php echo esc_attr( $selected_menu_id ); ?>">

				<table class="wp-list-table widefat fixed striped table-view-list">
					<thead>
						<tr>
							<td id="cb" class="manage-column column-cb check-column">
								<input id="cb-select-all-1" type="checkbox">
							</td>
							<th scope="col" class="manage-column column-primary"><?php _e( 'Link Text (Label)', 'navsweeper' ); ?></th>
							<th scope="col" class="manage-column"><?php _e( 'URL', 'navsweeper' ); ?></th>
							<th scope="col" class="manage-column"><?php _e( 'Type', 'navsweeper' ); ?></th>
							<th scope="col" class="manage-column column-add"></th>
						</tr>
					</thead>

					<tbody id="the-list">
						<?php
						$item_index = 0;
						foreach ( $menu_items as $item ) :
							++$item_index;
							?>
							<tr class="nsw-menu-item-row" data-item-id="<?php echo esc_attr( $item->ID ); ?>" data-item-index="<?php echo esc_attr( $item_index ); ?>">
								<th scope="row" class="check-column">
									<input type="checkbox" name="menu_items_to_delete[]" value="<?php echo esc_attr( $item->ID ); ?>">
								</th>
								<td class="column-primary">
									<strong><?php echo esc_html( $item->title ); ?></strong>
								</td>
								<td><?php echo esc_html( $item->url ); ?></td>
								<td><?php echo esc_html( $item->type_label ); ?></td>
								<td class="column-add">
									<button type="button" class="nsw-add-item-btn"
											data-item-id="<?php echo esc_attr( $item->ID ); ?>"
											data-item-index="<?php echo esc_attr( $item_index ); ?>"
											aria-label="<?php esc_attr_e( 'Add menu item', 'navsweeper' ); ?>">
										<i class="fas fa-plus nsw-add-icon"></i>
									</button>
								</td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>

				<!-- Action Bar -->
				<div class="nsw-action-bar">

					<!-- Delete Section -->
					<div class="nsw-delete-section">
						<input type="submit"
								name="nsw_bulk_delete"
								class="button button-link-delete"
								value="<?php esc_attr_e( 'Delete Selected', 'navsweeper' ); ?>"
								onclick="return confirm('<?php echo esc_js( __( 'Are you sure you want to delete these items?', 'navsweeper' ) ); ?>');">
					</div>

					<!-- Move Section -->
					<div class="nsw-move-section">
						<strong><?php _e( 'Bulk Move Menu Items', 'navsweeper' ); ?></strong>
						<div class="nsw-move-section-inner">
							<label for="destination_menu_id"><?php _e( 'Move selected to:', 'navsweeper' ); ?></label>
							<select name="destination_menu_id" id="destination_menu_id">
								<option value="0"><?php _e( 'Select Destination Menu', 'navsweeper' ); ?></option>
								<?php foreach ( $menus as $menu_item ) : ?>
									<option value="<?php echo esc_attr( $menu_item->term_id ); ?>" <?php selected( $selected_menu_id, $menu_item->term_id ); ?>>
										<?php
										echo esc_html( $menu_item->name );
										if ( $menu_item->term_id === $selected_menu_id ) {
											echo ' ' . esc_html( __( '(current)', 'navsweeper' ) );
										}
										?>
									</option>
								<?php endforeach; ?>
							</select>

							<input type="submit"
									name="nsw_bulk_move"
									id="nsw_btn_move"
									class="button button-primary"
									value="<?php esc_attr_e( 'Move Items', 'navsweeper' ); ?>">
						</div>
					</div>

					<!-- Bulk Edit Section -->
					<div class="nsw-bulk-edit-section">
						<strong><?php _e( 'Bulk Edit Menu Items', 'navsweeper' ); ?></strong>
						<button type="button" id="nsw_btn_bulk_edit" class="button button-secondary">
							<?php _e( 'Edit Selected Items', 'navsweeper' ); ?>
						</button>
					</div>
				</div>
			</form>

			<!-- Bulk Edit Modal -->
			<div id="nsw-bulk-edit-modal" class="nsw-modal">
				<div class="nsw-modal-content">
					<div class="nsw-modal-header">
						<h2><?php _e( 'Bulk Edit Menu Items', 'navsweeper' ); ?></h2>
						<span class="nsw-modal-close">&times;</span>
					</div>
					<form method="post" id="nsw-bulk-edit-form" action="<?php echo esc_url( admin_url( 'themes.php?page=nsw-bulk-delete&menu_id=' . $selected_menu_id ) ); ?>">
						<?php wp_nonce_field( 'nsw_action', 'nsw_nonce' ); ?>
						<input type="hidden" name="current_menu_id" value="<?php echo esc_attr( $selected_menu_id ); ?>">
						<!-- Menu items will be added dynamically via JavaScript -->

						<div class="nsw-modal-body">
							<p class="description">
								<?php _e( 'Only check the fields you want to update. Leave fields unchecked to keep their current values.', 'navsweeper' ); ?>
							</p>

							<!-- Label Field -->
							<div class="nsw-edit-field">
								<label class="nsw-label-flex">
									<input type="checkbox" name="bulk_edit_fields[]" value="label" class="nsw-field-checkbox">
									<strong><?php _e( 'Label (Link Text)', 'navsweeper' ); ?></strong>
								</label>
								<input type="text" name="bulk_edit_label" class="regular-text" placeholder="<?php esc_attr_e( 'New label for all selected items', 'navsweeper' ); ?>">
							</div>

							<!-- URL Field -->
							<div class="nsw-edit-field">
								<label class="nsw-label-flex">
									<input type="checkbox" name="bulk_edit_fields[]" value="url" class="nsw-field-checkbox">
									<strong><?php _e( 'URL', 'navsweeper' ); ?></strong>
								</label>
								<input type="url" name="bulk_edit_url" class="regular-text" placeholder="https://example.com">
							</div>

							<!-- CSS Classes Field -->
							<div class="nsw-edit-field">
								<label class="nsw-label-flex">
									<input type="checkbox" name="bulk_edit_fields[]" value="css_classes" class="nsw-field-checkbox">
									<strong><?php _e( 'CSS Classes', 'navsweeper' ); ?></strong>
								</label>
								<input type="text" name="bulk_edit_css_classes" class="regular-text" placeholder="<?php esc_attr_e( 'class1 class2 class3', 'navsweeper' ); ?>">
								<p class="description"><?php _e( 'Separate multiple classes with spaces.', 'navsweeper' ); ?></p>
							</div>

							<!-- Link Target Field -->
							<div class="nsw-edit-field">
								<label class="nsw-label-flex">
									<input type="checkbox" name="bulk_edit_fields[]" value="link_target" class="nsw-field-checkbox">
									<strong><?php _e( 'Link Target', 'navsweeper' ); ?></strong>
								</label>
								<select name="bulk_edit_link_target" class="regular-text">
									<option value=""><?php _e( 'Same window/tab', 'navsweeper' ); ?></option>
									<option value="_blank"><?php _e( 'New window/tab', 'navsweeper' ); ?></option>
									<option value="_self"><?php _e( 'Same window/tab (explicit)', 'navsweeper' ); ?></option>
									<option value="_parent"><?php _e( 'Parent frame', 'navsweeper' ); ?></option>
									<option value="_top"><?php _e( 'Top frame', 'navsweeper' ); ?></option>
								</select>
							</div>

							<!-- Description Field -->
							<div class="nsw-edit-field">
								<label class="nsw-label-flex">
									<input type="checkbox" name="bulk_edit_fields[]" value="description" class="nsw-field-checkbox">
									<strong><?php _e( 'Description', 'navsweeper' ); ?></strong>
								</label>
								<textarea name="bulk_edit_description" class="large-text" rows="3" placeholder="<?php esc_attr_e( 'Description for menu items', 'navsweeper' ); ?>"></textarea>
							</div>
						</div>

						<div class="nsw-modal-footer">
							<button type="button" class="button nsw-modal-cancel"><?php _e( 'Cancel', 'navsweeper' ); ?></button>
							<input type="submit" name="nsw_bulk_edit" class="button button-primary" value="<?php esc_attr_e( 'Update Items', 'navsweeper' ); ?>">
						</div>
					</form>
				</div>
			</div>

			<!-- Add Menu Item Modal -->
			<div id="nsw-add-item-modal" class="nsw-modal">
				<div class="nsw-modal-content">
					<div class="nsw-modal-header">
						<h2><?php _e( 'Add New Menu Item', 'navsweeper' ); ?></h2>
						<span class="nsw-modal-close nsw-add-modal-close">&times;</span>
					</div>
					<form method="post" id="nsw-add-item-form" action="<?php echo esc_url( admin_url( 'themes.php?page=nsw-bulk-delete&menu_id=' . $selected_menu_id ) ); ?>">
						<?php wp_nonce_field( 'nsw_action', 'nsw_nonce' ); ?>
						<input type="hidden" name="current_menu_id" value="<?php echo esc_attr( $selected_menu_id ); ?>">
						<input type="hidden" name="reference_item_id" id="nsw-reference-item-id" value="">
						<input type="hidden" name="insert_position" id="nsw-insert-position" value="">

						<div class="nsw-modal-body">
							<p class="description">
								<strong><?php _e( 'Add new menu item:', 'navsweeper' ); ?></strong> <span id="nsw-position-text"></span>
							</p>

							<!-- Label Field -->
							<div class="nsw-edit-field">
								<label class="nsw-label-block">
									<strong><?php _e( 'Label (Link Text)', 'navsweeper' ); ?> <span class="nsw-required-asterisk">*</span></strong>
								</label>
								<input type="text" name="new_item_label" id="new_item_label" class="regular-text" placeholder="<?php esc_attr_e( 'Menu item label', 'navsweeper' ); ?>" required>
							</div>

							<!-- URL Field -->
							<div class="nsw-edit-field">
								<label class="nsw-label-block">
									<strong><?php _e( 'URL', 'navsweeper' ); ?> <span class="nsw-required-asterisk">*</span></strong>
								</label>
								<input type="url" name="new_item_url" id="new_item_url" class="regular-text" placeholder="https://example.com" required>
							</div>

							<!-- CSS Classes Field -->
							<div class="nsw-edit-field">
								<label class="nsw-label-block">
									<strong><?php _e( 'CSS Classes', 'navsweeper' ); ?></strong>
								</label>
								<input type="text" name="new_item_css_classes" id="new_item_css_classes" class="regular-text" placeholder="<?php esc_attr_e( 'class1 class2 class3', 'navsweeper' ); ?>">
								<p class="description"><?php _e( 'Separate multiple classes with spaces.', 'navsweeper' ); ?></p>
							</div>

							<!-- Link Target Field -->
							<div class="nsw-edit-field">
								<label class="nsw-label-block">
									<strong><?php _e( 'Link Target', 'navsweeper' ); ?></strong>
								</label>
								<select name="new_item_link_target" id="new_item_link_target" class="regular-text">
									<option value=""><?php _e( 'Same window/tab', 'navsweeper' ); ?></option>
									<option value="_blank"><?php _e( 'New window/tab', 'navsweeper' ); ?></option>
									<option value="_self"><?php _e( 'Same window/tab (explicit)', 'navsweeper' ); ?></option>
									<option value="_parent"><?php _e( 'Parent frame', 'navsweeper' ); ?></option>
									<option value="_top"><?php _e( 'Top frame', 'navsweeper' ); ?></option>
								</select>
							</div>

							<!-- Description Field -->
							<div class="nsw-edit-field">
								<label class="nsw-label-block">
									<strong><?php _e( 'Description', 'navsweeper' ); ?></strong>
								</label>
								<textarea name="new_item_description" id="new_item_description" class="large-text" rows="3" placeholder="<?php esc_attr_e( 'Description for menu item', 'navsweeper' ); ?>"></textarea>
							</div>
						</div>

						<div class="nsw-modal-footer">
							<button type="button" class="button nsw-modal-cancel nsw-add-modal-cancel"><?php _e( 'Cancel', 'navsweeper' ); ?></button>
							<input type="submit" name="nsw_add_item" class="button button-primary" value="<?php esc_attr_e( 'Add Item', 'navsweeper' ); ?>">
						</div>
					</form>
				</div>
			</div>

			<script type="text/javascript">
				document.addEventListener('DOMContentLoaded', function() {
					// 1. Handle "Select All"
					var selectAll = document.getElementById('cb-select-all-1');
					if(selectAll) {
						selectAll.addEventListener('change', function() {
							var checkboxes = document.querySelectorAll('input[name="menu_items_to_delete[]"]');
							for(var i=0; i<checkboxes.length; i++) {
								checkboxes[i].checked = this.checked;
							}
						});
					}

					// 2. Validate Move Button
					var moveBtn = document.getElementById('nsw_btn_move');
					if(moveBtn) {
						moveBtn.addEventListener('click', function(e) {
							var dest = document.getElementById('destination_menu_id');
							var checkboxes = document.querySelectorAll('input[name="menu_items_to_delete[]"]:checked');

							if(checkboxes.length === 0) {
								alert('<?php echo esc_js( __( 'Please select at least one item to move.', 'navsweeper' ) ); ?>');
								e.preventDefault();
								return false;
							}

							if(!dest || dest.value == "0") {
								alert('<?php echo esc_js( __( 'Please select a valid destination menu.', 'navsweeper' ) ); ?>');
								e.preventDefault();
								return false;
							}
						});
					}
				});
			</script>
		<?php endif; ?>
	<?php endif; ?>
</div>
