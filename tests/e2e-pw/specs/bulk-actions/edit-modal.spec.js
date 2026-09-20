import { test, expect } from '@playwright/test';
import { createMenu, deleteMenu, gotoMenu, modal, table, uniqueName } from '../../helpers';

test.describe( 'Bulk edit modal behaviour', () => {
	/** @type {import('../../helpers').SeededMenu} */
	let menu;

	test.beforeEach( async ( { page }, testInfo ) => {
		menu = await createMenu( page, uniqueName( testInfo ), [ 'Home', 'About' ] );
		await gotoMenu( page, menu.id );
		await table( page ).checkbox( 'Home' ).check();
	} );

	test.afterEach( async ( { page } ) => {
		await deleteMenu( page, menu.id );
	} );

	test( 'is a labelled dialog that focuses its first field', async ( { page } ) => {
		const t = table( page );
		const m = modal( page, 'nsw-bulk-edit-modal' );

		await t.bulkEditButton.click();
		await expect( m.root ).toBeVisible();
		await expect( m.root ).toHaveAttribute( 'role', 'dialog' );
		await expect( m.root ).toHaveAttribute( 'aria-modal', 'true' );
		await expect( m.root ).toHaveAccessibleName( 'Bulk Edit Menu Items' );
		await expect( m.close ).toHaveAccessibleName( 'Close' );
		await expect( m.root.locator( 'input.nsw-field-checkbox[value="label"]' ) ).toBeFocused();
	} );

	test( 'Escape, the close button and Cancel all close it and restore focus', async ( { page } ) => {
		const t = table( page );
		const m = modal( page, 'nsw-bulk-edit-modal' );

		await t.bulkEditButton.click();
		await page.keyboard.press( 'Escape' );
		await expect( m.root ).toBeHidden();
		await expect( t.bulkEditButton ).toBeFocused();

		await t.bulkEditButton.click();
		await m.close.click();
		await expect( m.root ).toBeHidden();
		await expect( t.bulkEditButton ).toBeFocused();

		await t.bulkEditButton.click();
		await m.cancel.click();
		await expect( m.root ).toBeHidden();
		await expect( t.bulkEditButton ).toBeFocused();
	} );

	test( 'clicking the backdrop closes it', async ( { page } ) => {
		const t = table( page );
		const m = modal( page, 'nsw-bulk-edit-modal' );

		await t.bulkEditButton.click();
		await m.root.click( { position: { x: 5, y: 5 } } );
		await expect( m.root ).toBeHidden();
	} );

	test( 'Tab is trapped inside the open modal', async ( { page } ) => {
		const t = table( page );
		const m = modal( page, 'nsw-bulk-edit-modal' );

		await t.bulkEditButton.click();
		await expect( m.root ).toBeVisible();

		for ( let i = 0; i < 25; i++ ) {
			await page.keyboard.press( 'Tab' );
			await expect( m.root.locator( ':focus' ) ).toHaveCount( 1 );
		}
		for ( let i = 0; i < 25; i++ ) {
			await page.keyboard.press( 'Shift+Tab' );
			await expect( m.root.locator( ':focus' ) ).toHaveCount( 1 );
		}
	} );
} );
