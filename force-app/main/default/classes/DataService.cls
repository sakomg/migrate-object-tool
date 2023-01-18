public inherited sharing class DataService {
  private enum OPERATION_TYPES {
    DML_INSERT,
    DML_UPDATE,
    DML_UPSERT,
    DML_DELETE
  }

  public static List<SObject> queryAccessible(List<SObject> records) {
    SObjectAccessDecision securityDecision;
    try {
      securityDecision = Security.stripInaccessible(AccessType.READABLE, records);
    } catch (Exception exc) {
      throw new DataServiceException('Access denied');
    }
    return securityDecision.getRecords();
  }

  public static void insertData(List<SObject> records) {
    checkObjectAccess(records, OPERATION_TYPES.DML_INSERT);

    Database.SaveResult[] dmlResults = Database.insert(records, true);
    checkDmlResultsAoN(dmlResults);
  }

  public static void updateData(List<SObject> records) {
    checkObjectAccess(records, OPERATION_TYPES.DML_UPDATE);

    Database.SaveResult[] dmlResults = Database.update(records, true);
    checkDmlResultsAoN(dmlResults);
  }

  public static void upsertData(List<SObject> records) {
    checkObjectAccess(records, OPERATION_TYPES.DML_UPSERT);

    Database.UpsertResult[] dmlResults = Database.upsert(records, true);
    checkDmlResultsAoN(dmlResults);
  }

  public static void deleteData(List<SObject> records) {
    checkObjectAccess(records, OPERATION_TYPES.DML_DELETE);

    Database.DeleteResult[] dmlResults = Database.delete(records, true);
    checkDmlResultsAoN(dmlResults);
  }

  private static void checkObjectAccess(List<SObject> records, OPERATION_TYPES operationType) {
    if (records.isEmpty()) {
      throw new DataServiceException('No records in the list to process.');
    }

    DescribeSObjectResult recordType = records.get(0).getSObjectType().getDescribe();
    switch on operationType {
      when DML_INSERT {
        if (!recordType.isCreateable()) {
          throw new DataServiceException('User has no object ' + operationType.name() + ' access.');
        }
      }
      when DML_UPDATE {
        if (!recordType.isUpdateable()) {
          throw new DataServiceException('User has no object ' + operationType.name() + ' access.');
        }
      }
      when DML_UPSERT {
        if (!recordType.isCreateable() || !recordType.isUpdateable()) {
          throw new DataServiceException('User has no object ' + operationType.name() + ' access.');
        }
      }
      when DML_DELETE {
        if (!recordType.isDeletable()) {
          throw new DataServiceException('User has no object ' + operationType.name() + ' access.');
        }
      }
    }
  }

  private static void checkDmlResultsAoN(Database.SaveResult[] dmlResults) {
    for (Database.SaveResult dmlResult : dmlResults) {
      if (!dmlResult.isSuccess()) {
        for (Database.Error dmlError : dmlResult.getErrors()) {
          throw new DataServiceException(
            'DML error detected in one or more records. Find more details in dmlSaveResults.',
            dmlResults
          );
        }
      }
    }
  }

  private static void checkDmlResultsAoN(Database.UpsertResult[] dmlResults) {
    for (Database.UpsertResult dmlResult : dmlResults) {
      if (!dmlResult.isSuccess()) {
        for (Database.Error dmlError : dmlResult.getErrors()) {
          throw new DataServiceException(
            'DML error detected in one or more records. Find more details in dmlUpsertResults.',
            dmlResults
          );
        }
      }
    }
  }

  private static void checkDmlResultsAoN(Database.DeleteResult[] dmlResults) {
    for (Database.DeleteResult dmlResult : dmlResults) {
      if (!dmlResult.isSuccess()) {
        for (Database.Error dmlError : dmlResult.getErrors()) {
          throw new DataServiceException(
            'DML error detected in one or more records. Find more details in dmlDeleteResults.',
            dmlResults
          );
        }
      }
    }
  }

  public class DataServiceException extends Exception {
    @TestVisible
    Database.SaveResult[] dmlSaveResults { get; private set; }
    @TestVisible
    Database.UpsertResult[] dmlUpsertResults { get; private set; }
    @TestVisible
    Database.DeleteResult[] dmlDeleteResults { get; private set; }
    @TestVisible
    Integer count { get; private set; }
    Boolean isSuccess = true;

    public DataServiceException(String message, Database.SaveResult[] dmlResults) {
      this(message);
      this.dmlSaveResults = dmlResults;
      this.count = dmlResults.size();
      this.isSuccess = false;
    }

    public DataServiceException(String message, Database.UpsertResult[] dmlResults) {
      this(message);
      this.dmlUpsertResults = dmlResults;
      this.count = dmlResults.size();
      this.isSuccess = false;
    }

    public DataServiceException(String message, Database.DeleteResult[] dmlResults) {
      this(message);
      this.dmlDeleteResults = dmlResults;
      this.count = dmlResults.size();
      this.isSuccess = false;
    }
  }
}
