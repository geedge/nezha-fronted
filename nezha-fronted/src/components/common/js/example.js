/* 处理legend的别名 */
export function dealLegendAlias (legend, aliasExpression) {
  if (/\{\{.+\}\}/.test(aliasExpression)) {
    const labelValue = aliasExpression.replace(/(\{\{.+?\}\})/g, function (i) {
      const label = i.substr(i.indexOf('{{') + 2, i.indexOf('}}') - i.indexOf('{{') - 2)
      // if (!legend) {
      //   return label
      // }
      const reg = new RegExp(label + '=".+?"')
      let value = null
      if (reg.test(legend)) {
        const find = legend.match(reg)[0]
        value = find.substr(find.indexOf('"') + 1, find.lastIndexOf('"') - find.indexOf('"') - 1)
      }
      return value || ''
    })
    return labelValue
  } else {
    if (!aliasExpression) {
      return legend
      // let result =legend.substr(legend.indexOf('"') + 1,legend.lastIndexOf('"') - legend.indexOf('"') - 1);
      // return result
    }
    return aliasExpression
  }
}
