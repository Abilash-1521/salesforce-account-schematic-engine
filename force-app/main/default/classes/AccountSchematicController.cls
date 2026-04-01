/**
 * Account Schematic Controller
 *
 * Handles dynamic query building for:
 * - Account → Deposit → Treasury → Product relationships
 *
 * Supports:
 * - Multi-filter combinations
 * - Dynamic SOQL
 * - Enterprise-level data models (nCino-style)
 */
public with sharing class AccountSchematicController {

    /* =========================================================
       1. GET ACCOUNTS
    ========================================================= */
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountList(Id recordId){

        if(recordId == null){
            return new List<Account>();
        }

        return [
            SELECT Id, Name
            FROM Account
            WHERE Id = :recordId
        ];
    }


    /* =========================================================
       2. GET DEPOSITS
    ========================================================= */
    @AuraEnabled(cacheable=true)
    public static List<TS_Deposit__c> getDepositList(List<Id> accountIdList){

        if(accountIdList == null || accountIdList.isEmpty()){
            return new List<TS_Deposit__c>();
        }

        return [
            SELECT Id, Name, TS_Status__c, TS_Account__c
            FROM TS_Deposit__c
            WHERE TS_Account__c IN :accountIdList
        ];
    }


    /* =========================================================
       3. GET DEPOSITS WITH FILTER
    ========================================================= */
    @AuraEnabled(cacheable=true)
    public static List<TS_Deposit__c> getDepositListWithFilter(
        List<Id> depostIdList,
        List<String> depositStatusList
    ){

        if((depostIdList == null || depostIdList.isEmpty()) &&
           (depositStatusList == null || depositStatusList.isEmpty())){
            return new List<TS_Deposit__c>();
        }

        String query = 'SELECT Id, Name, TS_Status__c FROM TS_Deposit__c WHERE Id != NULL';

        if(depostIdList != null && !depostIdList.isEmpty()){
            query += ' AND Id IN :depostIdList';
        }

        if(depositStatusList != null && !depositStatusList.isEmpty()){
            query += ' AND TS_Status__c IN :depositStatusList';
        }

        return Database.query(query);
    }


    /* =========================================================
       4. GET ANALYZED ACCOUNTS
    ========================================================= */
    @AuraEnabled(cacheable=true)
    public static List<TS_Analyzed_Account__c> getAllAnalyzedAccounts(
        List<Id> depostIdList,
        List<String> depositStatusList
    ){

        if(depostIdList == null || depostIdList.isEmpty()){
            return new List<TS_Analyzed_Account__c>();
        }

        return [
            SELECT Id,
                   TS_Deposit__c,
                   TS_Deposit__r.TS_Status__c,

                   TS_Treasury_Service__c,
                   TS_Treasury_Service__r.Name,
                   TS_Treasury_Service__r.Status__c,

                   TS_Treasury_Service__r.TS_Account__c,
                   TS_Treasury_Service__r.TS_Account__r.Name,

                   TS_Treasury_Service__r.TS_Product__c,
                   TS_Treasury_Service__r.TS_Product__r.Name

            FROM TS_Analyzed_Account__c
            WHERE TS_Deposit__c IN :depostIdList
        ];
    }


    /* =========================================================
       5. ANALYZED WITH ACCOUNT FILTER
    ========================================================= */
    @AuraEnabled(cacheable=true)
    public static List<TS_Analyzed_Account__c> getAllAnalyzedAccountswithAccFilter(
        List<Id> selectedAccIdList
    ){

        if(selectedAccIdList == null || selectedAccIdList.isEmpty()){
            return new List<TS_Analyzed_Account__c>();
        }

        return [
            SELECT Id,
                   TS_Deposit__c,
                   TS_Deposit__r.Name,
                   TS_Deposit__r.TS_Status__c,

                   TS_Treasury_Service__c,
                   TS_Treasury_Service__r.Name,
                   TS_Treasury_Service__r.Status__c,

                   TS_Treasury_Service__r.TS_Account__c,
                   TS_Treasury_Service__r.TS_Account__r.Name,

                   TS_Treasury_Service__r.TS_Product__c,
                   TS_Treasury_Service__r.TS_Product__r.Name

            FROM TS_Analyzed_Account__c
            WHERE TS_Treasury_Service__r.TS_Account__c IN :selectedAccIdList
        ];
    }


    /* =========================================================
       6. ANALYZED WITH TREASURY FILTER
    ========================================================= */
    @AuraEnabled(cacheable=true)
    public static List<TS_Analyzed_Account__c> getAllAnalyzedAccountswithtreasuryFilters(
        List<Id> selectedTreasuryAccs,
        List<Id> selectedTreasuryRecs,
        List<String> SelectedTreasuryStatus,
        List<Id> selectedProductIds
    ){

        String baseQuery = '
            SELECT Id,
                   TS_Treasury_Service__c,
                   TS_Treasury_Service__r.Name,
                   TS_Treasury_Service__r.Status__c,

                   TS_Treasury_Service__r.TS_Account__c,
                   TS_Treasury_Service__r.TS_Account__r.Name,

                   TS_Treasury_Service__r.TS_Product__c,
                   TS_Treasury_Service__r.TS_Product__r.Name

            FROM TS_Analyzed_Account__c
            WHERE Id != NULL
        ';

        if(selectedTreasuryAccs != null && !selectedTreasuryAccs.isEmpty()){
            baseQuery += ' AND TS_Treasury_Service__r.TS_Account__c IN :selectedTreasuryAccs';
        }

        if(selectedTreasuryRecs != null && !selectedTreasuryRecs.isEmpty()){
            baseQuery += ' AND TS_Treasury_Service__c IN :selectedTreasuryRecs';
        }

        if(SelectedTreasuryStatus != null && !SelectedTreasuryStatus.isEmpty()){
            baseQuery += ' AND TS_Treasury_Service__r.Status__c IN :SelectedTreasuryStatus';
        }

        if(selectedProductIds != null && !selectedProductIds.isEmpty()){
            baseQuery += ' AND TS_Treasury_Service__r.TS_Product__c IN :selectedProductIds';
        }

        return Database.query(baseQuery);
    }

}