/**
 * NavSweeper Add Item Functionality
 * Handles the "+" button hover and click events for adding menu items
 */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        const addItemButtons = document.querySelectorAll('.navsweeper-add-item-btn');
        const addItemModal = document.getElementById('navsweeper-add-item-modal');
        const addItemForm = document.getElementById('navsweeper-add-item-form');
        const modalClose = document.querySelector('.navsweeper-add-modal-close');
        const modalCancel = document.querySelector('.navsweeper-add-modal-cancel');
        const referenceItemIdInput = document.getElementById('navsweeper-reference-item-id');
        const insertPositionInput = document.getElementById('navsweeper-insert-position');
        const positionText = document.getElementById('navsweeper-position-text');

        // Create dropdown menu for each add button
        addItemButtons.forEach(function(button) {
            const itemId = button.getAttribute('data-item-id');
            const itemIndex = button.getAttribute('data-item-index');
            const row = button.closest('tr');
            
            // Create dropdown
            const dropdown = document.createElement('div');
            dropdown.className = 'navsweeper-add-dropdown';
            dropdown.innerHTML = `
                <a href="#" class="navsweeper-add-dropdown-item" data-position="above" data-item-id="${itemId}" data-item-index="${itemIndex}">
                    <i class="fa fa-chevron-up"></i> Add Above
                </a>
                <a href="#" class="navsweeper-add-dropdown-item" data-position="below" data-item-id="${itemId}" data-item-index="${itemIndex}">
                    <i class="fa fa-chevron-down"></i> Add Below
                </a>
            `;
            
            // Position dropdown relative to button
            const buttonContainer = button.parentElement;
            buttonContainer.style.position = 'relative';
            buttonContainer.appendChild(dropdown);

            // Handle button click to show dropdown
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close other dropdowns
                document.querySelectorAll('.navsweeper-add-dropdown.show').forEach(function(d) {
                    if (d !== dropdown) {
                        d.classList.remove('show');
                    }
                });
                
                // Toggle this dropdown
                dropdown.classList.toggle('show');
            });

            // Handle dropdown item clicks
            dropdown.querySelectorAll('.navsweeper-add-dropdown-item').forEach(function(item) {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const position = this.getAttribute('data-position');
                    const refItemId = this.getAttribute('data-item-id');
                    const itemTitle = row.querySelector('.column-primary strong').textContent.trim();
                    
                    // Set form values
                    referenceItemIdInput.value = refItemId;
                    insertPositionInput.value = position;
                    
                    // Update position text
                    const positionTextValue = position === 'above' 
                        ? `above "${itemTitle}"` 
                        : `below "${itemTitle}"`;
                    positionText.textContent = positionTextValue;
                    
                    // Close dropdown
                    dropdown.classList.remove('show');
                    
                    // Show modal
                    if (addItemModal) {
                        addItemModal.style.display = 'block';
                        document.body.style.overflow = 'hidden';
                        
                        // Focus on first input
                        const firstInput = addItemForm.querySelector('input[type="text"]');
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
            if (!e.target.closest('.navsweeper-add-item-btn') && 
                !e.target.closest('.navsweeper-add-dropdown')) {
                document.querySelectorAll('.navsweeper-add-dropdown.show').forEach(function(dropdown) {
                    dropdown.classList.remove('show');
                });
            }
        });

        // Close modal function
        function closeAddModal() {
            if (addItemModal) {
                addItemModal.style.display = 'none';
                document.body.style.overflow = '';
                // Reset form
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
                const label = document.getElementById('new_item_label');
                const url = document.getElementById('new_item_url');
                
                if (!label || !label.value.trim()) {
                    alert('Please enter a label for the menu item.');
                    e.preventDefault();
                    return false;
                }
                
                if (!url || !url.value.trim()) {
                    alert('Please enter a URL for the menu item.');
                    e.preventDefault();
                    return false;
                }
                
                return true;
            });
        }
    });
})();

