/**
 * NavSweeper shared modal helper.
 *
 * Small foundation used by the feature scripts. Scopes all lookups to the
 * given modal element so multiple modals can coexist on one page. Handles
 * Escape-to-close, Tab focus trapping and restoring focus to the opener.
 *
 * Usage:
 *   NswModal.open( modal );
 *   NswModal.bind( modal, form, onClose );
 */
(function () {
	'use strict';

	const FOCUSABLE =
		'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

	// Per-modal state: the bound close() callback and the element to refocus.
	const state = new WeakMap();

	// The modal currently shown, so Escape/Tab work wherever focus happens to be.
	let activeModal = null;

	function getFocusable( modal ) {
		return Array.from( modal.querySelectorAll( FOCUSABLE ) ).filter(
			( el ) => el.offsetParent !== null
		);
	}

	function openModal( modal ) {
		const entry = state.get( modal ) || {};
		entry.opener = document.activeElement;
		state.set( modal, entry );

		modal.style.display = 'block';
		document.body.style.overflow = 'hidden';
		activeModal = modal;

		const body = modal.querySelector( '.nsw-modal-body' );
		const first = ( body && getFocusable( body )[ 0 ] ) || getFocusable( modal )[ 0 ];
		if ( first ) {
			first.focus();
		}
	}

	function closeModal( modal, form ) {
		modal.style.display = 'none';
		document.body.style.overflow = '';
		if ( activeModal === modal ) {
			activeModal = null;
		}
		if ( form ) {
			form.reset();
		}

		const entry = state.get( modal );
		if ( entry && entry.opener && typeof entry.opener.focus === 'function' ) {
			entry.opener.focus();
			entry.opener = null;
		}
	}

	function trapFocus( modal, event ) {
		const focusable = getFocusable( modal );
		if ( focusable.length === 0 ) {
			event.preventDefault();
			return;
		}

		const first = focusable[ 0 ];
		const last = focusable[ focusable.length - 1 ];

		if ( event.shiftKey && document.activeElement === first ) {
			event.preventDefault();
			last.focus();
		} else if ( ! event.shiftKey && document.activeElement === last ) {
			event.preventDefault();
			first.focus();
		}
	}

	function bindModal( modal, form, onClose ) {
		function close() {
			closeModal( modal, form );
			if ( typeof onClose === 'function' ) {
				onClose();
			}
		}

		const entry = state.get( modal ) || {};
		entry.close = close;
		state.set( modal, entry );

		const closeBtn = modal.querySelector( '.nsw-modal-close' );
		if ( closeBtn ) {
			closeBtn.addEventListener( 'click', close );
		}

		const cancelBtn = modal.querySelector( '.nsw-modal-cancel' );
		if ( cancelBtn ) {
			cancelBtn.addEventListener( 'click', close );
		}

		modal.addEventListener( 'click', ( event ) => {
			if ( event.target === modal ) {
				close();
			}
		} );
	}

	document.addEventListener( 'keydown', ( event ) => {
		if ( ! activeModal ) {
			return;
		}

		if ( event.key === 'Escape' ) {
			event.preventDefault();
			const entry = state.get( activeModal );
			if ( entry && entry.close ) {
				entry.close();
			} else {
				closeModal( activeModal );
			}
		} else if ( event.key === 'Tab' ) {
			trapFocus( activeModal, event );
		}
	} );

	window.NswModal = {
		open: openModal,
		close: closeModal,
		bind: bindModal,
	};
})();
