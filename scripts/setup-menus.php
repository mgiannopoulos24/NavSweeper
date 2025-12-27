<?php
/**
 * Setup script to create test menus and menu items for NavSweeper development
 * Run with: wp-env run cli wp eval-file scripts/setup-menus.php
 */

// Create Primary Menu
$primary_menu_name = 'Primary Menu';
$primary_menu = wp_get_nav_menu_object( $primary_menu_name );

if ( ! $primary_menu ) {
	$primary_menu_id = wp_create_nav_menu( $primary_menu_name );
	echo "Created menu: {$primary_menu_name} (ID: {$primary_menu_id})\n";
} else {
	$primary_menu_id = $primary_menu->term_id;
	echo "Menu already exists: {$primary_menu_name} (ID: {$primary_menu_id})\n";
}

// Create menu items for Primary Menu
$primary_items = array(
	array(
		'title' => 'Home',
		'url' => home_url( '/' ),
	),
	array(
		'title' => 'About',
		'url' => home_url( '/about/' ),
	),
	array(
		'title' => 'Services',
		'url' => home_url( '/services/' ),
	),
	array(
		'title' => 'Blog',
		'url' => home_url( '/blog/' ),
	),
	array(
		'title' => 'Contact',
		'url' => home_url( '/contact/' ),
	),
	array(
		'title' => 'Products',
		'url' => home_url( '/products/' ),
	),
	array(
		'title' => 'FAQ',
		'url' => home_url( '/faq/' ),
	),
	array(
		'title' => 'Portfolio',
		'url' => home_url( '/portfolio/' ),
	),
);

foreach ( $primary_items as $item_data ) {
	$existing_items = wp_get_nav_menu_items( $primary_menu_id );
	$item_exists = false;
	
	foreach ( $existing_items as $existing_item ) {
		if ( $existing_item->title === $item_data['title'] ) {
			$item_exists = true;
			break;
		}
	}
	
	if ( ! $item_exists ) {
		$menu_item_id = wp_update_nav_menu_item( $primary_menu_id, 0, array(
			'menu-item-title'  => $item_data['title'],
			'menu-item-url'    => $item_data['url'],
			'menu-item-status' => 'publish',
			'menu-item-type'   => 'custom',
		) );
		
		if ( ! is_wp_error( $menu_item_id ) ) {
			echo "  Added menu item: {$item_data['title']}\n";
		}
	}
}

// Create Secondary Menu
$secondary_menu_name = 'Secondary Menu';
$secondary_menu = wp_get_nav_menu_object( $secondary_menu_name );

if ( ! $secondary_menu ) {
	$secondary_menu_id = wp_create_nav_menu( $secondary_menu_name );
	echo "Created menu: {$secondary_menu_name} (ID: {$secondary_menu_id})\n";
} else {
	$secondary_menu_id = $secondary_menu->term_id;
	echo "Menu already exists: {$secondary_menu_name} (ID: {$secondary_menu_id})\n";
}

// Create menu items for Secondary Menu
$secondary_items = array(
	array(
		'title' => 'Privacy Policy',
		'url' => home_url( '/privacy-policy/' ),
	),
	array(
		'title' => 'Terms of Service',
		'url' => home_url( '/terms/' ),
	),
	array(
		'title' => 'Sitemap',
		'url' => home_url( '/sitemap/' ),
	),
);

foreach ( $secondary_items as $item_data ) {
	$existing_items = wp_get_nav_menu_items( $secondary_menu_id );
	$item_exists = false;
	
	foreach ( $existing_items as $existing_item ) {
		if ( $existing_item->title === $item_data['title'] ) {
			$item_exists = true;
			break;
		}
	}
	
	if ( ! $item_exists ) {
		$menu_item_id = wp_update_nav_menu_item( $secondary_menu_id, 0, array(
			'menu-item-title'  => $item_data['title'],
			'menu-item-url'    => $item_data['url'],
			'menu-item-status' => 'publish',
			'menu-item-type'   => 'custom',
		) );
		
		if ( ! is_wp_error( $menu_item_id ) ) {
			echo "  Added menu item: {$item_data['title']}\n";
		}
	}
}

// Create Footer Menu
$footer_menu_name = 'Footer Menu';
$footer_menu = wp_get_nav_menu_object( $footer_menu_name );

if ( ! $footer_menu ) {
	$footer_menu_id = wp_create_nav_menu( $footer_menu_name );
	echo "Created menu: {$footer_menu_name} (ID: {$footer_menu_id})\n";
} else {
	$footer_menu_id = $footer_menu->term_id;
	echo "Menu already exists: {$footer_menu_name} (ID: {$footer_menu_id})\n";
}

// Create menu items for Footer Menu
$footer_items = array(
	array(
		'title' => 'Copyright',
		'url' => home_url( '/' ),
	),
	array(
		'title' => 'Legal',
		'url' => home_url( '/legal/' ),
	),
);

foreach ( $footer_items as $item_data ) {
	$existing_items = wp_get_nav_menu_items( $footer_menu_id );
	$item_exists = false;
	
	foreach ( $existing_items as $existing_item ) {
		if ( $existing_item->title === $item_data['title'] ) {
			$item_exists = true;
			break;
		}
	}
	
	if ( ! $item_exists ) {
		$menu_item_id = wp_update_nav_menu_item( $footer_menu_id, 0, array(
			'menu-item-title'  => $item_data['title'],
			'menu-item-url'    => $item_data['url'],
			'menu-item-status' => 'publish',
			'menu-item-type'   => 'custom',
		) );
		
		if ( ! is_wp_error( $menu_item_id ) ) {
			echo "  Added menu item: {$item_data['title']}\n";
		}
	}
}

echo "\nSetup complete! You now have menus with items to test NavSweeper.\n";
echo "Go to: Appearance > NavSweeper to test the plugin.\n";

