import { Store } from 'le5le-store'
const Layer = /** @class */ (function () {
  function Layer (TID) {
    const _this = this
    this.TID = TID
    this.subcribe = Store.subscribe(this.generateStoreKey('topology-data'), function (val) {
      _this.data = val
    })
  }
  Layer.prototype.generateStoreKey = function (key) {
    return this.TID + '-' + key
  }
  Layer.prototype.destroy = function () {
    this.subcribe.unsubscribe()
    this.subcribe = null
  }
  return Layer
}())
export { Layer }
// # sourceMappingURL=layer.js.map
