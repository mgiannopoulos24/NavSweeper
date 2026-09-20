/**
 * NavSweeper items table: select-all, delete confirmation, move validation.
 *
 * Depends on the `nswI18n` strings localized in PHP.
 */
(function () {
	'use strict';

	const CHECKBOX_SELECTOR = 'input[name="menu_items_to_delete[]"]';

	function getCheckedItems() {
		return document.querySelectorAll( CHECKBOX_SELECTOR + ':checked' );
	}

	function buildMoveMessage( destinationSelect, count ) {
		const destinationName = destinationSelect.options[destinationSelect.selectedIndex].text;
		const currentTag = '(' + nswI18n.currentLabel + ')';

		if ( destinationName.indexOf( currentTag ) !== -1 ) {
			return nswI18n.confirmMoveSame.replace( '%d', count ) + '\n\n' + nswI18n.moveNote;
		}

		const cleanName = destinationName.replace( ' (' + nswI18n.currentLabel + ')', '' );
		return (
			nswI18n.confirmMoveOther.replace( '%1$d', count ).replace( '%2$s', cleanName ) +
			'\n\n' +
			nswI18n.moveNote
		);
	}

	document.addEventListener( 'DOMContentLoaded', () => {
		const selectAll = document.getElementById( 'cb-select-all-1' );
		if ( selectAll ) {
			selectAll.addEventListener( 'change', function () {
				const isChecked = this.checked;
				document.querySelectorAll( CHECKBOX_SELECTOR ).forEach( ( box ) => {
					box.checked = isChecked;
				} );
			} );
		}

		const deleteBtn = document.getElementById( 'nsw_btn_delete' );
		if ( deleteBtn ) {
			deleteBtn.addEventListener( 'click', ( event ) => {
				if ( ! confirm( nswI18n.confirmDelete ) ) {
					event.preventDefault();
				}
			} );
		}

		const moveBtn = document.getElementById( 'nsw_btn_move' );
		if ( moveBtn ) {
			moveBtn.addEventListener( 'click', ( event ) => {
				const checked = getCheckedItems();
				if ( checked.length === 0 ) {
					alert( nswI18n.selectMoveItems );
					event.preventDefault();
					return;
				}

				const destination = document.getElementById( 'destination_menu_id' );
				if ( ! destination || destination.value === '0' ) {
					alert( nswI18n.selectDestination );
					event.preventDefault();
					return;
				}

				if ( ! confirm( buildMoveMessage( destination, checked.length ) ) ) {
					event.preventDefault();
				}
			} );
		}
	} );
})();
