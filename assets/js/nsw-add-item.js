/**
 * NavSweeper add-item dropdown and modal.
 *
 * Depends on NswModal (assets/js/nsw-modal.js) and the `nswAddItemI18n`
 * strings localized in PHP.
 *
 * A single dropdown element is shared by every row: on click it is moved
 * into the clicked cell and its data attributes are updated.
 */
(function () {
	'use strict';

	function buildDropdown() {
		const dropdown = document.createElement( 'div' );
		dropdown.className = 'nsw-add-dropdown';
		dropdown.setAttribute( 'role', 'menu' );
		dropdown.innerHTML =
			'<a href="#" class="nsw-add-dropdown-item" role="menuitem" data-position="above">' +
			'<span class="dashicons dashicons-arrow-up-alt2" aria-hidden="true"></span> ' +
			nswAddItemI18n.addAbove +
			'</a>' +
			'<a href="#" class="nsw-add-dropdown-item" role="menuitem" data-position="below">' +
			'<span class="dashicons dashicons-arrow-down-alt2" aria-hidden="true"></span> ' +
			nswAddItemI18n.addBelow +
			'</a>';

		return dropdown;
	}

	document.addEventListener( 'DOMContentLoaded', () => {
		const addItemModal = document.getElementById( 'nsw-add-item-modal' );
		const addItemForm = document.getElementById( 'nsw-add-item-form' );
		const referenceInput = document.getElementById( 'nsw-reference-item-id' );
		const positionInput = document.getElementById( 'nsw-insert-position' );
		const positionText = document.getElementById( 'nsw-position-text' );
		const buttons = document.querySelectorAll( '.nsw-add-item-btn' );

		if ( addItemModal && addItemForm ) {
			NswModal.bind( addItemModal, addItemForm, () => {
				referenceInput.value = '';
				positionInput.value = '';
				positionText.textContent = '';
			} );
		}

		if ( buttons.length === 0 ) {
			return;
		}

		const dropdown = buildDropdown();
		const choices = Array.from( dropdown.querySelectorAll( '.nsw-add-dropdown-item' ) );
		let activeButton = null;

		function closeDropdown( restoreFocus ) {
			if ( ! activeButton ) {
				return;
			}
			dropdown.classList.remove( 'show' );
			activeButton.setAttribute( 'aria-expanded', 'false' );
			if ( restoreFocus ) {
				activeButton.focus();
			}
			activeButton = null;
		}

		function openDropdown( button ) {
			closeDropdown( false );

			const cell = button.parentElement;
			cell.style.position = 'relative';
			cell.appendChild( dropdown );

			dropdown.classList.add( 'show' );
			button.setAttribute( 'aria-expanded', 'true' );
			activeButton = button;

			choices[ 0 ].focus();
		}

		function selectChoice( choice ) {
			const button = activeButton;
			const row = button.closest( 'tr' );
			const position = choice.getAttribute( 'data-position' );
			const title = row.querySelector( '.column-primary strong' ).textContent.trim();
			const format = position === 'above' ? nswAddItemI18n.aboveFormat : nswAddItemI18n.belowFormat;

			referenceInput.value = button.getAttribute( 'data-item-id' );
			positionInput.value = position;
			positionText.textContent = format.replace( '%s', title );

			// Return focus to the trigger so the modal restores it on close.
			closeDropdown( true );

			if ( addItemModal ) {
				NswModal.open( addItemModal );
			}
		}

		buttons.forEach( ( button ) => {
			button.addEventListener( 'click', ( event ) => {
				event.preventDefault();
				event.stopPropagation();
				if ( activeButton === button ) {
					closeDropdown( false );
				} else {
					openDropdown( button );
				}
			} );

			button.addEventListener( 'keydown', ( event ) => {
				if ( event.key === 'ArrowDown' && activeButton !== button ) {
					event.preventDefault();
					openDropdown( button );
				}
			} );
		} );

		choices.forEach( ( choice, index ) => {
			choice.addEventListener( 'click', ( event ) => {
				event.preventDefault();
				event.stopPropagation();
				selectChoice( choice );
			} );

			choice.addEventListener( 'keydown', ( event ) => {
				switch ( event.key ) {
					case 'ArrowDown':
						event.preventDefault();
						choices[ ( index + 1 ) % choices.length ].focus();
						break;
					case 'ArrowUp':
						event.preventDefault();
						choices[ ( index - 1 + choices.length ) % choices.length ].focus();
						break;
					case 'Home':
						event.preventDefault();
						choices[ 0 ].focus();
						break;
					case 'End':
						event.preventDefault();
						choices[ choices.length - 1 ].focus();
						break;
					case 'Tab':
						closeDropdown( false );
						break;
				}
			} );
		} );

		dropdown.addEventListener( 'keydown', ( event ) => {
			if ( event.key === 'Escape' ) {
				event.preventDefault();
				event.stopPropagation();
				closeDropdown( true );
			}
		} );

		document.addEventListener( 'click', ( event ) => {
			if ( ! event.target.closest( '.nsw-add-item-btn' ) && ! event.target.closest( '.nsw-add-dropdown' ) ) {
				closeDropdown( false );
			}
		} );
	} );
})();
