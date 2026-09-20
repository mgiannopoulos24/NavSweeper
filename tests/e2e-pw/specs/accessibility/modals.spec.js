import { test } from '@playwright/test';
import { createMenu, deleteMenu, expectAccessible, gotoMenu, table, uniqueName } from '../../helpers';

test.describe( 'Accessibility: modals', () => {
	/** @type {import('../../helpers').SeededMenu} */
	let menu;

	test.beforeEach( async ( { page }, testInfo ) => {
		menu = await createMenu( page, uniqueName( testInfo ), [ 'Home', 'About', 'Contact' ] );
		await gotoMenu( page, menu.id );
	} );

	test.afterEach( async ( { page } ) => {
		await deleteMenu( page, menu.id );
	} );

	test( 'bulk edit modal open', async ( { page } ) => {
		const t = table( page );
		await t.checkbox( 'Home' ).check();
		await t.bulkEditButton.click();
		await expectAccessible( page, 'bulk edit modal', { include: '#nsw-bulk-edit-modal' } );
	} );

	test( 'add item modal open', async ( { page } ) => {
		await table( page ).addButton( 'Home' ).click();
		await page.locator( '.nsw-add-dropdown' ).getByRole( 'menuitem', { name: 'Add Below' } ).click();
		await expectAccessible( page, 'add item modal', { include: '#nsw-add-item-modal' } );
	} );
} );
