import { test, expect } from '@playwright/test';
import { createMenu, deleteMenu, gotoMenu, menuItems, menuItemTitles, modal, table, uniqueName } from '../../helpers';

test.describe( 'Add item modal', () => {
	/** @type {import('../../helpers').SeededMenu} */
	let menu;

	test.beforeEach( async ( { page }, testInfo ) => {
		menu = await createMenu( page, uniqueName( testInfo ), [ 'Home', 'About', 'Contact' ] );
		await gotoMenu( page, menu.id );
	} );

	test.afterEach( async ( { page } ) => {
		await deleteMenu( page, menu.id );
	} );

	/** Open the add-item modal for `title` in the given direction. */
	async function openFor( page, title, position ) {
		await table( page ).addButton( title ).click();
		await page.locator( '.nsw-add-dropdown' ).getByRole( 'menuitem', { name: `Add ${ position }` } ).click();
		const m = modal( page, 'nsw-add-item-modal' );
		await expect( m.root ).toBeVisible();
		return m;
	}

	async function submitItem( page, m, label, url ) {
		await page.locator( '#new_item_label' ).fill( label );
		await page.locator( '#new_item_url' ).fill( url );
		await m.submit.click();
		await expect( table( page ).successNotice ).toHaveText( /Successfully added 1 menu item\./ );
	}

	test( 'is a labelled dialog that shows the target position and focuses the label', async ( { page } ) => {
		const m = await openFor( page, 'About', 'Above' );

		await expect( m.root ).toHaveAttribute( 'role', 'dialog' );
		await expect( m.root ).toHaveAttribute( 'aria-modal', 'true' );
		await expect( m.root ).toHaveAccessibleName( 'Add New Menu Item' );
		await expect( page.locator( '#nsw-position-text' ) ).toHaveText( 'above "About"' );
		await expect( page.locator( '#new_item_label' ) ).toBeFocused();
		await expect( page.locator( '#new_item_label' ) ).toHaveAccessibleName( /Label \(Link Text\)/ );
		await expect( page.locator( '#new_item_link_target' ) ).toHaveAccessibleName( 'Link Target' );
	} );

	for ( const [ reference, position, expected ] of [
		[ 'Home', 'Above', [ 'Team', 'Home', 'About', 'Contact' ] ],
		[ 'About', 'Above', [ 'Home', 'Team', 'About', 'Contact' ] ],
		[ 'About', 'Below', [ 'Home', 'About', 'Team', 'Contact' ] ],
		[ 'Contact', 'Below', [ 'Home', 'About', 'Contact', 'Team' ] ],
	] ) {
		test( `adds an item ${ position.toLowerCase() } "${ reference }"`, async ( { page } ) => {
			const m = await openFor( page, reference, position );
			await expect( page.locator( '#nsw-position-text' ) ).toHaveText( `${ position.toLowerCase() } "${ reference }"` );

			await submitItem( page, m, 'Team', 'https://example.com/team/' );

			const t = table( page );
			await expect( t.labels ).toHaveText( expected );
			await expect( t.row( 'Team' ).locator( 'td' ).nth( 1 ) ).toHaveText( 'https://example.com/team/' );
			expect( await menuItemTitles( page, menu.id ) ).toEqual( expected );
		} );
	}

	test( 'saves the optional fields', async ( { page } ) => {
		const m = await openFor( page, 'Contact', 'Below' );
		await page.locator( '#new_item_css_classes' ).fill( 'cta  primary' );
		await page.locator( '#new_item_link_target' ).selectOption( '_blank' );
		await page.locator( '#new_item_description' ).fill( 'Reach out' );
		await submitItem( page, m, 'Call us', 'https://example.com/call/' );

		const item = ( await menuItems( page, menu.id ) ).find( ( i ) => i.title.rendered === 'Call us' );
		expect( item.classes ).toEqual( [ 'cta', 'primary' ] );
		expect( item.target ).toBe( '_blank' );
		expect( item.description ).toBe( 'Reach out' );
	} );

	test( 'cancelling clears the form and restores focus', async ( { page } ) => {
		const t = table( page );
		const m = await openFor( page, 'Home', 'Below' );
		await page.locator( '#new_item_label' ).fill( 'Discarded' );

		await page.keyboard.press( 'Escape' );
		await expect( m.root ).toBeHidden();
		await expect( t.addButton( 'Home' ) ).toBeFocused();
		await expect( page.locator( '#nsw-position-text' ) ).toHaveText( '' );

		await openFor( page, 'Home', 'Below' );
		await expect( page.locator( '#new_item_label' ) ).toHaveValue( '' );
		await expect( t.labels ).toHaveText( [ 'Home', 'About', 'Contact' ] );
	} );

	test( 'browser validation blocks an empty label or URL', async ( { page } ) => {
		const t = table( page );
		const m = await openFor( page, 'Home', 'Below' );
		await m.submit.click();

		await expect( m.root ).toBeVisible();
		expect( await page.locator( '#new_item_label' ).evaluate( ( el ) => el.validity.valueMissing ) ).toBe( true );
		await expect( t.labels ).toHaveText( [ 'Home', 'About', 'Contact' ] );
	} );
} );
