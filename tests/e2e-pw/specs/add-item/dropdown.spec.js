import { test, expect } from '@playwright/test';
import { createMenu, deleteMenu, gotoMenu, table, uniqueName } from '../../helpers';

test.describe( 'Add item dropdown', () => {
	/** @type {import('../../helpers').SeededMenu} */
	let menu;

	test.beforeEach( async ( { page }, testInfo ) => {
		menu = await createMenu( page, uniqueName( testInfo ), [ 'Home', 'About', 'Contact' ] );
		await gotoMenu( page, menu.id );
	} );

	test.afterEach( async ( { page } ) => {
		await deleteMenu( page, menu.id );
	} );

	const dropdown = ( page ) => page.locator( '.nsw-add-dropdown' );

	test( 'plus button is labelled and announces the popup', async ( { page } ) => {
		const button = table( page ).addButton( 'About' );

		await expect( button ).toHaveAccessibleName( 'Add menu item' );
		await expect( button ).toHaveAttribute( 'aria-haspopup', 'menu' );
		await expect( button ).toHaveAttribute( 'aria-expanded', 'false' );
		await expect( button.locator( '.dashicons-plus-alt2' ) ).toBeVisible();
		await expect( dropdown( page ) ).toBeHidden();
	} );

	test( 'opens a menu with Add Above / Add Below and focuses the first item', async ( { page } ) => {
		const button = table( page ).addButton( 'About' );

		await button.click();
		await expect( button ).toHaveAttribute( 'aria-expanded', 'true' );
		await expect( dropdown( page ) ).toBeVisible();
		await expect( dropdown( page ) ).toHaveAttribute( 'role', 'menu' );
		await expect( dropdown( page ).getByRole( 'menuitem' ) ).toHaveText( [ 'Add Above', 'Add Below' ] );
		await expect( dropdown( page ).getByRole( 'menuitem', { name: 'Add Above' } ) ).toBeFocused();
	} );

	test( 'arrow keys move between items and Escape returns focus to the button', async ( { page } ) => {
		const button = table( page ).addButton( 'About' );
		await button.click();

		await page.keyboard.press( 'ArrowDown' );
		await expect( dropdown( page ).getByRole( 'menuitem', { name: 'Add Below' } ) ).toBeFocused();
		await page.keyboard.press( 'ArrowDown' );
		await expect( dropdown( page ).getByRole( 'menuitem', { name: 'Add Above' } ) ).toBeFocused();
		await page.keyboard.press( 'ArrowUp' );
		await expect( dropdown( page ).getByRole( 'menuitem', { name: 'Add Below' } ) ).toBeFocused();

		await page.keyboard.press( 'Escape' );
		await expect( dropdown( page ) ).toBeHidden();
		await expect( button ).toHaveAttribute( 'aria-expanded', 'false' );
		await expect( button ).toBeFocused();
	} );

	test( 'ArrowDown on the button opens it', async ( { page } ) => {
		const button = table( page ).addButton( 'Home' );
		await button.focus();
		await page.keyboard.press( 'ArrowDown' );
		await expect( dropdown( page ) ).toBeVisible();
		await expect( dropdown( page ).getByRole( 'menuitem', { name: 'Add Above' } ) ).toBeFocused();
	} );

	test( 'only one dropdown is open at a time', async ( { page } ) => {
		const t = table( page );
		await t.addButton( 'Home' ).click();
		await t.addButton( 'Contact' ).click();

		await expect( dropdown( page ) ).toHaveCount( 1 );
		await expect( t.addButton( 'Home' ) ).toHaveAttribute( 'aria-expanded', 'false' );
		await expect( t.addButton( 'Contact' ) ).toHaveAttribute( 'aria-expanded', 'true' );
		await expect( t.row( 'Contact' ).locator( '.nsw-add-dropdown' ) ).toBeVisible();
	} );

	test( 'clicking outside closes the menu', async ( { page } ) => {
		const button = table( page ).addButton( 'Home' );

		await button.click();
		await expect( dropdown( page ) ).toBeVisible();
		await page.getByRole( 'heading', { level: 1, name: 'NavSweeper' } ).click();
		await expect( dropdown( page ) ).toBeHidden();
		await expect( button ).toHaveAttribute( 'aria-expanded', 'false' );
	} );
} );
