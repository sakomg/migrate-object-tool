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

}