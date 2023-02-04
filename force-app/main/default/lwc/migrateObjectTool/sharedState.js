let _data

const SharedState = {
  setData: (newVal) => {
    _data = newVal
  },
  getData: () => {
    return _data
  }
}

Object.freeze(SharedState)

export { SharedState }
