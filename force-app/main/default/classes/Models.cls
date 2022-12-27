public without sharing class Models {
  public class PickListOption implements Comparable {
    private String label;
    private String value;

    public PickListOption(String label, String value) {
      this.label = label;
      this.value = value;
    }

    public Integer compareTo(Object compareTo) {
      PickListOption compareToOption = (PickListOption) compareTo;
      if (this.label == compareToOption.label) {
        return 0;
      }
      if (this.label > compareToOption.label) {
        return 1;
      }
      return -1;
    }
  }

  public class FieldDefinition {
    private String value;
    private String type;
    private Integer length;

    public FieldDefinition(Schema.DescribeFieldResult describe) {
      this.value = describe.getName();
      this.type = describe.getType().name();
      this.length = describe.getLength();
    }
  }

  public class UserQueryResponse {
    private Boolean success;
    private Integer dataLength;
    private String message;

    public Boolean isSuccess() {
      return this.success;
    }

    public Integer getDataLength() {
      return this.dataLength;
    }

    public String getMessage() {
      return this.message;
    }

    public void setSuccess(Boolean success) {
      this.success = success;
    }

    public void setDataLength(Integer length) {
      this.dataLength = length;
    }

    public void setMessage(String message) {
      this.message = message;
    }
  }
}
