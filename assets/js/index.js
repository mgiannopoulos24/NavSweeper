document.addEventListener('DOMContentLoaded', function() {
    const selectAllBoxes = document.querySelectorAll('#cb-select-all-1');
    const itemCheckboxes = document.querySelectorAll('input[name="menu_items_to_delete[]"]');

    if(selectAllBoxes) {
        selectAllBoxes.forEach(function(box) {
            box.addEventListener('change', function() {
                const isChecked = this.checked;
                itemCheckboxes.forEach(item => item.checked = isChecked);
            });
        });
    }

    // Bulk Edit Modal Functionality
    const bulkEditBtn = document.getElementById('navsweeper_btn_bulk_edit');
    const bulkEditModal = document.getElementById('navsweeper-bulk-edit-modal');
    const bulkEditForm = document.getElementById('navsweeper-bulk-edit-form');
    const modalClose = document.querySelector('.navsweeper-modal-close');
    const modalCancel = document.querySelector('.navsweeper-modal-cancel');

    // Open modal
    if (bulkEditBtn && bulkEditModal) {
        bulkEditBtn.addEventListener('click', function() {
            const checkedItems = document.querySelectorAll('input[name="menu_items_to_delete[]"]:checked');
            
            if (checkedItems.length === 0) {
                alert('Please select at least one menu item to edit.');
                return;
            }

            // Show modal
            bulkEditModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    // Close modal
    function closeModal() {
        if (bulkEditModal) {
            bulkEditModal.style.display = 'none';
            document.body.style.overflow = '';
            // Reset form
            if (bulkEditForm) {
                bulkEditForm.reset();
            }
        }
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modalCancel) {
        modalCancel.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside
    if (bulkEditModal) {
        bulkEditModal.addEventListener('click', function(e) {
            if (e.target === bulkEditModal) {
                closeModal();
            }
        });
    }

    // Validate bulk edit form submission
    if (bulkEditForm) {
        bulkEditForm.addEventListener('submit', function(e) {
            const checkedFields = document.querySelectorAll('.navsweeper-field-checkbox:checked');
            
            if (checkedFields.length === 0) {
                alert('Please select at least one field to update.');
                e.preventDefault();
                return false;
            }

            // Validate that if a field is checked, it has a value (except for link_target which can be empty)
            let hasError = false;
            checkedFields.forEach(function(field) {
                const fieldValue = field.value;
                let inputElement = null;

                if (fieldValue === 'label') {
                    inputElement = document.querySelector('input[name="bulk_edit_label"]');
                } else if (fieldValue === 'url') {
                    inputElement = document.querySelector('input[name="bulk_edit_url"]');
                } else if (fieldValue === 'css_classes') {
                    inputElement = document.querySelector('input[name="bulk_edit_css_classes"]');
                } else if (fieldValue === 'link_target') {
                    // Link target can be empty (defaults to same window)
                    return;
                } else if (fieldValue === 'description') {
                    inputElement = document.querySelector('textarea[name="bulk_edit_description"]');
                }

                if (inputElement && !inputElement.value.trim()) {
                    hasError = true;
                }
            });

            if (hasError) {
                alert('Please provide values for all selected fields.');
                e.preventDefault();
                return false;
            }

            // Update hidden input with all selected item IDs
            const checkedItems = document.querySelectorAll('input[name="menu_items_to_delete[]"]:checked');
            const itemIds = Array.from(checkedItems).map(item => item.value);
            
            // Clear existing hidden inputs for menu items in the form
            const existingHiddenInputs = bulkEditForm.querySelectorAll('input[name="menu_items_to_delete[]"]');
            existingHiddenInputs.forEach(function(input) {
                input.remove();
            });
            
            // Add each item ID as a separate input
            itemIds.forEach(function(itemId) {
                const hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = 'menu_items_to_delete[]';
                hiddenInput.value = itemId;
                bulkEditForm.appendChild(hiddenInput);
            });

            return confirm('Are you sure you want to update ' + itemIds.length + ' selected item(s)?');
        });
    }
});

// Validate move operation before submission
function navsweeperValidateMove() {
    const checkboxes = document.querySelectorAll('input[name="menu_items_to_delete[]"]:checked');
    const destinationSelect = document.getElementById('destination_menu_id');
    
    // Check if any items are selected
    if (checkboxes.length === 0) {
        alert('Please select at least one menu item to move.');
        return false;
    }
    
    // Check if destination menu is selected
    if (!destinationSelect || destinationSelect.value === '0') {
        alert('Please select a destination menu.');
        return false;
    }
    
    // Confirm action
    const destinationMenuName = destinationSelect.options[destinationSelect.selectedIndex].text;
    const isSameMenu = destinationMenuName.includes('(current)');
    
    let message = 'Are you sure you want to move ' + checkboxes.length + ' item(s)';
    if (isSameMenu) {
        message += ' within the current menu?\n\nNote: Items will be reorganized as top-level items.';
    } else {
        const cleanMenuName = destinationMenuName.replace(' (current)', '');
        message += ' to "' + cleanMenuName + '"?\n\nNote: Moved items will become top-level items in the destination menu.';
    }
    
    return confirm(message);
}

