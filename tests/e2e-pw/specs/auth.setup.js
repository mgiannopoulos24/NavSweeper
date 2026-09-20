import { test as setup, expect } from '@playwright/test';
import { ADMIN, STORAGE_STATE } from '../helpers';

/** Log in once as the wp-env admin and share the cookies with every spec. */
setup( 'authenticate as admin', async ( { page } ) => {
	await page.goto( '/wp-login.php' );
	await page.locator( '#user_login' ).fill( ADMIN.username );
	await page.locator( '#user_pass' ).fill( ADMIN.password );
	await page.locator( '#wp-submit' ).click();
	await expect( page ).toHaveURL( /\/wp-admin\/?/ );
	await page.context().storageState( { path: STORAGE_STATE } );
} );
