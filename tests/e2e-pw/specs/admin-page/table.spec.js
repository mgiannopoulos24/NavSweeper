import { test, expect } from '@playwright/test';
import { createMenu, deleteMenu, gotoMenu, table, uniqueName } from '../../helpers';

test.describe( 'Items table', () => {
	/** @type {import('../../helpers').SeededMenu} */
	let menu;

	test.beforeEach( async ( { page }, testInfo ) => {
		menu = await createMenu( page, uniqueName( testInfo ), [ 'Home', 'About', 'Contact' ] );
	} );

	test.afterEach( async ( { page } ) => {
		await deleteMenu( page, menu.id );
	} );

	test( 'lists the menu items in order', async ( { page } ) => {
		await gotoMenu( page, menu.id );
		const t = table( page );

		await expect( page.locator( '#menu_id' ) ).toHaveValue( String( menu.id ) );
		await expect( t.labels ).toHaveText( [ 'Home', 'About', 'Contact' ] );
		await expect( t.row( 'Home' ).locator( 'td' ).nth( 1 ) ).toHaveText( 'https://example.com/home/' );
		await expect( t.row( 'Home' ).locator( 'td' ).nth( 2 ) ).toHaveText( 'Custom Link' );
	} );

	test( 'every row checkbox has an accessible name', async ( { page } ) => {
		await gotoMenu( page, menu.id );
		const t = table( page );

		await expect( t.selectAll ).toHaveAccessibleName( 'Select All' );
		await expect( t.checkbox( 'About' ) ).toHaveAccessibleName( 'Select About' );
	} );

	test( 'select-all toggles every row checkbox', async ( { page } ) => {
		await gotoMenu( page, menu.id );
		const t = table( page );
		const boxes = t.rows.locator( 'input[type="checkbox"]' );

		await t.selectAll.check();
		for ( const box of await boxes.all() ) {
			await expect( box ).toBeChecked();
		}

		await t.selectAll.uncheck();
		for ( const box of await boxes.all() ) {
			await expect( box ).not.toBeChecked();
		}
	} );
} );
