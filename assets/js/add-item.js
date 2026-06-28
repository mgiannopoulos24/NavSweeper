/**
 * NavSweeper Add Item Functionality
 * Handles the "+" button hover and click events for adding menu items
 */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        var addItemButtons = document.querySelectorAll('.nsw-add-item-btn');
        var addItemModal = document.getElementById('nsw-add-item-modal');
        var addItemForm = document.getElementById('nsw-add-item-form');
        var modalClose = document.querySelector('.nsw-add-modal-close');
        var modalCancel = document.querySelector('.nsw-add-modal-cancel');
        var referenceItemIdInput = document.getElementById('nsw-reference-item-id');
        var insertPositionInput = document.getElementById('nsw-insert-position');
        var positionText = document.getElementById('nsw-position-text');

        // Create dropdown menu for each add button
        addItemButtons.forEach(function(button) {
            var itemId = button.getAttribute('data-item-id');
            var itemIndex = button.getAttribute('data-item-index');
            var row = button.closest('tr');

            // Create dropdown
            var dropdown = document.createElement('div');
            dropdown.className = 'nsw-add-dropdown';
            dropdown.innerHTML =
                '<a href="#" class="nsw-add-dropdown-item" data-position="above" data-item-id="' + itemId + '" data-item-index="' + itemIndex + '">' +
                    '<i class="fa fa-chevron-up"></i> ' + nswAddItemI18n.addAbove +
                '</a>' +
                '<a href="#" class="nsw-add-dropdown-item" data-position="below" data-item-id="' + itemId + '" data-item-index="' + itemIndex + '">' +
                    '<i class="fa fa-chevron-down"></i> ' + nswAddItemI18n.addBelow +
                '</a>';

            // Position dropdown relative to button
            var buttonContainer = button.parentElement;
            buttonContainer.style.position = 'relative';
            buttonContainer.appendChild(dropdown);

            // Handle button click to show dropdown
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                // Close other dropdowns
                document.querySelectorAll('.nsw-add-dropdown.show').forEach(function(d) {
                    if (d !== dropdown) {
                        d.classList.remove('show');
                    }
                });

                // Toggle this dropdown
                dropdown.classList.toggle('show');
            });

            // Handle dropdown item clicks
            dropdown.querySelectorAll('.nsw-add-dropdown-item').forEach(function(item) {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    var position = this.getAttribute('data-position');
                    var refItemId = this.getAttribute('data-item-id');
                    var itemTitle = row.querySelector('.column-primary strong').textContent.trim();

                    // Set form values
                    referenceItemIdInput.value = refItemId;
                    insertPositionInput.value = position;

                    // Update position text
                    var format = position === 'above' ? nswAddItemI18n.aboveFormat : nswAddItemI18n.belowFormat;
                    positionText.textContent = format.replace('%s', itemTitle);

                    // Close dropdown
                    dropdown.classList.remove('show');

                    // Show modal
                    if (addItemModal) {
                        addItemModal.style.display = 'block';
                        document.body.style.overflow = 'hidden';

                        // Focus on first input
                        var firstInput = addItemForm.querySelector('input[type="text"]');
                        if (firstInput) {
                            setTimeout(function() {
                                firstInput.focus();
                            }, 100);
                        }
                    }
                });
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nsw-add-item-btn') &&
                !e.target.closest('.nsw-add-dropdown')) {
                document.querySelectorAll('.nsw-add-dropdown.show').forEach(function(dropdown) {
                    dropdown.classList.remove('show');
                });
            }
        });

        // Close modal function
        function closeAddModal() {
            if (addItemModal) {
                addItemModal.style.display = 'none';
                document.body.style.overflow = '';
                if (addItemForm) {
                    addItemForm.reset();
                    referenceItemIdInput.value = '';
                    insertPositionInput.value = '';
                    positionText.textContent = '';
                }
            }
        }

        // Close modal handlers
        if (modalClose) {
            modalClose.addEventListener('click', closeAddModal);
        }

        if (modalCancel) {
            modalCancel.addEventListener('click', closeAddModal);
        }

        // Close modal when clicking outside
        if (addItemModal) {
            addItemModal.addEventListener('click', function(e) {
                if (e.target === addItemModal) {
                    closeAddModal();
                }
            });
        }

        // Validate form submission
        if (addItemForm) {
            addItemForm.addEventListener('submit', function(e) {
                var label = document.getElementById('new_item_label');
                var url = document.getElementById('new_item_url');

                if (!label || !label.value.trim()) {
                    alert(nswAddItemI18n.enterLabel);
                    e.preventDefault();
                    return false;
                }

                if (!url || !url.value.trim()) {
                    alert(nswAddItemI18n.enterURL);
                    e.preventDefault();
                    return false;
                }

                return true;
            });
        }
    });
})();
