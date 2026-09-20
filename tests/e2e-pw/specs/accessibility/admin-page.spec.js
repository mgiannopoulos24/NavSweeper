import { test } from '@playwright/test';
import { createMenu, deleteMenu, expectAccessible, gotoMenu, table, uniqueName } from '../../helpers';

/**
 * axe runs against the plugin's own markup (#wpbody-content .wrap) so
 * wp-admin chrome outside our control does not produce noise.
 */
test.describe( 'Accessibility: admin page', () => {
	/** @type {import('../../helpers').SeededMenu} */
	let menu;

	test.beforeEach( async ( { page }, testInfo ) => {
		menu = await createMenu( page, uniqueName( testInfo ), [ 'Home', 'About', 'Contact' ] );
	} );

	test.afterEach( async ( { page } ) => {
		await deleteMenu( page, menu.id );
	} );

	test( 'items table and action bar', async ( { page } ) => {
		await gotoMenu( page, menu.id );
		await expectAccessible( page, 'admin page' );
	} );

	test( 'empty menu state', async ( { page }, testInfo ) => {
		const empty = await createMenu( page, uniqueName( testInfo, 'Empty' ) );
		try {
			await gotoMenu( page, empty.id );
			await expectAccessible( page, 'empty state' );
		} finally {
			await deleteMenu( page, empty.id );
		}
	} );

	test( 'success and error notices', async ( { page } ) => {
		await gotoMenu( page, menu.id );
		await page.goto( `${ page.url() }&count=1&action_type=added` );
		await expectAccessible( page, 'success notice' );

		await gotoMenu( page, menu.id );
		await page.goto( `${ page.url() }&error=no_items` );
		await expectAccessible( page, 'error notice' );
	} );

	test( 'add-item dropdown open', async ( { page } ) => {
		await gotoMenu( page, menu.id );
		await table( page ).addButton( 'About' ).click();
		await expectAccessible( page, 'dropdown open' );
	} );
} );
