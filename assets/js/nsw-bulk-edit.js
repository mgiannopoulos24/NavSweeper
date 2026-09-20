/**
 * NavSweeper bulk edit modal and form validation.
 *
 * Depends on NswModal (assets/js/nsw-modal.js) and the `nswI18n`
 * strings localized in PHP.
 */
(function () {
	'use strict';

	const CHECKBOX_SELECTOR = 'input[name="menu_items_to_delete[]"]';

	function findValueInput( field ) {
		switch ( field ) {
			case 'label':
				return document.querySelector( 'input[name="bulk_edit_label"]' );
			case 'url':
				return document.querySelector( 'input[name="bulk_edit_url"]' );
			case 'css_classes':
				return document.querySelector( 'input[name="bulk_edit_css_classes"]' );
			case 'description':
				return document.querySelector( 'textarea[name="bulk_edit_description"]' );
			default:
				return null;
		}
	}

	function syncCheckedItemsInto( form ) {
		form.querySelectorAll( CHECKBOX_SELECTOR ).forEach( ( input ) => input.remove() );

		document.querySelectorAll( CHECKBOX_SELECTOR + ':checked' ).forEach( ( item ) => {
			const hidden = document.createElement( 'input' );
			hidden.type = 'hidden';
			hidden.name = 'menu_items_to_delete[]';
			hidden.value = item.value;
			form.appendChild( hidden );
		} );
	}

	document.addEventListener( 'DOMContentLoaded', () => {
		const bulkEditBtn = document.getElementById( 'nsw_btn_bulk_edit' );
		const bulkEditModal = document.getElementById( 'nsw-bulk-edit-modal' );
		const bulkEditForm = document.getElementById( 'nsw-bulk-edit-form' );

		if ( bulkEditModal && bulkEditForm ) {
			NswModal.bind( bulkEditModal, bulkEditForm );
		}

		if ( bulkEditBtn && bulkEditModal ) {
			bulkEditBtn.addEventListener( 'click', () => {
				if ( document.querySelectorAll( CHECKBOX_SELECTOR + ':checked' ).length === 0 ) {
					alert( nswI18n.selectEditItems );
					return;
				}
				NswModal.open( bulkEditModal );
			} );
		}

		if ( bulkEditForm ) {
			bulkEditForm.addEventListener( 'submit', ( event ) => {
				const checkedFields = bulkEditForm.querySelectorAll( '.nsw-field-checkbox:checked' );
				if ( checkedFields.length === 0 ) {
					alert( nswI18n.selectFields );
					event.preventDefault();
					return;
				}

				let hasError = false;
				checkedFields.forEach( ( field ) => {
					const input = findValueInput( field.value );
					if ( input && ! input.value.trim() ) {
						hasError = true;
					}
				} );

				if ( hasError ) {
					alert( nswI18n.provideValues );
					event.preventDefault();
					return;
				}

				syncCheckedItemsInto( bulkEditForm );

				const count = bulkEditForm.querySelectorAll( CHECKBOX_SELECTOR ).length;
				if ( ! confirm( nswI18n.confirmUpdate.replace( '%d', count ) ) ) {
					event.preventDefault();
				}
			} );
		}
	} );
})();
