({
    /* =====================================
       INIT
    ===================================== */
    doInit: function(component, event, helper) {
        component.set("v.EventType", "Loading");

        helper.getAccounts(component, event);
        helper.updateFilterFlag(component);
    },

    /* =====================================
       CLEAR FILTER ENGINE
    ===================================== */
    clearAllFilters: function(component, event, helper) {

        // Account
        component.set("v.selectedAccIds", []);
        component.set("v.selectedAccIdsDuplicate", []);

        // Deposit
        component.set("v.selectedDepositIds", []);
        component.set("v.selectedDepositIdsDuplicate", []);

        // Deposit Status
        component.set("v.selectedDepositStatusIds", []);
        component.set("v.selectedDepositStatusIdsDup", []);

        // Treasury
        component.set("v.treasurySelectedIds", []);
        component.set("v.treasurySelectedIdsDuplicate", []);

        // Status
        component.set("v.selectedStatus", []);
        component.set("v.selectedStatusDuplicate", []);

        // Product
        component.set("v.SelectedProducts", []);
        component.set("v.SelectedProductsDuplicate", []);

        // Treasury Account
        component.set("v.selectedTreasuryAccIds", []);
        component.set("v.selectedTreasuryAccIdsDuplicate", []);

        // Filter Flags
        component.set("v.findAccountFilter", false);
        component.set("v.findDepositFilter", false);
        component.set("v.findtreasuryAccFilter", false);
        component.set("v.findtreasuryFilter", false);
        component.set("v.findtreasuryStatusFilter", false);
        component.set("v.findtreasuryProductFilter", false);
        component.set("v.findDepositStatusFilter", false);

        // Search Reset
        component.set("v.AccountSearchValue", "");
        component.set("v.DepositSearchValue", "");
        component.set("v.TreasuryAccountSearchValue", "");
        component.set("v.TreasurySearchValue", "");
        component.set("v.StatusSearchValue", "");
        component.set("v.ProductSearchValue", "");
        component.set("v.DepositStatusSearchValue", "");

        component.set("v.isAnyFilterActive", false);

        // Reload entire engine
        helper.getAccounts(component, event);
    }
})