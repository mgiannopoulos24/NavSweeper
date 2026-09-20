#!/usr/bin/env bash
#
# Seed test menus for NavSweeper development.
#
# Usage:
#   bash scripts/seed.sh [--reset]
#
#   --reset  Delete existing seed menus before recreating them.
#
set -euo pipefail

WP="bunx wp-env run cli wp"
RESET=0

if [[ "${1:-}" == "--reset" ]]; then
	RESET=1
fi

SITE_URL="$($WP option get siteurl)"
SITE_URL="${SITE_URL%/}"
echo "Site URL: ${SITE_URL}"
echo ""

ensure_menu() {
	local name="$1"
	local menu_id=""

	if menu_id="$($WP menu get "$name" --field=term_id 2>/dev/null)"; then
		if [[ "$RESET" -eq 1 ]]; then
			echo "Deleting existing menu: ${name}"
			$WP menu delete "$name" --quiet
			menu_id="$($WP menu create "$name" --porcelain)"
			echo "Created menu: ${name} (ID: ${menu_id})"
		else
			echo "Menu already exists: ${name} (ID: ${menu_id})"
		fi
	else
		menu_id="$($WP menu create "$name" --porcelain)"
		echo "Created menu: ${name} (ID: ${menu_id})"
	fi
}

add_item() {
	local menu="$1"
	local title="$2"
	local path="$3"
	local url="${SITE_URL}${path}"

	if $WP menu item list "$menu" --fields=title --format=csv 2>/dev/null | tail -n +2 | grep -Fxq "$title"; then
		return 0
	fi

	$WP menu item add-custom "$menu" "$title" "$url" --quiet
	echo "  Added menu item: ${title}"
}

seed_menu() {
	local menu="$1"
	shift
	ensure_menu "$menu"
	local entry title path
	for entry in "$@"; do
		title="${entry%%|*}"
		path="${entry#*|}"
		add_item "$menu" "$title" "$path"
	done
}

seed_menu "Primary Menu" \
	"Home|/" \
	"About|/about/" \
	"Services|/services/" \
	"Blog|/blog/" \
	"Contact|/contact/" \
	"Products|/products/" \
	"FAQ|/faq/" \
	"Portfolio|/portfolio/"

seed_menu "Secondary Menu" \
	"Privacy Policy|/privacy-policy/" \
	"Terms of Service|/terms/" \
	"Sitemap|/sitemap/"

seed_menu "Footer Menu" \
	"Copyright|/" \
	"Legal|/legal/"

echo ""
echo "Setup complete! You now have menus with items to test NavSweeper."
echo "Go to: Appearance > NavSweeper to test the plugin."
