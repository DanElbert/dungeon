export default {
  unusedNames(state) {
    const usedNames = state.items.map(i => i.name);
    return state.names.filter(n => usedNames.indexOf(n) === -1);
  }
}