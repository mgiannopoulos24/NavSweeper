import { test, expect } from '@playwright/test';
import { acceptDialogs, createMenu, deleteMenu, gotoMenu, menuItemTitles, table, uniqueName } from '../../helpers';

test.describe( 'Bulk delete', () => {
	/** @type {import('../../helpers').SeededMenu} */
	let menu;

	test.beforeEach( async ( { page }, testInfo ) => {
		menu = await createMenu( page, uniqueName( testInfo ), [ 'Home', 'About', 'Blog', 'Contact' ] );
	} );

	test.afterEach( async ( { page } ) => {
		await deleteMenu( page, menu.id );
	} );

	test( 'deletes the selected items after confirmation', async ( { page } ) => {
		const dialogs = acceptDialogs( page );
		await gotoMenu( page, menu.id );
		const t = table( page );

		await t.checkbox( 'About' ).check();
		await t.checkbox( 'Blog' ).check();
		await t.deleteButton.click();

		expect( dialogs ).toEqual( [ 'Are you sure you want to delete these items?' ] );
		await expect( t.successNotice ).toHaveText( /Successfully deleted 2 menu items\./ );
		await expect( t.labels ).toHaveText( [ 'Home', 'Contact' ] );
		expect( await menuItemTitles( page, menu.id ) ).toEqual( [ 'Home', 'Contact' ] );
	} );

	test( 'dismissing the confirmation keeps the items', async ( { page } ) => {
		page.on( 'dialog', ( dialog ) => dialog.dismiss() );
		await gotoMenu( page, menu.id );
		const t = table( page );

		await t.checkbox( 'About' ).check();
		await t.deleteButton.click();

		await expect( t.successNotice ).toHaveCount( 0 );
		await expect( t.labels ).toHaveText( [ 'Home', 'About', 'Blog', 'Contact' ] );
		await expect( t.checkbox( 'About' ) ).toBeChecked();
	} );

	test( 'shows an error when nothing is selected', async ( { page } ) => {
		acceptDialogs( page );
		await gotoMenu( page, menu.id );
		const t = table( page );

		await t.deleteButton.click();

		await expect( t.errorNotice ).toHaveText( /No items selected\./ );
		await expect( t.labels ).toHaveText( [ 'Home', 'About', 'Blog', 'Contact' ] );
	} );
} );
