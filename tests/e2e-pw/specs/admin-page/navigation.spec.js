import { test, expect } from '@playwright/test';
import { createMenu, deleteMenu, gotoMenu, table, uniqueName, PAGE_PATH } from '../../helpers';

test.describe( 'Navigation and menu selection', () => {
	test( 'is reachable from the Appearance menu', async ( { page } ) => {
		await page.goto( '/wp-admin/themes.php' );
		await page.locator( '#menu-appearance' ).getByRole( 'link', { name: 'NavSweeper' } ).click();
		await expect( page ).toHaveURL( new RegExp( PAGE_PATH.replace( /[?]/g, '\\?' ) ) );
		await expect( page.getByRole( 'heading', { level: 1, name: 'NavSweeper' } ) ).toBeVisible();
	} );

	test( 'switches menus with the selector', async ( { page }, testInfo ) => {
		const first = await createMenu( page, uniqueName( testInfo, 'First' ), [ 'Home', 'About' ] );
		const second = await createMenu( page, uniqueName( testInfo, 'Second' ), [ 'Only item' ] );
		try {
			await gotoMenu( page, first.id );
			await expect( table( page ).labels ).toHaveText( [ 'Home', 'About' ] );

			await page.locator( '#menu_id' ).selectOption( String( second.id ) );
			await page.getByRole( 'button', { name: 'Load Menu Items' } ).click();

			await expect( page ).toHaveURL( new RegExp( `menu_id=${ second.id }` ) );
			await expect( page.locator( '#menu_id' ) ).toHaveValue( String( second.id ) );
			await expect( table( page ).labels ).toHaveText( [ 'Only item' ] );
		} finally {
			await deleteMenu( page, first.id );
			await deleteMenu( page, second.id );
		}
	} );

	test( 'shows an empty state for a menu with no items', async ( { page }, testInfo ) => {
		const empty = await createMenu( page, uniqueName( testInfo, 'Empty' ) );
		try {
			await gotoMenu( page, empty.id );
			await expect( page.locator( '.nsw-empty-menu' ) ).toHaveText( /This menu is empty/ );
			await expect( table( page ).rows ).toHaveCount( 0 );
		} finally {
			await deleteMenu( page, empty.id );
		}
	} );
} );
