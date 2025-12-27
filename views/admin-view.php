<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$menus = wp_get_nav_menus();
$selected_menu_id = isset( $_GET['menu_id'] ) ? intval( $_GET['menu_id'] ) : ( ! empty( $menus ) ? $menus[0]->term_id : 0 );
?>

<div class="wrap">
	<h1 class="wp-heading-inline">NavSweeper</h1>
	<hr class="wp-header-end">

	<!-- Success Notices -->
	<?php if ( isset( $_GET['count'] ) && isset( $_GET['action_type'] ) ) : ?>
		<?php 
			$count = intval( $_GET['count'] ); 
			$action = sanitize_text_field( $_GET['action_type'] );
		?>
		<div class="notice notice-success is-dismissible">
			<p>Successfully <strong><?php echo esc_html( $action ); ?></strong> <strong><?php echo esc_html( $count ); ?></strong> menu item<?php echo $count != 1 ? 's' : ''; ?>.</p>
		</div>
	<?php endif; ?>

	<!-- Error Notices -->
	<?php if ( isset( $_GET['error'] ) ) : ?>
		<?php 
			$error = sanitize_text_field( $_GET['error'] );
			$err_msg = 'An error occurred.';
			if( 'invalid_menu' === $error ) $err_msg = 'Invalid destination menu.';
			if( 'no_target' === $error ) $err_msg = 'Please select a destination menu.';
			if( 'no_items' === $error ) $err_msg = 'No items selected.';
			if( 'no_fields' === $error ) $err_msg = 'Please select at least one field to update.';
			if( 'missing_fields' === $error ) $err_msg = 'Please fill in all required fields (Label and URL).';
			if( 'add_failed' === $error ) $err_msg = 'Failed to add menu item. Please try again.';
		?>
		<div class="notice notice-error is-dismissible">
			<p><?php echo esc_html( $err_msg ); ?></p>
		</div>
	<?php endif; ?>

	<?php if ( empty( $menus ) ) : ?>
		<div class="notice notice-info"><p>No menus found. Create a menu in Appearance > Menus first.</p></div>
	<?php else : ?>

		<!-- Menu Selector -->
		<form method="get" action="<?php echo esc_url( admin_url( 'themes.php' ) ); ?>">
			<input type="hidden" name="page" value="navsweeper-bulk-delete" />
			<div class="navsweeper-tablenav">
				<div class="navsweeper-menu-selector">
					<label for="menu_id" class="screen-reader-text">Select Menu</label>
					<select name="menu_id" id="menu_id">
						<?php foreach ( $menus as $menu ) : ?>
							<option value="<?php echo esc_attr( $menu->term_id ); ?>" <?php selected( $selected_menu_id, $menu->term_id ); ?>>
								<?php echo esc_html( $menu->name ); ?>
							</option>
						<?php endforeach; ?>
					</select>
					<input type="submit" class="button" value="Load Menu Items">
				</div>
			</div>
		</form>

		<?php 
		$menu_items = wp_get_nav_menu_items( $selected_menu_id );
		?>

		<?php if ( ! $menu_items ) : ?>
			<div class="card" style="margin-top: 20px;">
				<p>This menu is empty.</p>
			</div>
		<?php else : ?>
			<form method="post" id="navsweeper-form" action="<?php echo esc_url( admin_url( 'themes.php?page=navsweeper-bulk-delete&menu_id=' . $selected_menu_id ) ); ?>">
				<?php wp_nonce_field( 'navsweeper_action', 'navsweeper_nonce' ); ?>
				<input type="hidden" name="current_menu_id" value="<?php echo esc_attr( $selected_menu_id ); ?>">
				
				<table class="wp-list-table widefat fixed striped table-view-list">
					<thead>
						<tr>
							<td id="cb" class="manage-column column-cb check-column">
								<input id="cb-select-all-1" type="checkbox">
							</td>
							<th scope="col" class="manage-column column-primary">Link Text (Label)</th>
							<th scope="col" class="manage-column">URL</th>
							<th scope="col" class="manage-column">Type</th>
							<th scope="col" class="manage-column column-add" style="width: 50px;"></th>
						</tr>
					</thead>

					<tbody id="the-list">
						<?php 
						$item_index = 0;
						foreach ( $menu_items as $item ) : 
							$item_index++;
						?>
							<tr class="navsweeper-menu-item-row" data-item-id="<?php echo esc_attr( $item->ID ); ?>" data-item-index="<?php echo esc_attr( $item_index ); ?>">
								<th scope="row" class="check-column">
									<input type="checkbox" name="menu_items_to_delete[]" value="<?php echo esc_attr( $item->ID ); ?>">
								</th>
								<td class="column-primary">
									<strong><?php echo esc_html( $item->title ); ?></strong>
								</td>
								<td><?php echo esc_html( $item->url ); ?></td>
								<td><?php echo esc_html( $item->type_label ); ?></td>
								<td class="column-add">
									<button type="button" class="navsweeper-add-item-btn" 
											data-item-id="<?php echo esc_attr( $item->ID ); ?>"
											data-item-index="<?php echo esc_attr( $item_index ); ?>"
											aria-label="Add menu item">
										<i class="fas fa-plus navsweeper-add-icon"></i>
									</button>
								</td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>

				<!-- Action Bar -->
				<div class="navsweeper-action-bar">
					
					<!-- Delete Section -->
					<div class="navsweeper-delete-section">
						<input type="submit" 
							   name="navsweeper_bulk_delete" 
							   class="button button-link-delete" 
							   style="text-decoration: none; border: 1px solid #d63638; padding: 0 10px; line-height: 2;"
							   value="Delete Selected"
							   onclick="return confirm('Are you sure you want to delete these items?');">
					</div>

					<!-- Move Section -->
					<div style="padding: 10px; background: #fff; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 15px;">
						<strong style="display: block; margin-bottom: 8px; font-size: 14px;">Bulk Move Menu Items</strong>
						<div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
							<label for="destination_menu_id" style="font-weight: 600; margin: 0;">Move selected to:</label>
							<select name="destination_menu_id" id="destination_menu_id" style="min-width: 200px; padding: 5px; height: 30px; line-height: 1">
								<option value="0">Select Destination Menu</option>
								<?php foreach ( $menus as $menu ) : ?>
									<option value="<?php echo esc_attr( $menu->term_id ); ?>" <?php selected( $selected_menu_id, $menu->term_id ); ?>>
										<?php echo esc_html( $menu->name ); ?><?php echo ( $menu->term_id === $selected_menu_id ) ? ' (current)' : ''; ?>
									</option>
								<?php endforeach; ?>
							</select>
							
							<input type="submit" 
								   name="navsweeper_bulk_move" 
								   id="navsweeper_btn_move"
								   class="button button-primary" 
								   value="Move Items">
						</div>
					</div>

					<!-- Bulk Edit Section -->
					<div style="padding: 10px; background: #fff; border: 1px solid #ccc; border-radius: 4px;">
						<strong style="display: block; margin-bottom: 8px; font-size: 14px;">Bulk Edit Menu Items</strong>
						<button type="button" id="navsweeper_btn_bulk_edit" class="button button-secondary">
							Edit Selected Items
						</button>
					</div>
				</div>
			</form>

			<!-- Bulk Edit Modal -->
			<div id="navsweeper-bulk-edit-modal" class="navsweeper-modal" style="display: none;">
				<div class="navsweeper-modal-content">
					<div class="navsweeper-modal-header">
						<h2>Bulk Edit Menu Items</h2>
						<span class="navsweeper-modal-close">&times;</span>
					</div>
					<form method="post" id="navsweeper-bulk-edit-form" action="<?php echo esc_url( admin_url( 'themes.php?page=navsweeper-bulk-delete&menu_id=' . $selected_menu_id ) ); ?>">
						<?php wp_nonce_field( 'navsweeper_action', 'navsweeper_nonce' ); ?>
						<input type="hidden" name="current_menu_id" value="<?php echo esc_attr( $selected_menu_id ); ?>">
						<!-- Menu items will be added dynamically via JavaScript -->
						
						<div class="navsweeper-modal-body">
							<p class="description" style="margin-bottom: 15px;">
								<strong>Note:</strong> Only check the fields you want to update. Leave fields unchecked to keep their current values.
							</p>

							<!-- Label Field -->
							<div class="navsweeper-edit-field" style="margin-bottom: 15px;">
								<label style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
									<input type="checkbox" name="bulk_edit_fields[]" value="label" class="navsweeper-field-checkbox">
									<strong>Label (Link Text)</strong>
								</label>
								<input type="text" name="bulk_edit_label" class="regular-text" placeholder="New label for all selected items" style="width: 100%;">
							</div>

							<!-- URL Field -->
							<div class="navsweeper-edit-field" style="margin-bottom: 15px;">
								<label style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
									<input type="checkbox" name="bulk_edit_fields[]" value="url" class="navsweeper-field-checkbox">
									<strong>URL</strong>
								</label>
								<input type="url" name="bulk_edit_url" class="regular-text" placeholder="https://example.com" style="width: 100%;">
							</div>

							<!-- CSS Classes Field -->
							<div class="navsweeper-edit-field" style="margin-bottom: 15px;">
								<label style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
									<input type="checkbox" name="bulk_edit_fields[]" value="css_classes" class="navsweeper-field-checkbox">
									<strong>CSS Classes</strong>
								</label>
								<input type="text" name="bulk_edit_css_classes" class="regular-text" placeholder="class1 class2 class3" style="width: 100%;">
								<p class="description">Separate multiple classes with spaces</p>
							</div>

							<!-- Link Target Field -->
							<div class="navsweeper-edit-field" style="margin-bottom: 15px;">
								<label style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
									<input type="checkbox" name="bulk_edit_fields[]" value="link_target" class="navsweeper-field-checkbox">
									<strong>Link Target</strong>
								</label>
								<select name="bulk_edit_link_target" class="regular-text" style="width: 100%;">
									<option value="">Same window/tab</option>
									<option value="_blank">New window/tab</option>
									<option value="_self">Same window/tab (explicit)</option>
									<option value="_parent">Parent frame</option>
									<option value="_top">Top frame</option>
								</select>
							</div>

							<!-- Description Field -->
							<div class="navsweeper-edit-field" style="margin-bottom: 15px;">
								<label style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
									<input type="checkbox" name="bulk_edit_fields[]" value="description" class="navsweeper-field-checkbox">
									<strong>Description</strong>
								</label>
								<textarea name="bulk_edit_description" class="large-text" rows="3" placeholder="Description for menu items" style="width: 100%;"></textarea>
							</div>
						</div>

						<div class="navsweeper-modal-footer">
							<button type="button" class="button navsweeper-modal-cancel">Cancel</button>
							<input type="submit" name="navsweeper_bulk_edit" class="button button-primary" value="Update Items">
						</div>
					</form>
				</div>
			</div>

			<!-- Add Menu Item Modal -->
			<div id="navsweeper-add-item-modal" class="navsweeper-modal" style="display: none;">
				<div class="navsweeper-modal-content">
					<div class="navsweeper-modal-header">
						<h2>Add New Menu Item</h2>
						<span class="navsweeper-modal-close navsweeper-add-modal-close">&times;</span>
					</div>
					<form method="post" id="navsweeper-add-item-form" action="<?php echo esc_url( admin_url( 'themes.php?page=navsweeper-bulk-delete&menu_id=' . $selected_menu_id ) ); ?>">
						<?php wp_nonce_field( 'navsweeper_action', 'navsweeper_nonce' ); ?>
						<input type="hidden" name="current_menu_id" value="<?php echo esc_attr( $selected_menu_id ); ?>">
						<input type="hidden" name="reference_item_id" id="navsweeper-reference-item-id" value="">
						<input type="hidden" name="insert_position" id="navsweeper-insert-position" value="">
						
						<div class="navsweeper-modal-body">
							<p class="description" style="margin-bottom: 15px;">
								<strong>Add new menu item:</strong> <span id="navsweeper-position-text"></span>
							</p>

							<!-- Label Field -->
							<div class="navsweeper-edit-field" style="margin-bottom: 15px;">
								<label style="display: block; margin-bottom: 5px;">
									<strong>Label (Link Text) <span style="color: #d63638;">*</span></strong>
								</label>
								<input type="text" name="new_item_label" id="new_item_label" class="regular-text" placeholder="Menu item label" style="width: 100%;" required>
							</div>

							<!-- URL Field -->
							<div class="navsweeper-edit-field" style="margin-bottom: 15px;">
								<label style="display: block; margin-bottom: 5px;">
									<strong>URL <span style="color: #d63638;">*</span></strong>
								</label>
								<input type="url" name="new_item_url" id="new_item_url" class="regular-text" placeholder="https://example.com" style="width: 100%;" required>
							</div>

							<!-- CSS Classes Field -->
							<div class="navsweeper-edit-field" style="margin-bottom: 15px;">
								<label style="display: block; margin-bottom: 5px;">
									<strong>CSS Classes</strong>
								</label>
								<input type="text" name="new_item_css_classes" id="new_item_css_classes" class="regular-text" placeholder="class1 class2 class3" style="width: 100%;">
								<p class="description">Separate multiple classes with spaces</p>
							</div>

							<!-- Link Target Field -->
							<div class="navsweeper-edit-field" style="margin-bottom: 15px;">
								<label style="display: block; margin-bottom: 5px;">
									<strong>Link Target</strong>
								</label>
								<select name="new_item_link_target" id="new_item_link_target" class="regular-text" style="width: 100%;">
									<option value="">Same window/tab</option>
									<option value="_blank">New window/tab</option>
									<option value="_self">Same window/tab (explicit)</option>
									<option value="_parent">Parent frame</option>
									<option value="_top">Top frame</option>
								</select>
							</div>

							<!-- Description Field -->
							<div class="navsweeper-edit-field" style="margin-bottom: 15px;">
								<label style="display: block; margin-bottom: 5px;">
									<strong>Description</strong>
								</label>
								<textarea name="new_item_description" id="new_item_description" class="large-text" rows="3" placeholder="Description for menu item" style="width: 100%;"></textarea>
							</div>
						</div>

						<div class="navsweeper-modal-footer">
							<button type="button" class="button navsweeper-modal-cancel navsweeper-add-modal-cancel">Cancel</button>
							<input type="submit" name="navsweeper_add_item" class="button button-primary" value="Add Item">
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
					var moveBtn = document.getElementById('navsweeper_btn_move');
					if(moveBtn) {
						moveBtn.addEventListener('click', function(e) {
							var dest = document.getElementById('destination_menu_id');
							var checkboxes = document.querySelectorAll('input[name="menu_items_to_delete[]"]:checked');
							
							if(checkboxes.length === 0) {
								alert('Please select at least one item to move.');
								e.preventDefault();
								return false;
							}

							if(!dest || dest.value == "0") {
								alert('Please select a valid destination menu.');
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
