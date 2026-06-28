document.addEventListener('DOMContentLoaded', function() {
    var selectAllBoxes = document.querySelectorAll('#cb-select-all-1');
    var itemCheckboxes = document.querySelectorAll('input[name="menu_items_to_delete[]"]');

    if (selectAllBoxes) {
        selectAllBoxes.forEach(function(box) {
            box.addEventListener('change', function() {
                var isChecked = this.checked;
                itemCheckboxes.forEach(function(item) {
                    item.checked = isChecked;
                });
            });
        });
    }

    // Bulk Edit Modal Functionality
    var bulkEditBtn = document.getElementById('nsw_btn_bulk_edit');
    var bulkEditModal = document.getElementById('nsw-bulk-edit-modal');
    var bulkEditForm = document.getElementById('nsw-bulk-edit-form');
    var modalClose = document.querySelector('.nsw-modal-close');
    var modalCancel = document.querySelector('.nsw-modal-cancel');

    // Open modal
    if (bulkEditBtn && bulkEditModal) {
        bulkEditBtn.addEventListener('click', function() {
            var checkedItems = document.querySelectorAll('input[name="menu_items_to_delete[]"]:checked');

            if (checkedItems.length === 0) {
                alert(nswI18n.selectEditItems);
                return;
            }

            bulkEditModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    // Close modal
    function closeModal() {
        if (bulkEditModal) {
            bulkEditModal.style.display = 'none';
            document.body.style.overflow = '';
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
            var checkedFields = document.querySelectorAll('.nsw-field-checkbox:checked');

            if (checkedFields.length === 0) {
                alert(nswI18n.selectFields);
                e.preventDefault();
                return false;
            }

            var hasError = false;
            checkedFields.forEach(function(field) {
                var fieldValue = field.value;
                var inputElement = null;

                if (fieldValue === 'label') {
                    inputElement = document.querySelector('input[name="bulk_edit_label"]');
                } else if (fieldValue === 'url') {
                    inputElement = document.querySelector('input[name="bulk_edit_url"]');
                } else if (fieldValue === 'css_classes') {
                    inputElement = document.querySelector('input[name="bulk_edit_css_classes"]');
                } else if (fieldValue === 'link_target') {
                    return;
                } else if (fieldValue === 'description') {
                    inputElement = document.querySelector('textarea[name="bulk_edit_description"]');
                }

                if (inputElement && !inputElement.value.trim()) {
                    hasError = true;
                }
            });

            if (hasError) {
                alert(nswI18n.provideValues);
                e.preventDefault();
                return false;
            }

            var checkedItems = document.querySelectorAll('input[name="menu_items_to_delete[]"]:checked');
            var itemIds = Array.from(checkedItems).map(function(item) {
                return item.value;
            });

            var existingHiddenInputs = bulkEditForm.querySelectorAll('input[name="menu_items_to_delete[]"]');
            existingHiddenInputs.forEach(function(input) {
                input.remove();
            });

            itemIds.forEach(function(itemId) {
                var hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = 'menu_items_to_delete[]';
                hiddenInput.value = itemId;
                bulkEditForm.appendChild(hiddenInput);
            });

            return confirm(nswI18n.confirmUpdate.replace('%d', itemIds.length));
        });
    }
});

// Validate move operation before submission
function nswValidateMove() {
    var checkboxes = document.querySelectorAll('input[name="menu_items_to_delete[]"]:checked');
    var destinationSelect = document.getElementById('destination_menu_id');

    if (checkboxes.length === 0) {
        alert(nswI18n.selectMoveItems);
        return false;
    }

    if (!destinationSelect || destinationSelect.value === '0') {
        alert(nswI18n.selectDestination);
        return false;
    }

    var destinationMenuName = destinationSelect.options[destinationSelect.selectedIndex].text;
    var isSameMenu = destinationMenuName.indexOf('(' + nswI18n.currentLabel + ')') !== -1;
    var count = checkboxes.length;

    var message;
    if (isSameMenu) {
        message = nswI18n.confirmMoveSame.replace('%d', count) + '\n\n' + nswI18n.moveNote;
    } else {
        var cleanMenuName = destinationMenuName.replace(' (' + nswI18n.currentLabel + ')', '');
        message = nswI18n.confirmMoveOther.replace('%1$d', count).replace('%2$s', cleanMenuName) + '\n\n' + nswI18n.moveNote;
    }

    return confirm(message);
}
