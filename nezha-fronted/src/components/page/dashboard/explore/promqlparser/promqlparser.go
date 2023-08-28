// 编译为wasm文件 在页面中引入
package main

import (
	"syscall/js"

	"github.com/prometheus/prometheus/promql/parser"
)

func parsePromQL(this js.Value, args []js.Value) interface{} {
	promql := args[0].String()
	expr, err := parser.ParseExpr(promql)
	if err != nil {
		return map[string]interface{}{
			"status":  "error",
			"message": err.Error(),
		}
	}

	return map[string]interface{}{
		"status": "success",
		"result": expr.Pretty(0),
	}
}

func main() {
	c := make(chan struct{}, 0)

	// 注册函数
	js.Global().Set("parsePromQL", js.FuncOf(parsePromQL))

	<-c
}
