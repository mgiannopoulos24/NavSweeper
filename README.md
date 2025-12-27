# NavSweeper

A WordPress plugin that expands your menu capabilities. Bulk select, delete, move, and edit navigation menu items easily.

## Description

NavSweeper provides powerful bulk operations for WordPress navigation menus, making it easy to manage large menus efficiently. Instead of editing menu items one by one, you can select multiple items and perform bulk actions.

## Features

- **Bulk Delete**: Select and delete multiple menu items at once
- **Bulk Move**: Move multiple menu items to different menus or reset their hierarchy
- **Bulk Edit**: Update label, URL, CSS classes, link target, and description for multiple items simultaneously
- **Add Menu Items**: Quickly add new custom menu items with full control over positioning
- **Easy Selection**: Intuitive checkbox interface for selecting menu items
- **Menu Support**: Ensures menu support is enabled even for block themes

## Installation

### WordPress Installation

1. Download the plugin zip file or clone this repository
2. Upload the `navsweeper` folder to the `/wp-content/plugins/` directory
3. Activate the plugin through the 'Plugins' menu in WordPress
4. Navigate to **Appearance → NavSweeper** to start managing your menus

### Development Setup

This project uses [Bun](https://bun.sh) as the package manager and [@wordpress/env](https://github.com/WordPress/gutenberg/tree/trunk/packages/env) for local WordPress development.

#### Prerequisites

- [Bun](https://bun.sh) installed on your system
- Docker and Docker Compose (required for wp-env)

#### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/mgiannopoulos24/navsweeper.git
   cd navsweeper
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start the local WordPress environment**
   ```bash
   bun run start
   ```
   This will start a WordPress instance at `http://localhost:8888`

4. **Setup test menus (optional)**
   ```bash
   bun run setup
   ```
   This creates sample menus for testing purposes.

5. **Start with setup (one command)**
   ```bash
   bun run start:setup
   ```
   This combines starting the environment and setting up test menus.

## Available Scripts

### Development Scripts

- `bun run start` - Start the local WordPress environment using wp-env
- `bun run setup` - Run the setup script to create test menus
- `bun run start:setup` - Start the environment and setup test menus in one command
- `bun run stop` - Stop the WordPress environment
- `bun run destroy` - Destroy the WordPress environment (removes all data)
- `bun run shell` - Open a bash shell in the WordPress CLI container

### Build Scripts

- `bun run bundle` - Create a distribution zip file (`navsweeper.zip`) containing the plugin files
- `bun run lint` - Run PHP linting on all PHP files in the project

## Usage

1. Navigate to **Appearance → NavSweeper** in your WordPress admin
2. Select a menu from the dropdown
3. Use the checkboxes to select menu items you want to modify
4. Choose an action:
   - **Delete**: Remove selected items from the menu
   - **Move**: Move selected items to another menu or reset their hierarchy
   - **Edit**: Bulk edit properties like label, URL, CSS classes, etc.
   - **Add Item**: Add a new custom menu item with positioning options

## Project Structure

```
navsweeper/
├── assets/           # CSS and JavaScript files
│   ├── css/         # Stylesheets
│   └── js/          # JavaScript files
├── includes/        # PHP class files
│   └── class-navsweeper.php
├── views/           # Admin view templates
│   └── admin-view.php
├── scripts/         # Setup and utility scripts
│   └── setup-menus.php
├── navsweeper.php   # Main plugin file
├── package.json     # Dependencies and scripts
└── .wp-env.json     # WordPress environment configuration
```

## Requirements

- WordPress 5.0 or higher
- PHP 8.3 or higher (for development)
- Bun (for development)

## Development

The plugin uses WordPress's standard plugin structure and follows WordPress coding standards. The local development environment is configured to use:

- WordPress latest version
- PHP 8.3
- Twenty Twenty-Five theme
- Debug mode enabled

## License

This plugin is licensed under the GPL v3 license.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
