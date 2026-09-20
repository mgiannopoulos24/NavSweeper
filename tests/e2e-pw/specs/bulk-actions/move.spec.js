import { test, expect } from '@playwright/test';
import { acceptDialogs, createMenu, deleteMenu, gotoMenu, menuItemTitles, table, uniqueName } from '../../helpers';

test.describe( 'Bulk move', () => {
	/** @type {import('../../helpers').SeededMenu} */
	let source;
	/** @type {import('../../helpers').SeededMenu} */
	let target;

	test.beforeEach( async ( { page }, testInfo ) => {
		source = await createMenu( page, uniqueName( testInfo, 'Source' ), [ 'Home', 'About', 'Contact' ] );
		target = await createMenu( page, uniqueName( testInfo, 'Target' ), [ 'Legal' ] );
	} );

	test.afterEach( async ( { page } ) => {
		await deleteMenu( page, source.id );
		await deleteMenu( page, target.id );
	} );

	test( 'moves the selected items to another menu', async ( { page } ) => {
		const dialogs = acceptDialogs( page );
		await gotoMenu( page, source.id );
		const t = table( page );

		await t.checkbox( 'About' ).check();
		await t.checkbox( 'Contact' ).check();
		await t.destination.selectOption( String( target.id ) );
		await t.moveButton.click();

		expect( dialogs[ 0 ] ).toContain( `Are you sure you want to move 2 item(s) to "${ target.name }"?` );
		await expect( t.successNotice ).toHaveText( /Successfully moved 2 menu items\./ );
		await expect( t.labels ).toHaveText( [ 'Home' ] );

		const moved = await menuItemTitles( page, target.id );
		expect( moved ).toHaveLength( 3 );
		expect( moved ).toEqual( expect.arrayContaining( [ 'Legal', 'About', 'Contact' ] ) );
	} );

	test( 'marks the current menu in the destination list', async ( { page } ) => {
		await gotoMenu( page, source.id );
		const current = table( page ).destination.locator( `option[value="${ source.id }"]` );
		await expect( current ).toHaveText( `${ source.name } (current)` );
	} );

	test( 'requires a selection and a destination', async ( { page } ) => {
		const dialogs = acceptDialogs( page );
		await gotoMenu( page, source.id );
		const t = table( page );

		await t.moveButton.click();
		expect( dialogs ).toEqual( [ 'Please select at least one menu item to move.' ] );

		await t.checkbox( 'Home' ).check();
		await t.destination.selectOption( '0' );
		await t.moveButton.click();
		expect( dialogs[ 1 ] ).toBe( 'Please select a destination menu.' );

		// Nothing was submitted.
		await expect( t.successNotice ).toHaveCount( 0 );
		await expect( t.labels ).toHaveText( [ 'Home', 'About', 'Contact' ] );
	} );
} );
