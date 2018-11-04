
import bsn from "bootstrap.native/dist/bootstrap-native-v4";
import OptionDropdown from "../components/OptionDropdown";

export default {
  props: {
    option: {
      required: true,
      type: Object
    }
  },

  mounted() {
    this.$el.title = this.option.label || this.option.name;
    new bsn.Tooltip(this.$el, {
      placement: 'top'
    });
  },

  components: {
    OptionDropdown
  }
}