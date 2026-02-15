public with sharing class Constants {
  public static final List<String> UNAVAILABLE_STANDARD_SOBJECTS_ENDS = new List<String>{ 'history', 'share' };
  public static final List<String> MISSING_BO_TYPES = new List<String>{ 'BOOLEAN', 'ADDRESS', 'DATE' };
  public static List<String> SYSTEM_FIELDS = new List<String>{
    'CompletedDateTime',
    'RecurrenceRegeneratedType',
    'RecurrenceMonthOfYear',
    'RecurrenceInstance',
    'RecurrenceDayOfMonth',
    'RecurrenceDayOfWeekMask',
    'RecurrenceType',
    'RecurrenceTimeZoneSidKey',
    'RecurrenceEndDateOnly',
    'RecurrenceStartDateOnly',
    'RecurrenceActivityId',
    'ReminderDateTime',
    'ActivityOriginType',
    'ArchivedDate',
    'IsArchived',
    'IsClosed',
    'PrioritySortOrder',
    'IsHighPriority',
    'AccountId',
    'Jigsaw Contact Id',
    'ReportsToName',
    'EmailBouncedReason',
    'EmailBouncedDate',
    'IsEmailBounced',
    'JigsawContactId',
    'IsDeleted',
    'SystemModstamp',
    'LastActivityDate',
    'LastViewedDate',
    'LastReferencedDate',
    'UserRecordAccessId',
    'MasterRecordId',
    'AccountSource',
    'IsCssEnabled',
    'CssLastLoginDate',
    'CompareName',
    'PhotoUrl',
    'CompareSite',
    'OwnerAlias',
    'JigSawCompanyId',
    'ConnectionReceivedDate',
    'ConnectionSentDate',
    'AccountRollupId',
    'ProductIsArchived'
  };

  public static final Map<String, String> DAY_BY_NUMBER = new Map<String, String>{
    '1' => 'SUN',
    '2' => 'MON',
    '3' => 'TUE',
    '4' => 'WED',
    '5' => 'THU',
    '6' => 'FRI',
    '7' => 'SAT'
  };

  public static final Map<String, List<String>> MIGRATE_OBJECT_FIELDS_BY_REQUEST_TYPE = new Map<String, List<String>>{
    'Initial' => new List<String>{
      'Id',
      'msol__Cron_Id__c',
      'msol__Batch_Id__c',
      'msol__Job_Name__c',
      'msol__SObject_Name__c',
      'msol__Big_Object_Name__c',
      'msol__SOQL__c',
      'msol__Cron_Expression__c',
      'msol__Field_Mapping__c',
      'msol__User_Id__c',
      'msol__Period__c',
      'msol__Migrate_Time__c',
      'msol__Recurrence_Details__c',
      'msol__Icon_Name__c'
    },
    'Track changes' => new List<String>{ 'Id', 'msol__Cron_Id__c', 'msol__Batch_Id__c' }
  };

  public static final Map<String, List<String>> CRON_TRIGGER_FIELDS_BY_REQUEST_TYPE = new Map<String, List<String>>{
    'Initial' => new List<String>{
      'Id',
      'CronExpression',
      'CronJobDetail.Name',
      'CronJobDetailId',
      'EndTime',
      'NextFireTime',
      'PreviousFireTime',
      'StartTime',
      'State',
      'TimesTriggered',
      'CronJobDetail.JobType'
    },
    'Track changes' => new List<String>{ 'Id', 'State' }
  };

  public static final Map<String, String> GENERAL_INFORMATION_CLASS_NAME_BY_REQUEST_TYPE = new Map<String, String>{
    'Initial' => 'Models.InitialGeneralInformation',
    'Track changes' => 'Models.TrackedGeneralInformation'
  };
}