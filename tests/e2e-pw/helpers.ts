import path from 'node:path';
import { expect } from '@playwright/test';
import type { Page, TestInfo } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import type { Result as AxeViolation } from 'axe-core';

/** wp-env default credentials. */
export const ADMIN = { username: 'admin', password: 'password' };

/** Absolute path so the setup project and the config agree regardless of cwd. */
export const STORAGE_STATE = path.resolve( __dirname, '.auth/admin.json' );

export const PAGE_PATH = '/wp-admin/themes.php?page=nsw-bulk-delete';

/** WCAG 2.2 AA plus axe best practices. */
export const axeTags = [ 'wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice' ];

/** Menu name unique to a test so parallel workers never collide. */
export function uniqueName( testInfo: TestInfo, prefix = 'NSW' ) {
	return `${ prefix } ${ testInfo.workerIndex }-${ Date.now().toString( 36 ) }`;
}

async function restHeaders( page: Page ) {
	const response = await page.request.get( '/wp-admin/admin-ajax.php?action=rest-nonce' );
	return { 'X-WP-Nonce': ( await response.text() ).trim() };
}

export interface SeededMenu {
	id: number;
	name: string;
	/** Item IDs in menu order. */
	itemIds: number[];
}

/** Create a menu with custom-link items (in the given order) via the REST API. */
export async function createMenu( page: Page, name: string, titles: string[] = [] ): Promise<SeededMenu> {
	const headers = await restHeaders( page );
	const menuResponse = await page.request.post( '/wp-json/wp/v2/menus', { headers, data: { name } } );
	expect( menuResponse.ok(), await menuResponse.text() ).toBe( true );
	const menu = await menuResponse.json();

	const itemIds: number[] = [];
	for ( const [ index, title ] of titles.entries() ) {
		const slug = title.toLowerCase().replace( /[^a-z0-9]+/g, '-' );
		const itemResponse = await page.request.post( '/wp-json/wp/v2/menu-items', {
			headers,
			data: {
				title,
				url: `https://example.com/${ slug }/`,
				menus: menu.id,
				menu_order: index + 1,
				type: 'custom',
				object: 'custom',
				status: 'publish',
			},
		} );
		expect( itemResponse.ok(), await itemResponse.text() ).toBe( true );
		itemIds.push( ( await itemResponse.json() ).id );
	}

	return { id: menu.id, name, itemIds };
}

/** Delete a menu (and its items). */
export async function deleteMenu( page: Page, id: number ) {
	const headers = await restHeaders( page );
	await page.request.delete( `/wp-json/wp/v2/menus/${ id }?force=true`, { headers } );
}

export interface MenuItem {
	id: number;
	title: { rendered: string };
	url: string;
	menu_order: number;
	classes: string[];
	target: string;
	description: string;
}

/** A menu's items in menu order, straight from the REST API (needs the nonce). */
export async function menuItems( page: Page, menuId: number ): Promise<MenuItem[]> {
	const headers = await restHeaders( page );
	const response = await page.request.get( '/wp-json/wp/v2/menu-items', {
		headers,
		params: { menus: menuId, per_page: 100, orderby: 'menu_order', order: 'asc' },
	} );
	expect( response.ok(), await response.text() ).toBe( true );
	const items: MenuItem[] = await response.json();
	return items.sort( ( a, b ) => a.menu_order - b.menu_order );
}

/** Titles of a menu's items in menu order. */
export async function menuItemTitles( page: Page, menuId: number ): Promise<string[]> {
	return ( await menuItems( page, menuId ) ).map( ( item ) => item.title.rendered );
}

/** Open the NavSweeper admin page for a menu. */
export async function gotoMenu( page: Page, menuId?: number ) {
	const path = menuId ? `${ PAGE_PATH }&menu_id=${ menuId }` : PAGE_PATH;
	await page.goto( path, { waitUntil: 'networkidle' } );
	await expect( page.getByRole( 'heading', { level: 1, name: 'NavSweeper' } ) ).toBeVisible();
}

/** Locators for the items table and action bar. */
export function table( page: Page ) {
	const rows = page.locator( 'tr.nsw-menu-item-row' );
	return {
		rows,
		row: ( title: string ) => rows.filter( { has: page.locator( 'td.column-primary strong', { hasText: title } ) } ),
		labels: page.locator( 'tr.nsw-menu-item-row td.column-primary strong' ),
		checkbox: ( title: string ) =>
			rows.filter( { has: page.locator( 'td.column-primary strong', { hasText: title } ) } ).locator( 'input[type="checkbox"]' ),
		addButton: ( title: string ) =>
			rows.filter( { has: page.locator( 'td.column-primary strong', { hasText: title } ) } ).locator( '.nsw-add-item-btn' ),
		selectAll: page.locator( '#cb-select-all-1' ),
		deleteButton: page.locator( '#nsw_btn_delete' ),
		moveButton: page.locator( '#nsw_btn_move' ),
		destination: page.locator( '#destination_menu_id' ),
		bulkEditButton: page.locator( '#nsw_btn_bulk_edit' ),
		successNotice: page.locator( '.notice-success' ),
		errorNotice: page.locator( '.notice-error' ),
	};
}

/** Locators for a modal by id. */
export function modal( page: Page, id: string ) {
	const root = page.locator( `#${ id }` );
	return {
		root,
		close: root.locator( '.nsw-modal-close' ),
		cancel: root.locator( '.nsw-modal-cancel' ),
		submit: root.locator( 'input[type="submit"]' ),
	};
}

/** Accept every native confirm()/alert() for the rest of the test. */
export function acceptDialogs( page: Page, seen: string[] = [] ) {
	page.on( 'dialog', ( dialog ) => {
		seen.push( dialog.message() );
		dialog.accept();
	} );
	return seen;
}

function describeViolations( violations: AxeViolation[] ) {
	return violations
		.map( ( v ) => {
			const nodes = v.nodes
				.slice( 0, 5 )
				.map( ( n ) => `      - ${ n.target.join( ' ' ) }\n        ${ n.failureSummary?.split( '\n' ).join( '\n        ' ) }` )
				.join( '\n' );
			return `  [${ v.impact }] ${ v.id }: ${ v.help } (${ v.helpUrl })\n${ nodes }`;
		} )
		.join( '\n\n' );
}

/**
 * Run axe on the plugin's own markup (not wp-admin chrome) and fail with a
 * readable report.
 */
export async function expectAccessible( page: Page, label: string, options: { include?: string; disableRules?: string[] } = {} ) {
	let builder = new AxeBuilder( { page } ).withTags( axeTags ).include( options.include ?? '#wpbody-content .wrap' );
	if ( options.disableRules?.length ) {
		builder = builder.disableRules( options.disableRules );
	}
	const results = await builder.analyze();
	expect( results.violations, `axe violations on ${ label }:\n${ describeViolations( results.violations ) }` ).toEqual( [] );
}

