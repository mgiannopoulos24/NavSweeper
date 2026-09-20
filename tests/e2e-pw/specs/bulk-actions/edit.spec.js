import { test, expect } from '@playwright/test';
import { acceptDialogs, createMenu, deleteMenu, gotoMenu, menuItemTitles, modal, table, uniqueName } from '../../helpers';

test.describe( 'Bulk edit', () => {
	/** @type {import('../../helpers').SeededMenu} */
	let menu;

	test.beforeEach( async ( { page }, testInfo ) => {
		menu = await createMenu( page, uniqueName( testInfo ), [ 'Home', 'About', 'Contact' ] );
	} );

	test.afterEach( async ( { page } ) => {
		await deleteMenu( page, menu.id );
	} );

	test( 'requires a selection before opening the modal', async ( { page } ) => {
		const dialogs = acceptDialogs( page );
		await gotoMenu( page, menu.id );
		const t = table( page );
		const m = modal( page, 'nsw-bulk-edit-modal' );

		await t.bulkEditButton.click();
		expect( dialogs ).toEqual( [ 'Please select at least one menu item to edit.' ] );
		await expect( m.root ).toBeHidden();
	} );

	test( 'updates only the checked fields on the selected items', async ( { page } ) => {
		const dialogs = acceptDialogs( page );
		await gotoMenu( page, menu.id );
		const t = table( page );
		const m = modal( page, 'nsw-bulk-edit-modal' );

		await t.checkbox( 'About' ).check();
		await t.checkbox( 'Contact' ).check();
		await t.bulkEditButton.click();
		await expect( m.root ).toBeVisible();

		await m.root.locator( 'input.nsw-field-checkbox[value="label"]' ).check();
		await m.root.locator( '#bulk_edit_label' ).fill( 'Renamed' );
		await m.root.locator( 'input.nsw-field-checkbox[value="css_classes"]' ).check();
		await m.root.locator( '#bulk_edit_css_classes' ).fill( 'nsw-test highlight' );
		await m.submit.click();

		expect( dialogs ).toEqual( [ 'Are you sure you want to update 2 item(s)?' ] );
		await expect( t.successNotice ).toHaveText( /Successfully edited 2 menu items\./ );
		await expect( t.labels ).toHaveText( [ 'Home', 'Renamed', 'Renamed' ] );
		// URL was not checked, so it is untouched.
		await expect( t.rows.nth( 1 ).locator( 'td' ).nth( 1 ) ).toHaveText( 'https://example.com/about/' );
		expect( await menuItemTitles( page, menu.id ) ).toEqual( [ 'Home', 'Renamed', 'Renamed' ] );
	} );

	test( 'refuses to submit with no field checked', async ( { page } ) => {
		const dialogs = acceptDialogs( page );
		await gotoMenu( page, menu.id );
		const t = table( page );
		const m = modal( page, 'nsw-bulk-edit-modal' );

		await t.checkbox( 'Home' ).check();
		await t.bulkEditButton.click();
		await m.submit.click();

		expect( dialogs ).toEqual( [ 'Please select at least one field to update.' ] );
		await expect( m.root ).toBeVisible();
		await expect( t.successNotice ).toHaveCount( 0 );
	} );

	test( 'every field is named by its heading', async ( { page } ) => {
		await gotoMenu( page, menu.id );
		const t = table( page );
		const m = modal( page, 'nsw-bulk-edit-modal' );

		await t.checkbox( 'Home' ).check();
		await t.bulkEditButton.click();

		await expect( m.root.locator( '#bulk_edit_label' ) ).toHaveAccessibleName( 'Label (Link Text)' );
		await expect( m.root.locator( '#bulk_edit_url' ) ).toHaveAccessibleName( 'URL' );
		await expect( m.root.locator( '#bulk_edit_css_classes' ) ).toHaveAccessibleName( 'CSS Classes' );
		await expect( m.root.locator( '#bulk_edit_link_target' ) ).toHaveAccessibleName( 'Link Target' );
		await expect( m.root.locator( '#bulk_edit_description' ) ).toHaveAccessibleName( 'Description' );
	} );
} );
