
import OptionDropdown from "../components/OptionDropdown";

export default {
  props: {
    option: {
      required: true,
      type: Object
    },

    drawingSettings: {
      required: false,
      type: Object,
      default: () => ({
        cellSizeFeet: 5,
        cellSize: 50
      })
    }
  },

  computed: {
    cellSizeFeet() {
      return this.drawingSettings.cellSizeFeet;
    },

    cellSize() {
      return this.drawingSettings.cellSize;
    }
  },

  mounted() {
  },

  components: {
    OptionDropdown
  }
}