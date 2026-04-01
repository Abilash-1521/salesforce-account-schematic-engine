/* =========================================================
   ACCOUNT SCHEMATIC ENGINE

   Handles:
   - Multi-level filtering
   - State management (selected + duplicate)
   - Dynamic SOQL-driven UI updates

   Flow:
   Account → Deposit → Treasury → Product → Status

   Key Pattern:
   Selected + Duplicate + All → Final Filter Set
========================================================= */
({
/* =========================================================
   1. ACCOUNT METHODS
========================================================= */

getAccounts : function(component,event) {

    console.log('🔥 getAccounts START');

    component.set('v.Accountcolumns', [
        { label: 'Account name', fieldName: 'Name', type: 'String'}
    ]);

    var AccountId = component.get("v.AccountId");
    console.log('AccountId => ', AccountId);

    if(!AccountId){
        console.log('❌ No AccountId found');
        return;
    }

    var dataLoad = component.get("c.getAccountList");

    dataLoad.setParams({
        "recordId": AccountId
    });

    dataLoad.setCallback(this,function(response){

        console.log('getAccounts response => ', response);

        if(response.getState() === 'SUCCESS') {

            var returnValue = response.getReturnValue();
            console.log('Accounts returned => ', JSON.stringify(returnValue));

            if(!returnValue){
                returnValue = [];
            }

            component.set("v.AccountData",returnValue);
            component.set("v.AccountDataDuplicate",returnValue);

            var allAccIds = [];

            returnValue.forEach(function (record){
                console.log('Processing Account => ', record);

                if(record && record.Id){
                    allAccIds.push(record.Id);
                }
            });

            console.log('All Account Ids => ', allAccIds);

            component.set("v.allAccIds",allAccIds);

            this.getDeposits(component,event,true);

        } else {
            console.log('❌ Error in getAccounts => ', response.getError());
        }
    });

    $A.enqueueAction(dataLoad);
},


/* =========================================================
   2. DEPOSIT METHODS
========================================================= */

getDeposits : function(component,event,data) {

    console.log('🔥 getDeposits START');

    component.set('v.DepositColumns', [
        { label: 'Deposit Name', fieldName: 'Name', type: 'String', disabled: true}
    ]);

    component.set('v.DepositStatusColumns', [
        { label: 'Deposit Status', fieldName: 'Name', type: 'String', disabled: true}
    ]);

    var allAccIds = component.get("v.allAccIds");
    console.log('All Account Ids => ', allAccIds);

    if(!allAccIds){
        allAccIds = [];
    }

    var action = component.get("c.getDepositList");

    action.setParams({
        "accountIdList": allAccIds
    });

    action.setCallback(this,function(response){

        console.log('getDeposits response => ', response);

        if(response.getState() === 'SUCCESS'){

            var depositRecs = response.getReturnValue();
            console.log('Deposits => ', JSON.stringify(depositRecs));

            if(!depositRecs){
                depositRecs = [];
            }

            var statusString = '';
            var statusArray = [];
            var allStatus = [];
            var allDepositIds = [];

            depositRecs.forEach(function (record){

                console.log('Deposit Record => ', record);

                if(record && record.TS_Status__c){

                    if(!statusString.includes(record.TS_Status__c)){

                        var StatusRec = {
                            "Name": record.TS_Status__c,
                            "Id": record.TS_Status__c
                        };

                        statusArray.push(StatusRec);
                        statusString += record.TS_Status__c + ',';
                        allStatus.push(record.TS_Status__c);
                    }
                }

                if(record && record.Id){
                    allDepositIds.push(record.Id);
                }
            });

            console.log('Deposit Ids => ', allDepositIds);
            console.log('Deposit Status => ', allStatus);

            component.set("v.allDepositIds",allDepositIds);
            component.set("v.allDepositStatusValues",allStatus);

            if(data === true){

                console.log('➡️ Initial Load Flow');

                component.set("v.DepositData",depositRecs);
                component.set("v.DepositDataDuplicate",depositRecs);

                component.set("v.DepositStatusData",statusArray);
                component.set("v.DepositStatusDuplicateData",statusArray);

                this.getAnalyzedAccrecs(component,event,true);

            } else {

                console.log('➡️ Filter Flow');

                this.getDepositswithDepositFilter(component,event);
            }

        } else {
            console.log('❌ Error in getDeposits => ', response.getError());
        }
    });

    $A.enqueueAction(action);
},


getDepositswithDepositFilter : function(component,event) {

    console.log('🔥 getDepositswithDepositFilter START');

    var parentcom = component.get("v.parent");

    if(parentcom && parentcom.spiinerset){
        parentcom.spiinerset();
    }

    var selectedDepositIds = component.get("v.selectedDepositIds");
    var selectedDepositIdsDuplicate = component.get("v.selectedDepositIdsDuplicate");
    var allDepositIds = component.get("v.allDepositIds");

    console.log('Selected Deposits => ', selectedDepositIds);
    console.log('Duplicate Deposits => ', selectedDepositIdsDuplicate);

    if(!selectedDepositIds) selectedDepositIds = [];
    if(!selectedDepositIdsDuplicate) selectedDepositIdsDuplicate = [];
    if(!allDepositIds) allDepositIds = [];

    var allDepositAccs = this.getOverallSelection(
        selectedDepositIds,
        selectedDepositIdsDuplicate,
        allDepositIds
    );

    var selectedDepositStatus = component.get("v.selectedDepositStatusIds");
    var dubSelectedDepositStatus = component.get("v.selectedDepositStatusIdsDup");
    var allDepositStatus = component.get("v.allDepositStatusValues");

    if(!selectedDepositStatus) selectedDepositStatus = [];
    if(!dubSelectedDepositStatus) dubSelectedDepositStatus = [];
    if(!allDepositStatus) allDepositStatus = [];

    var allDepositStatusList = this.getOverallSelection(
        selectedDepositStatus,
        dubSelectedDepositStatus,
        allDepositStatus
    );

    console.log('Final Deposit Filter Ids => ', allDepositAccs);
    console.log('Final Deposit Status => ', allDepositStatusList);

    var action = component.get("c.getDepositListWithFilter");

    action.setParams({
        "depostIdList": allDepositAccs,
        "depositStatusList": allDepositStatusList
    });

    action.setCallback(this,function(response){

        console.log('Filtered Deposit Response => ', response);

        if(response.getState() === 'SUCCESS'){

            var depositRecs = response.getReturnValue();

            if(!depositRecs){
                depositRecs = [];
            }

            var statusString = '';
            var statusArray = [];
            var allStatus = [];
            var allDepositIds = [];

            depositRecs.forEach(function (record){

                if(record && record.TS_Status__c){

                    if(!statusString.includes(record.TS_Status__c)){
                        statusArray.push({
                            Name: record.TS_Status__c,
                            Id: record.TS_Status__c
                        });

                        statusString += record.TS_Status__c + ',';
                        allStatus.push(record.TS_Status__c);
                    }
                }

                if(record && record.Id){
                    allDepositIds.push(record.Id);
                }
            });

            var filtercheck = component.get("v.DepositfilterString");
            if(!filtercheck) filtercheck = '';

            console.log('Filter Check => ', filtercheck);

            if(!filtercheck.includes('depositfilter')){
                depositRecs = this.treasurySort(depositRecs);
                component.set("v.DepositData",depositRecs);
                component.set("v.DepositDataDuplicate",depositRecs);
            }

            if(!filtercheck.includes('depositStatus')){
                statusArray = this.treasurySort(statusArray);
                component.set("v.DepositStatusData",statusArray);
                component.set("v.DepositStatusDuplicateData",statusArray);
            }

            component.set("v.allDepositIds",allDepositIds);
            component.set("v.allDepositStatusValues",allStatus);

            this.getAnalyzedAccrecs(component,event,true);
        }
    });

    $A.enqueueAction(action);
},


/* =========================================================
   3. TREASURY METHODS (FULL EXPANDED)
========================================================= */

getAnalyzedAccrecs : function(component,event,check){

    console.log('🔥 getAnalyzedAccrecs START');

    component.set('v.TreasuryCoumns', [
        { label: 'Treasury Name', fieldName: 'Name', type: 'String'}
    ]);
    component.set('v.StatusColumns', [
        { label: 'Status', fieldName: 'Name', type: 'String'}
    ]);
    component.set('v.ProductColumns', [
        { label: 'Product Name', fieldName: 'Name', type: 'String'}
    ]);
    component.set('v.TreasuryAccountcolumns', [
        { label: 'Account name', fieldName: 'Name', type: 'String'}
    ]);

    var parentcom = component.get("v.parent");
    if(parentcom && parentcom.spiinerset){
        parentcom.spiinerset();
    }

    var selectedDepositIds = component.get("v.selectedDepositIds") || [];
    var selectedDepositIdsDuplicate = component.get("v.selectedDepositIdsDuplicate") || [];
    var allDepositIds = component.get("v.allDepositIds") || [];

    var allDepositAccs = this.getOverallSelection(
        selectedDepositIds,
        selectedDepositIdsDuplicate,
        allDepositIds
    );

    var selectedDepositStatus = component.get("v.selectedDepositStatusIds") || [];
    var dubSelectedDepositStatus = component.get("v.selectedDepositStatusIdsDup") || [];
    var allDepositStatus = component.get("v.allDepositStatusValues") || [];

    var allDepositStatusList = this.getOverallSelection(
        selectedDepositStatus,
        dubSelectedDepositStatus,
        allDepositStatus
    );

    console.log('Deposit Ids => ', allDepositAccs);
    console.log('Deposit Status => ', allDepositStatusList);

    var action = component.get("c.getAllAnalyzedAccounts");

    action.setParams({
        "depostIdList": allDepositAccs,
        "depositStatusList": allDepositStatusList
    });

    action.setCallback(this,function(response){

        console.log('Analyzed Response => ', response);

        if(response.getState() === 'SUCCESS'){

            var analyzedAccRecs = response.getReturnValue();

            if(!analyzedAccRecs){
                analyzedAccRecs = [];
            }

            var statusArray = [];
            var TreasuryArray = [];
            var TreasuryAccArray = [];
            var ProductArray = [];

            var statusString = '';
            var productIdString = '';
            var treasuryAccIdString = '';
            var treasuryString= '';

            var allStatus =[] ;
            var allTreasuryRecs =[] ;
            var allProducts =[] ;
            var allTreasuryAccs =[] ;

            analyzedAccRecs.forEach(function (record){

                if(record && record.TS_Treasury_Service__r){

                    var svc = record.TS_Treasury_Service__r;

                    if(svc.Status__c && !statusString.includes(svc.Status__c)){
                        statusArray.push({Name: svc.Status__c, Id: svc.Status__c});
                        statusString += svc.Status__c+',';
                        allStatus.push(svc.Status__c);
                    }

                    if(!treasuryString.includes(record.TS_Treasury_Service__c)){
                        TreasuryArray.push({
                            Name: svc.Name,
                            Id: record.TS_Treasury_Service__c
                        });
                        treasuryString += record.TS_Treasury_Service__c+',';
                        allTreasuryRecs.push(record.TS_Treasury_Service__c);
                    }

                    if(svc.TS_Account__c && !treasuryAccIdString.includes(svc.TS_Account__c)){
                        TreasuryAccArray.push({
                            Id: svc.TS_Account__c,
                            Name: svc.TS_Account__r ? svc.TS_Account__r.Name : ''
                        });
                        treasuryAccIdString += svc.TS_Account__c+',';
                        allTreasuryAccs.push(svc.TS_Account__c);
                    }

                    if(svc.TS_Product__c && !productIdString.includes(svc.TS_Product__c)){
                        ProductArray.push({
                            Id: svc.TS_Product__c,
                            Name: svc.TS_Product__r ? svc.TS_Product__r.Name : ''
                        });
                        productIdString += svc.TS_Product__c+',';
                        allProducts.push(svc.TS_Product__c);
                    }
                }
            });

            component.set("v.treasuryData",this.treasurySort(TreasuryArray));
            component.set("v.treasuryDataDuplicate",TreasuryArray);

            component.set("v.StatusData",this.treasurySort(statusArray));
            component.set("v.StatusDataDuplicate",statusArray);

            component.set("v.ProductData",this.treasurySort(ProductArray));
            component.set("v.ProductDataDuplicate",ProductArray);

            component.set("v.TreasuryAccountData",this.treasurySort(TreasuryAccArray));
            component.set("v.TreasuryAccountDataDuplicate",TreasuryAccArray);

            component.set("v.allProductIds",allProducts);
            component.set("v.allStatus",allStatus);
            component.set("v.allTreasuryIds",allTreasuryRecs);
            component.set("v.allTreasuryAccIds",allTreasuryAccs);

            if(check){
                this.fireApplicationEvent(component,event);
            } else {
                this.getAnalyzedAccwithTreasuryFilters(component,event);
            }
        }
    });

    $A.enqueueAction(action);
},


/* =========================================================
   4. EVENT
========================================================= */

fireApplicationEvent  : function(component,event) {

    console.log('🔥 fireApplicationEvent');

    var appEvent = $A.get("e.c:AccountSchematicAppEvent");

    appEvent.setParams({
        "selectedAccIds" : component.get("v.allAccIds") || [],
        "selectedDepositIds" : component.get("v.allDepositIds") || [],
        "SelectedDepositStatusValues": component.get("v.allDepositStatusValues") || [],
        "selectedTreasuryIds" : component.get("v.allTreasuryIds") || [],
        "selectedTreasuryStatusIds" : component.get("v.allStatus") || [],
        "selectedProductIds" : component.get("v.allProductIds") || [],
        "selectedTreasuryAccIds" : component.get("v.allTreasuryAccIds") || []
    });

    appEvent.fire();
},


/* =========================================================
   5. UTIL METHODS
========================================================= */

treasurySort: function(sortArray){

    console.log('Sorting => ', sortArray);

    if(!sortArray){
        return [];
    }

    sortArray.sort(function(a,b) {
        var t1 = a.Name == b.Name;
        var t2 = a.Name < b.Name;
        return t1 ? 0 : (true ? -1 : 1) * (t2 ? 1 : -1);
    });

    return sortArray;
},


getOverallSelection : function(selectedIds, dublicateSelectedIds, AllIds){

    console.log('getOverallSelection called');

    if(!selectedIds) selectedIds = [];
    if(!dublicateSelectedIds) dublicateSelectedIds = [];
    if(!AllIds) AllIds = [];

    var returnIds = [];

    if(selectedIds.length > 0 && dublicateSelectedIds.length > 0){

        returnIds = [...dublicateSelectedIds];

        selectedIds.forEach(function (selectedId){

            var check = true;

            dublicateSelectedIds.forEach(function (dublicateId){
                if(selectedId == dublicateId){
                    check = false;
                }
            });

            if(check){
                returnIds.push(selectedId);
            }
        });

    } else if(selectedIds.length === 0 && dublicateSelectedIds.length > 0){

        returnIds = dublicateSelectedIds;

    } else if(selectedIds.length > 0 && dublicateSelectedIds.length === 0){

        returnIds = selectedIds;

    } else {

        returnIds = AllIds;
    }

    console.log('Final Selection => ', returnIds);

    return returnIds;
},


removeUncheckIds : function(selectedIds, dublicateSelectedIds,recordsdata, recordsdataDublicate){

    console.log('🔥 removeUncheckIds');

    if(!selectedIds) selectedIds = [];
    if(!dublicateSelectedIds) dublicateSelectedIds = [];
    if(!recordsdata) recordsdata = [];

    recordsdata.forEach(function (recordData){

        if(recordData && recordData.Id){

            if(!selectedIds.includes(recordData.Id)){

                var index = dublicateSelectedIds.indexOf(recordData.Id);

                if(index !== -1){
                    dublicateSelectedIds.splice(index,1);
                }
            }
        }
    });

    return dublicateSelectedIds;
}

})