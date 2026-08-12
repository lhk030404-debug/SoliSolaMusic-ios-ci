class IcuMock {
  init() {}

  parse(value) {
    return value
  }

  addLookupKeys() {}
}

IcuMock.type = 'i18nFormat'

module.exports = IcuMock
