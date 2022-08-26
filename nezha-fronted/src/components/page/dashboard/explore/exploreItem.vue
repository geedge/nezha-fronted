<template>
  <div class="explore list-page">
    <div class="main-list">
      <div class="main-container explore-split-box">
        <!-- 关闭按钮 -->
        <div v-if="closable" class="explore-close">
          <span @click="split"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
        </div>
        <!-- 顶部工具栏 -->
        <div class="top-tools" style="z-index: 1">
          <el-row class="block-col-2" style="width: 300px;">
            <el-col>
              <el-dropdown trigger="click">
              <span class="el-dropdown-link explore-dropdown__item">
                <span><i :class="selectIcon"></i></span>
                <span>{{selectValue}}</span>
                <span><i class="el-icon-arrow-down el-icon--right"></i></span>
              </span>
                <el-dropdown-menu style="width: 118px" class="el-dropdown__width right-box-select-top right-public-box-dropdown-top" placement="bottom-end" slot="dropdown">
                  <el-dropdown-item
                    @click.native="selectMetricsLogs(item.label,item.icon, item.value)"
                    v-for="item in searchMetrics"
                    :key="item.value"><i class="nz-icon" :class="item.icon" style="margin-right: 5px"/>{{item.label}}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </el-col>
          </el-row>
          <div class="top-tool-right">
            <button v-if="!closable" class="top-tool-btn top-tool-btn--text margin-r-10" style="cursor: pointer;" type="button" @click="split">
              {{$t('overall.split')}}</button>
            <pick-time id="explore" ref="pickTime" v-model="filterTime" :class="{'margin-r-10': showMetrics}" :refresh-data-func="expressionChange" @unitChange="chartUnitChange">
             <!-- <template slot="added-text">{{$t('dashboard.metricPreview.runQuery')}}</template> -->
              <template slot="added-text">{{$t('overall.query')}}</template>
            </pick-time>
            <button v-if="showMetrics"
              id="explore-save-chart"
              v-has="'main_add'"
              :class="{'nz-btn-disabled btn-disabled-cursor-not-allowed' : saveDisabled}"
              :disabled="saveDisabled"
              class="top-tool-btn top-tool-btn--text"
              type="button"
              @click="saveChart">
              {{$t('dashboard.metric.saveChart')}}
            </button>
            <button v-else
              id="explore-save-chart-logs"
              v-has="'main_add'"
              :class="{'nz-btn-disabled btn-disabled-cursor-not-allowed' : saveDisabled}"
              :disabled="saveDisabled"
              class="top-tool-btn top-tool-btn--text"
              type="button"
              @click="saveChartLogs">
              {{$t('dashboard.metric.saveChart')}}
            </button>
          </div>
        </div>
        <div id="explore-promql-box" class="top-tools" style="padding-top: 0; flex-wrap: wrap">
          <template v-if="showMetrics">
            <promql-input
              :from-father-data="true"
              :metricOptionsParent="metricOptions"
              v-for="index of promqlKeys.length"
              :id="promqlKeys[index-1].id"
              :pqid="tabIndex.toString()"
              :key="promqlKeys[index-1].id"
              :ref="'promql-'+(index-1)"
              :expression-list="expressions"
              :state="promqlKeys[index-1].state"
              :index="index-1"
              :plugins="['metric-selector', 'metric-input', 'add', 'remove', 'copy','enable']"
              :styleType="1"
              type="metric"
              @enableExpression="enableExpression"
              @addExpression="addExpression"
              @copyExpression="copyExpression"
              @removeExpression="removeExpression"
              @resetExpression="resetExpression"
            ></promql-input>
          </template>
          <template v-else>
            <promql-input
              v-for="index of promqlKeys.length"
              :id="promqlKeys[index-1].id"
              :pqid="tabIndex.toString()"
              :key="promqlKeys[index-1].id"
              :ref="'promql-'+(index-1)"
              :expression-list="expressions"
              :state="promqlKeys[index-1].state"
              :index="index-1"
              :plugins="['metric-selector', 'metric-input', 'add', 'remove', 'copy','enable']"
              :styleType="1"
              type="log"
              @enableExpression="enableExpression"
              @addExpression="addExpression"
              @copyExpression="copyExpression"
              @removeExpression="removeExpression"
              @resetExpression="resetExpression"
            ></promql-input>
          </template>
        </div>
        <div ref="scrollWrap" style="height: auto; padding: 0 20px 4px;">
          <el-collapse v-show="!showIntroduce" v-model="collapseValue" class="explore-collapse" @change="logsCollapseChange">
            <!--metric-->
            <template v-if="showMetrics">
              <el-collapse-item name="1" :title="$t('explore.graph')" class="el-collapse-item__height">
                <div class="chart-room">
                  <chart ref="exploreChart" :unit="chartUnit" :timeRange="filterTime"></chart>
                </div>
              </el-collapse-item>
              <el-collapse-item class="el-collapse-item__height" name="2" title="Table">
                <div slot="title" class="explore-table-title">
                  {{$t('dashboard.panel.chartForm.typeVal.table.label')}}
                  <i
                    class="nz-icon-gear nz-icon"
                    style="position: absolute;right: 10px;top: 8px"
                    @click.stop="tools.showCustomTableTitle = true"
                    :title="$t('overall.selectColumns')"
                  ></i>
                  <!-- 自定义table列 -->
                  <transition name="el-zoom-in-top">
                    <element-set
                      @click.stop
                      v-if="tools.showCustomTableTitle"
                      :tableId="tableId"
                      ref="customTableTitle"
                      :custom-table-title="tools.customTableTitle"
                      :original-table-title="tableTitle"
                      :operation-true="true"
                      @close="tools.showCustomTableTitle = false"
                      @update="updateCustomTableTitle"
                    ></element-set>
                  </transition>
                </div>
                <!-- 自定义table列 -->
                <div class="nz-table-list explore-table">
                  <el-table ref="exploreTable"
                    v-my-loading="tools.loading"
                    class="metric-table"
                    :data="tableData"
                    border
                    :header-cell-class-name="({ column }) => column.property === 'gear' ? 'explore-table-gear' : ''"
                    tooltip-effect="light">
                    <el-table-column
                      v-for="(item, index) in tools.customTableTitle"
                      v-if="item.show"
                      :key="`col-${index}`"
                      :label="item.label"
                      :prop="item.prop"
                      :resizable="false"
                      min-width="110px"
                      show-overflow-tooltip
                    >
                      <template slot-scope="scope" :column="item">
                        <template v-if="item.prop === 'time'">{{timeFormate(scope.row.time)}}</template>
                        <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
                        <template v-else>-</template>
                      </template>
                    </el-table-column>
                    <template slot="empty">
                      <div v-if="!tools.loading" class="table-no-data">
                        <svg class="icon" aria-hidden="true">
                          <use xlink:href="#nz-icon-no-data-list"></use>
                        </svg>
                        <div class="table-no-data__title">No results found</div>
                      </div>
                      <div v-else>&nbsp;</div>
                    </template>
                  </el-table>
                </div>
                <pagination ref="Pagination" :page-obj="pageObj" @pageNo='pageNo'
                            @pageSize='pageSize'></pagination>
              </el-collapse-item>
            </template>
            <!--log-->
            <template v-else>
              <el-collapse-item v-if="showTab.indexOf('1') > -1" name="1" :title="$t('explore.graph')" class="el-collapse-item__height">
                <div class="chart-room">
                  <chart ref="logChart" :unit="chartUnit" v-my-loading="chartLoading" :timeRange="filterTime"></chart>
                </div>
              </el-collapse-item>
              <el-collapse-item v-if="showTab.indexOf('2') > -1" name="2" title="Logs">
                <log-tab ref="logDetail" :timeRange="filterTime" :log-data="logData" :explore-log-table="logTabNoData" :explore-item="true" :tab-index="tabIndex" @exportLog="exportLog" @limitChange="queryLogData" v-my-loading="chartLoading"></log-tab>
              </el-collapse-item>
            </template>
          </el-collapse>
          <div v-if="showMetrics" v-show="showIntroduce" class="introduce-view">
            <div class="info-room">
              <div class="col-md-9 doc-content">
                <h1 class="page-header">Query examples<a class="header-anchor" href="https://prometheus.io/docs/prometheus/latest/querying/examples/" rel="noopener noreferrer" target="_blank"><i class="nz-icon nz-icon-link1" style="font-size: 16px;" :title="$t('overall.link')"></i></a></h1>
                <div class="content-divider"></div>
                <h2 >
                  Simple time series selection
                </h2>

                <p>Return all time series with the metric <code>http_requests_total</code>:</p>

                <pre><code>http_requests_total</code></pre>

                <p>Return all time series with the metric <code>http_requests_total</code> and the given<code>job</code> and <code>handler</code> labels:</p>

                <pre><code>http_requests_total{job="apiserver", handler="/api/comments"}</code></pre>

                <p>Return a whole range of time (in this case 5 minutes) for the same vector,
                  making it a range vector:</p>

                <pre><code>http_requests_total{job="apiserver", handler="/api/comments"}[5m]</code></pre>

                <p>Note that an expression resulting in a range vector cannot be graphed directly,
                  but viewed in the tabular ("Console") view of the expression browser.</p>

                <p>Using regular expressions, you could select time series only for jobs whose
                  name match a certain pattern, in this case, all jobs that end with <code>server</code>:</p>

                <pre><code>http_requests_total{job=~".*server"}</code></pre>

                <p>All regular expressions in Prometheus use RE2 syntax.</p>

                <p>To select all HTTP status codes except 4xx ones, you could run:</p>

                <pre><code>http_requests_total{status!~"4.."}</code></pre>

                <h2 >
                  Subquery
                </h2>

                <p>Return the 5-minute rate of the <code>http_requests_total</code> metric for the past 30 minutes, with a resolution of 1 minute.</p>

                <pre><code>rate(http_requests_total[5m])[30m:1m]</code></pre>

                <p>This is an example of a nested subquery. The subquery for the <code>deriv</code> function uses the default resolution. Note that using subqueries unnecessarily is unwise.</p>

                <pre><code>max_over_time(deriv(rate(distance_covered_total[5s])[30s:5s])[10m:])</code></pre>

                <h2 >
                  Using functions, operators, etc.
                </h2>

                <p>Return the per-second rate for all time series with the <code>http_requests_total</code>
                  metric name, as measured over the last 5 minutes:</p>

                <pre><code>rate(http_requests_total[5m])</code></pre>

                <p>Assuming that the <code>http_requests_total</code> time series all have the labels <code>job</code>
                  (fanout by job name) and <code>instance</code> (fanout by instance of the job), we might
                  want to sum over the rate of all instances, so we get fewer output time series,
                  but still preserve the <code>job</code> dimension:</p>

                <pre><code>sum by (job) (rate(http_requests_total[5m]))</code></pre>

                <p>If we have two different metrics with the same dimensional labels, we can apply
                  binary operators to them and elements on both sides with the same label set
                  will get matched and propagated to the output. For example, this expression
                  returns the unused memory in MiB for every instance (on a fictional cluster
                  scheduler exposing these metrics about the instances it runs):</p>

                <pre><code>(instance_memory_limit_bytes - instance_memory_usage_bytes) / 1024 / 1024</code></pre>

                <p>The same expression, but summed by application, could be written like this:</p>

                <pre><code>sum by (app, proc) (instance_memory_limit_bytes - instance_memory_usage_bytes) / 1024 / 1024</code></pre>

                <p>If the same fictional cluster scheduler exposed CPU usage metrics like the following for every instance:</p>

                <pre><code>instance_cpu_time_ns{app="lion", proc="web", rev="34d0f99", env="prod", job="cluster-manager"}
instance_cpu_time_ns{app="elephant", proc="worker", rev="34d0f99", env="prod", job="cluster-manager"}
instance_cpu_time_ns{app="turtle", proc="api", rev="4d3a513", env="prod", job="cluster-manager"}
instance_cpu_time_ns{app="fox", proc="widget", rev="4d3a513", env="prod", job="cluster-manager"}
...
</code></pre>

                <p>...we could get the top 3 CPU users grouped by application (<code>app</code>) and process type (<code>proc</code>) like this:</p>

                <pre><code>topk(3, sum by (app, proc) (rate(instance_cpu_time_ns[5m])))</code></pre>

                <p>Assuming this metric contains one time series per running instance, you could count the number of running instances per application like this:</p>

                <pre><code>count by (app) (instance_cpu_time_ns)</code></pre>

              </div>
            </div>
          </div>
          <div v-else v-show="showIntroduce" class="introduce-view">
            <div class="info-room title-heard">
              <div class="col-md-9 logs-content">
                <!-- LogQL: Log query language -->
                <h1 class="page-header" style="margin-Top:0px">LogQL: Log query language<a class="header-anchor" href="https://grafana.com/docs/loki/latest/logql/" rel="noopener noreferrer" target="_blank"><i class="nz-icon nz-icon-link1" style="font-size: 16px;" :title="$t('overall.link')"></i></a></h1>
                <div class="title-heard__divider"></div>
                <div class="page-header-label">
                    <p>LogQL is Grafana Loki’s PromQL-inspired query language. Queries act as if they are a distributed grep to aggregate log sources. LogQL uses labels and operators for filtering.</p>
                    <p>There are two types of LogQL queries:</p>
                    <ul>
                     <li><b style="color: #3C92F1" @click="jumpClick('#log-queries')">Log queries </b>return the contents of log lines.</li>
                     <li><b style="color: #3C92F1" @click="jumpClick('#metric-queries')">Metric queries </b>extend log queries to calculate values based on query results.</li>
                    </ul>
                </div>

                <!-- Log queries -->
                <!-- start -->
                <div class="introduce-view__content">
                  <h1 class="page-header" id="log-queries">Log queries</h1>
                  <p>All LogQL queries contain a <b>log stream selector.</b></p>
                  <div class="img-hidden"><img src="https://grafana.com/docs/loki/latest/logql/query_components.png" alt=""></div>
                  <p>Optionally, the log stream selector can be followed by <b>a log pipeline</b>. A log pipeline is a set of stage expressions that are chained together and applied to the selected log streams. Each expression can filter out, parse, or mutate log lines and their respective labels.</p>
                  <p>The following example shows a full log query in action:</p>
                  <p><code class="fillbox">{container="query-frontend",namespace="loki-dev"} |= "metrics.go" | logfmt | duration > 10s and throughput_mb < 500</code></p>
                  <p>The query is composed of:</p>
                  <ul>
                    <li>a log stream selector <code>{container="query-frontend",namespace="loki-dev"}</code> which targets the <code>query-frontend</code> container in the <code>loki-dev</code> namespace.</li>
                    <li>a log pipeline <code>|= "metrics.go" | logfmt | duration > 10s and throughput_mb < 500</code> which will filter out log that contains the word <code>metrics.go</code>, then parses each log line to extract more labels and filter with them.</li>
                  </ul>
                  <pre>To avoid escaping special characters you can use the <code>`</code>(backtick) instead of<code> " </code>when quoting strings. For example <code>`\w+`</code> is the same as <code>"\\w+"</code>. This is specially useful when writing a regular expression which contains multiple <br/>backslashes that require escaping.</pre>
                </div>
                <!-- Log stream selector -->
                <div class="introduce-view__content">
                  <h2 id="log-stream-selector">Log stream selector</h2>
                  <div class="introduce-view__content-label">
                    <p>The stream selector determines which log streams to include in a query’s results. A log stream is a unique source of log content, such as a file. A more granular log stream selector then reduces the number of searched streams to a manageable volume. This means that the labels passed to the log stream selector will affect the relative performance of the query’s execution.</p>
                    <p>The log stream selector is specified by one or more comma-separated key-value pairs. Each key is a log label and each value is that label’s value. Curly braces (<code>{</code> and <code>}</code>) delimit the stream selector.</p>
                    <p>Consider this stream selector:</p>
                    <p><code class="fillbox">{app="mysql",name="mysql-backup"}</code></p>
                    <p>All log streams that have both a label of <code>app</code> whose value is <code>mysql</code> and a label of <code>name</code> whose value is <code>mysql-backup</code> will be included in the query results. A stream may contain other pairs of labels and values, but only the specified pairs within the stream selector are used to determine which streams will be included within the query results.</p>
                    <p>The same rules that apply for Prometheus Label Selectors apply for Grafana Loki log stream selectors.</p>
                    <p>The <code>=</code> operator after the label name is a <b>label matching operator</b>. The following label matching operators are supported:</p>
                    <ul>
                      <li><code>=</code>: exactly equal</li>
                      <li><code>!=</code>: not equal</li>
                      <li><code>=~</code>: regex matches</li>
                      <li><code>!~</code>: regex does not match</li>
                    </ul>
                    <p>Regex log stream examples:</p>
                    <ul>
                      <li><code>{name =~ "mysql.+"}</code></li>
                      <li><code>{name !~ "mysql.+"}</code></li>
                      <li><code>{name !~ `mysql-\d+`}</code></li>
                    </ul>
                    <p><b>Note:</b> The <code>=~</code> regex operator is fully anchored, meaning regex must match against the entire string, including newlines. The regex <code>.</code> character does not match newlines by default. If you want the regex dot character to match newlines you can use the single-line flag, like so: <code>(?s)search_term.+</code> matches <code>search_term\n.</code></p>
                  </div>
                </div>
                <!-- Log pipeline -->
                <div class="introduce-view__content">
                  <h2>Log pipeline</h2>
                  <div class="introduce-view__content-label">
                    <p>A log pipeline can be appended to a log stream selector to further process and filter log streams. It is composed of a set of expressions. Each expression is executed in left to right sequence for each log line. If an expression filters out a log line, the pipeline will stop processing the current log line and start processing the next log line.</p>
                    <p>Some expressions can mutate the log content and respective labels, which will be then be available for further filtering and processing in subsequent expressions. An example that mutates is the expression</p>
                    <p><code v-pre class="fillbox">| line_format "{{.status_code}}"</code></p>
                    <p>Log pipeline expressions fall into one of three categories:</p>
                    <ul>
                      <li>Filtering expressions: <b style="color: #3C92F1" @click="jumpClick('#line-filter-expressions')">line filter expressions</b> and <b style="color: #3C92F1" @click="jumpClick('#label-filter-expressions')">label filter expressions</b></li>
                      <li><b style="color: #3C92F1" @click="jumpClick('#parsing-expressions')">Parsing expressions</b></li>
                      <li>Formatting expressions: <b style="color: #3C92F1" @click="jumpClick('#line-format-expressions')">line format expressions</b> and <b style="color: #3C92F1" @click="jumpClick('#label-format-expressions')">label format expressions</b></li>
                    </ul>
                  </div>
                </div>
                <!-- Line filter expression -->
                <div class="introduce-view__content">
                  <h2 id="line-filter-expressions">Line filter expression</h2>
                  <div class="introduce-view__content-label">
                    <p>The line filter expression does a distributed <code>grep</code> over the aggregated logs from the matching log streams. It searches the contents of the log line, discarding those lines that do not match the case sensitive expression.</p>
                    <p>Each line filter expression has a <b>filter operator</b> followed by text or a regular expression. These filter operators are supported:</p>
                    <ul>
                      <li><code>|=</code>: Log line contains string</li>
                      <li><code>!=</code>: Log line does not contain string</li>
                      <li><code>|~</code>: Log line contains a match to the regular expression</li>
                      <li><code>!~</code>: Log line does not contain a match to the regular expression</li>
                    </ul>
                    <p>Line filter expression examples:</p>
                    <ul>
                      <li>
                        <p>Keep log lines that have the substring “error”:</p>
                        <p><code class="fillbox">|= "error"</code></p>
                        <p>A complete query using this example:</p>
                        <p><code class="fillbox">{job="mysql"} |= "error"</code></p>
                      </li>
                      <li>
                        <p>Discard log lines that have the substring “kafka.server:type=ReplicaManager”:</p>
                        <p><code class="fillbox">!= "kafka.server:type=ReplicaManager"</code></p>
                        <p>A complete query using this example:</p>
                        <p><code class="fillbox">{instance=~"kafka-[23]",name="kafka"} != "kafka.server:type=ReplicaManager"</code></p>
                      </li>
                      <li>
                        <p>Keep log lines that contain a substring that starts with tsdb-ops and ends with io:2003. A complete query with a regular expression:</p>
                        <p><code class="fillbox">{name="kafka"} |~ "tsdb-ops.*io:2003"</code></p>
                      </li>
                      <li>
                        <p>Keep log lines that contain a substring that starts with error=, and is followed by 1 or more word characters. A complete query with a regular expression:</p>
                        <p><code class="fillbox">{name="cassandra"} |~  `error=\w+`</code></p>
                      </li>
                    </ul>
                    <p>Filter operators can be chained. Filters are applied sequentially. Query results will have satisfied every filter. This complete query example will give results that include the string <code>error</code>, and do not include the string <code>timeout</code>.</p>
                    <p><code class="fillbox">{job="mysql"} |= "error" != "timeout"</code></p>
                    <p>When using <code>|~</code> and <code>!~</code>, Go (as in Golang) RE2 syntax regex may be used. The matching is case-sensitive by default. Switch to case-insensitive matching by prefixing the regular expression with <code>(?i)</code>.</p>
                    <p>While line filter expressions could be placed anywhere within a log pipeline, it is almost always better to have them at the beginning. Placing them at the beginning improves the performance of the query, as it only does further processing when a line matches. For example, while the results will be the same, the query specified with</p>
                    <p><code class="fillbox" v-pre>{job="mysql"} |= "error" | json | line_format "{{.err}}"</code></p>
                    <p>will always run faster than</p>
                    <p><code class="fillbox" v-pre>{job="mysql"} | json | line_format "{{.message}}" |= "error"</code></p>
                    <p>Line filter expressions are the fastest way to filter logs once the log stream selectors have been applied.</p>
                    <p>Line filter expressions have support matching IP addresses. See Matching IP addresses for details.</p>
                  </div>
                </div>
                <!-- Label filter expression -->
                <div class="introduce-view__content">
                  <h2 id="label-filter-expressions">Label filter expression</h2>
                  <div class="introduce-view__content-label">
                    <p>Label filter expression allows filtering log line using their original and extracted labels. It can contain multiple predicates.</p>
                    <p>A predicate contains a <b>label identifier</b>, an <b>operation</b> and a <b>value</b> to compare the label with.</p>
                    <p>For example with <code>cluster="namespace"</code>the cluster is the label identifier, the operation is <code>=</code> and the value is “namespace”. The label identifier is always on the right side of the operation.</p>
                    <p>We support multiple <b>value</b> types which are automatically inferred from the query input.</p>
                    <ul>
                      <li><b>String </b>is double quoted or backticked such as <code>"200"</code> or `<code>us-central1</code>`.</li>
                      <li>Duration is a sequence of decimal numbers, each with optional fraction and a unit suffix, such as “300ms”, “1.5h” or “2h45m”. Valid time units are “ns”, “us” (or “µs”), “ms”, “s”, “m”, “h”.</li>
                      <li><b>Number </b>are floating-point number (64bits), such as <code>250</code>, <code>89.923</code>.</li>
                      <li><b>Bytes </b>is a sequence of decimal numbers, each with optional fraction and a unit suffix, such as “42MB”, “1.5Kib” or “20b”. Valid bytes units are “b”, “kib”, “kb”, “mib”, “mb”, “gib”, “gb”, “tib”, “tb”, “pib”, “pb”, “eib”, “eb”.</li>
                    </ul>
                    <p>String type work exactly like Prometheus label matchers use in <b style="color: #3C92F1" @click="jumpClick('#log-stream-selector')">log stream selector</b>. This means you can use the same operations (<code>=</code>,<code>!=</code>,<code>=~</code>,<code>!~</code>).</p>
                    <pre>The string type is the only one that can filter out a log line with a label <code>__error__</code>.</pre>
                    <p>Using Duration, Number and Bytes will convert the label value prior to comparision and support the following comparators:</p>
                    <ul>
                      <li><code>==</code> or <code>=</code> for equality.</li>
                      <li><code>!=</code> for inequality.</li>
                      <li><code>></code> and <code>>=</code> for greater than and greater than or equal.</li>
                      <li><code>&lt;</code> and <code>&lt;=</code> for lesser than and lesser than or equal.</li>
                    </ul>
                    <p>For instance, <code>logfmt | duration > 1m and bytes_consumed > 20MB</code></p>
                    <p>If the conversion of the label value fails, the log line is not filtered and an <code>__error__</code> label is added. To filters those errors see the pipeline errors section.</p>
                    <p>You can chain multiple predicates using <code>and</code> and <code>or</code> which respectively express the <code>and</code> and <code>or</code> binary operations. <code>and</code> can be equivalently expressed by a comma, a space or another pipe. Label filters can be place anywhere in a log pipeline.</p>
                    <p>This means that all the following expressions are equivalent:</p>
                    <p><code class="fillbox">
                             | duration >= 20ms or size == 20kb and method!~"2.."<br/>
                             | duration >= 20ms or size == 20kb | method!~"2.."<br/>
                             | duration >= 20ms or size == 20kb , method!~"2.."<br/>
                             | duration >= 20ms or size == 20kb  method!~"2.."
                    </code></p>
                    <p>By default the precedence of multiple predicates is right to left. You can wrap predicates with parenthesis to force a different precedence left to right.</p>
                    <p>For example the following are equivalent.</p>
                    <p><code class="fillbox">
                      | duration >= 20ms or method="GET" and size &lt;= 20KB<br/>
                      | ((duration >= 20ms or method="GET") and size &lt;= 20KB)
                      </code></p>
                      <p>It will evaluate first <code>duration >= 20ms or method="GET"</code>. To evaluate first <code>method="GET" and size &lt;= 20KB</code>, make sure to use proper parenthesis as shown below.</p>
                      <p><code class="fillbox">| duration >= 20ms or (method="GET" and size &lt;= 20KB)</code></p>
                      <pre>Label filter expressions are the only expression allowed after the unwrap expression. This is mainly to allow filtering errors from the metric extraction.</pre>
                      <p>Label filter expressions have support matching IP addresses. See Matching IP addresses for details.</p>
                  </div>
                </div>
                <!-- Parser expression -->
                <div class="introduce-view__content">
                  <h2 id="parsing-expressions">Parser expression</h2>
                  <div class="introduce-view__content-label">
                    <p>Parser expression can parse and extract labels from the log content. Those extracted labels can then be used for filtering using <b style="color: #3C92F1" @click="jumpClick('#label-filter-expressions')">label filter expressions</b> or for <b style="color: #3C92F1" @click="jumpClick('#metric-queries')">metric aggregations</b>.</p>
                    <p>Extracted label keys are automatically sanitized by all parsers, to follow Prometheus metric name convention.(They can only contain ASCII letters and digits, as well as underscores and colons. They cannot start with a digit.)</p>
                    <p>For instance, the pipeline <code>| json</code> will produce the following mapping:</p>
                    <p><code class="fillbox">{ "a.b": {c: "d"}, e: "f" }</code></p>
                    <p>-></p>
                    <p><code class="fillbox">{a_b_c="d", e="f"}</code></p>
                    <p>In case of errors, for instance if the line is not in the expected format, the log line won’t be filtered but instead will get a new <code>__error__</code> label added.</p>
                    <p>If an extracted label key name already exists in the original log stream, the extracted label key will be suffixed with the <code>_extracted</code> keyword to make the distinction between the two labels. You can forcefully override the original label using a <b style="color: #3C92F1" @click="jumpClick('#label-format-expressions')">label formatter expression</b>. However if an extracted key appears twice, only the latest label value will be kept.</p>
                    <p>Loki supports <b style="color: #3C92F1" @click="jumpClick('#JSON')">JSON</b>, <b style="color: #3C92F1" @click="jumpClick('#logfmt')">logfmt</b>, <b style="color: #3C92F1" @click="jumpClick('#pattern')">pattern</b>, <b style="color: #3C92F1"  @click="jumpClick('#regexp')">regexp</b> and <b style="color: #3C92F1" @click="jumpClick('#unpack')">unpack</b> parsers.</p>
                    <p>It’s easier to use the predefined parsers <code>json</code> and <code>logfmt</code> when you can. If you can’t, the <code>pattern</code> and <code>regexp</code> parsers can be used for log lines with an unusual structure. The <code>pattern</code> parser is easier and faster to write; it also outperforms the <code>regexp</code> parser. Multiple parsers can be used by a single log pipeline. This is useful for parsing complex logs. There are examples in <b style="color: #3C92F1" @click="jumpClick('#multiple-parsers')">Multiple parsers</b>.</p>
                  </div>
                </div>
                <!-- JSON -->
                <div class="introduce-view__content">
                <h2 id="JSON">JSON</h2>
                <div class="introduce-view__content-label">
                  <p>The <b>json</b> parser operates in two modes:</p>
                  <p>1. <b>without</b> parameters:</p>
                  <div class="json-module">
                    <p>Adding <code>| json</code> to your pipeline will extract all json properties as labels if the log line is a valid json document. Nested properties are flattened into label keys using the <code>_</code> separator.</p>
                    <p>Note: <b>Arrays are skipped</b>.</p>
                    <p>For example the json parsers will extract from the following document:</p>
                    <pre>{
    "protocol": "HTTP/2.0",
    "servers": ["129.0.1.1","10.2.1.3"],
    "request": {
        "time": "6.032",
        "method": "GET",
        "host": "foo.grafana.net",
        "size": "55",
        "headers": {
          "Accept": "*/*",
          "User-Agent": "curl/7.68.0"
        }
    },
    "response": {
        "status": 401,
        "size": "228",
        "latency_seconds": "6.031"
    }
}</pre>
           <p>The following list of labels:</p>
           <pre>"protocol" => "HTTP/2.0"
"request_time" => "6.032"
"request_method" => "GET"
"request_host" => "foo.grafana.net"
"request_size" => "55"
"response_status" => "401"
"response_size" => "228"
"response_latency_seconds" => "6.031"</pre>
                  </div>
                  <p>2. <b>with </b>parameters:</p>
                  <div class="json-module">
                    <p>Using <code>| json label="expression", another="expression"</code> in your pipeline will extract only the specified json fields to labels. You can specify one or more expressions in this way, the same as <code>label_format</code>; all expressions must be quoted.</p>
                    <p>Currently, we only support field access (<code>my.field</code>, <code>my["field"]</code>) and array access (<code>list[0]</code>), and any combination of these in any level of nesting (<code>my.list[0]["field"]</code>).</p>
                    <p>For example, <code>| json first_server="servers[0]", ua="request.headers[\"User-Agent\"]</code> will extract from the following document:</p>
                    <pre>{
    "protocol": "HTTP/2.0",
    "servers": ["129.0.1.1","10.2.1.3"],
    "request": {
        "time": "6.032",
        "method": "GET",
        "host": "foo.grafana.net",
        "size": "55",
        "headers": {
          "Accept": "*/*",
          "User-Agent": "curl/7.68.0"
        }
    },
    "response": {
        "status": 401,
        "size": "228",
        "latency_seconds": "6.031"
    }
}
                    </pre>
                    <p>The following list of labels:</p>
                    <pre>"first_server" => "129.0.1.1"
"ua" => "curl/7.68.0"</pre>
                    <p>If an array or an object returned by an expression, it will be assigned to the label in json format.</p>
                    <p>For example, <code>| json server_list="servers", headers="request.headers"</code> will extract:</p>
                    <pre>"server_list" => `["129.0.1.1","10.2.1.3"]`
"headers" => `{"Accept": "*/*", "User-Agent": "curl/7.68.0"}`</pre>
                    <p>If the label to be extracted is same as the original JSON field, expression can be written as just <code>| json &lt;label&gt;</code></p>
                    <p>For example, to extract <code>servers</code> fields as label, expression can be written as following</p>
                    <p><code>| json servers</code> will extract:</p>
                    <pre>"servers" => `["129.0.1.1","10.2.1.3"]`</pre>
                    <p>Note that <code>| json servers</code> is same as <code>| json servers="servers"</code></p>
                  </div>
                </div>
              </div>
              <!-- logfmt -->
              <div class="introduce-view__content">
                <h2 id="logfmt">logfmt</h2>
                <div class="introduce-view__content-label logfmt-module">
                  <p>The <b>logfmt</b> parser can be added using the <code>| logfmt</code> and will extract all keys and values from the logfmt formatted log line.</p>
                  <p>For example the following log line:</p>
                  <pre>at=info method=GET path=/ host=grafana.net fwd="124.133.124.161" service=8ms status=200</pre>
                  <p>will get those labels extracted:</p>
                  <pre>"at" => "info"
"method" => "GET"
"path" => "/"
"host" => "grafana.net"
"fwd" => "124.133.124.161"
"service" => "8ms"
"status" => "200"</pre>
                </div>
              </div>
              <!-- Pattern -->
              <div class="introduce-view__content">
                <h2 id="pattern">Pattern</h2>
                <div class="introduce-view__content-label pattern-module">
                  <p>The pattern parser allows the explicit extraction of fields from log lines by defining a pattern expression (<code>| pattern "&lt;pattern-expression&gt;"</code>). The expression matches the structure of a log line.</p>
                  <p>Consider this NGINX log line.</p>
                  <p><code class="fillbox">0.191.12.2 - - [10/Jun/2021:09:14:29 +0000] "GET /api/plugins/versioncheck HTTP/1.1" 200 2 "-" "Go-http-client/2.0" "13.76.247.102, 34.120.177.193" "TLSv1.2" "US" ""
</code></p>
                  <p>This log line can be parsed with the expression</p>
                  <p><code>&lt;ip&gt; - - &lt;_&gt; "&lt;method&gt; &lt;uri&gt; &lt;_&gt;" &lt;status&gt; &lt;size&gt; &lt;_&gt; "&lt;agent&gt;" &lt;_&gt;</code></p>
                  <p>to extract these fields:</p>
                  <pre>"ip" => "0.191.12.2"
"method" => "GET"
"uri" => "/api/plugins/versioncheck"
"status" => "200"
"size" => "2"
"agent" => "Go-http-client/2.0"</pre>
                  <p>A pattern expression is composed of captures and literals.</p>
                  <p>A capture is a field name delimited by the <code>&lt;</code> and <code>&gt;</code> characters. <code>&lt;example&gt;</code> defines the field name <code>example</code>. An unnamed capture appears as <code>&lt;_&gt;</code>. <br/>The unnamed capture skips matched content.</p>
                  <p>Captures are matched from the line beginning or the previous set of literals, to the line end or the next set of literals. If a capture is not matched, the pattern parser will stop.</p>
                  <p>Literals can be any sequence of UTF-8 characters, including whitespace characters.</p>
                  <p>By default, a pattern expression is anchored at the start of the log line. If the expression starts with literals, then the log line must also start with the same set of literals. Use <code>&lt;_&gt;</code> at the beginning of the expression if you don’t want to anchor the expression at the start.</p>
                  <p>Consider the log line</p>
                  <pre>level=debug ts=2021-06-10T09:24:13.472094048Z caller=logging.go:66 traceID=0568b66ad2d9294c msg="POST /loki/api/v1/push (204) 16.652862ms"</pre>
                  <p>To match <code>msg="</code>, use the expression:</p>
                  <pre>&lt;_&gt; msg="&lt;method&gt; &lt;path&gt; (&lt;status&gt;) &lt;latency&gt;"</pre>
                  <p>A pattern expression is invalid if</p>
                  <ul>
                    <li>It does not contain any named capture.</li>
                    <li>It contains two consecutive captures not separated by whitespace characters.</li>
                    </ul>
                </div>
              </div>
              <!-- Regular expression -->
              <div class="introduce-view__content">
                <h2 id="regexp">Regular expression</h2>
                <div class="introduce-view__content-label regular-module">
                  <p>Unlike the logfmt and json, which extract implicitly all values and takes no parameters, the regexp parser takes a single parameter <code>| regexp "&lt;re&gt;"</code> which is the regular expression using the Golang RE2 syntax.</p>
                  <p>The regular expression must contain a least one named sub-match (e.g <code>(?P&lt;name&gt;re)</code>), each sub-match will extract a different label.</p>
                  <p>For example the parser | regexp "(?P&lt;method&gt;\\w+) (?P&lt;path&gt;[\\w|/]+) \\((?P&lt;status&gt;\\d+?)\\) (?P&lt;duration&gt;.*)" will extract from the following line:</p>
                  <pre>POST /api/prom/api/v1/query_range (200) 1.5s</pre>
                  <p>those labels:</p>
                  <pre>"method" => "POST"
"path" => "/api/prom/api/v1/query_range"
"status" => "200"
"duration" => "1.5s"</pre>
                </div>
              </div>
              <!-- unpack -->
              <div class="introduce-view__content">
                <h2 id="unpack">unpack</h2>
                <div class="introduce-view__content-label unpack-module">
                  <p>The <code>unpack</code> parser parses a JSON log line, unpacking all embedded labels from Promtail’s <code>pack</code> stage. <b>A special property <code>_entry</code> will also be used to replace the original log line</b>.</p>
                  <p>For example, using <code>| unpack</code> with the log line:</p>
                  <pre>{
  "container": "myapp",
  "pod": "pod-3223f",
  "_entry": "original log message"
}</pre>
                  <p>extracts the <code>container</code> and <code>pod</code> labels; it sets <code>original log message</code> as the new log line.</p>
                  <p>You can combine the <code>unpack</code> and <code>json</code> parsers (or any other parsers) if the original embedded log line is of a specific format.</p>
                </div>
              </div>
              <!-- Line format expression -->
              <div class="introduce-view__content">
                <h2 id="line-format-expressions">Line format expression</h2>
                <div class="introduce-view__content-label line-module">
                 <p v-pre>The line format expression can rewrite the log line content by using the text/template format. It takes a single string parameter <code>| line_format "{{.label_name}}"</code>, which is the template format. All labels are injected variables into the template and are available to use with the <code>{{.label_name}}</code> notation.</p>
                 <p>For example the following expression:</p>
                 <pre v-pre>{container="frontend"} | logfmt | line_format "{{.query}} {{.duration}}"</pre>
                 <p>Will extract and rewrite the log line to only contains the query and the duration of a request.</p>
                 <p v-pre>You can use double quoted string for the template or backticks <code>`{{.label_name}}`</code> to avoid the need to escape special characters.</p>
                 <p><code>line_format</code> also supports <code>math</code> functions. Example:</p>
                 <p>If we have the following labels <code>ip=1.1.1.1</code>, <code>status=200</code> and <code>duration=3000(ms)</code>, we can divide the duration by <code>1000</code> to get the value in seconds.</p>
                 <pre v-pre>{container="frontend"} | logfmt | line_format "{{.ip}} {{.status}} {{div .duration 1000}}"</pre>
                 <p>The above query will give us the <code>line</code> as <code>1.1.1.1 200 3</code></p>
                 <p>See template functions to learn about available functions in the template format.</p>
                </div>
              </div>
              <!-- Labels format expression -->
              <div class="introduce-view__content">
                <h2 id="label-format-expressions">Labels format expression</h2>
                <div class="introduce-view__content-label">
                 <p>The <code>| label_format</code> expression can rename, modify or add labels. It takes as parameter a comma separated list of equality operations, enabling multiple operations at once.</p>
                 <p>When both side are label identifiers, for example <code>dst=src</code>, the operation will rename the <code>src</code> label into <code>dst</code>.</p>
                 <p>The right side can alternatively be a template string (double quoted or backtick), for example dst="<code v-pre>{{.status}} {{.query}}</code>", in which case the <code>dst</code> label value is replaced by the result of the text/template evaluation. This is the same template engine as the <code>| line_format</code> expression, which means labels are available as variables and you can use the same list of functions.</p>
                 <p>In both cases, if the destination label doesn’t exist, then a new one is created.</p>
                 <p>The renaming form <code>dst=src</code> will drop the <code>src</code> label after remapping it to the <code>dst</code> label. However, the template form will preserve the referenced labels, such that <code v-pre>dst="{{.src}}"</code> results in both <code>dst</code> and <code>src</code> having the same value.</p>
                 <pre>A single label name can only appear once per expression. This means <code>| label_format foo=bar,foo="new"</code> is not allowed but you can use two expressions for the desired effect: <code>| label_format foo=bar | label_format foo="new"</code></pre>
                </div>
              </div>
              <!-- Log queries examples -->
               <h1 class="page-header">Log queries examples</h1>
               <!-- Multiple filtering -->
              <div class="introduce-view__content">
                <h2>Multiple filtering</h2>
                <div class="introduce-view__content-label">
                  <p>Filtering should be done first using label matchers, then line filters (when possible) and finally using label filters. The following query demonstrate this.</p>
                  <p><code v-pre class="fillbox">{cluster="ops-tools1", namespace="loki-dev", job="loki-dev/query-frontend"} |= "metrics.go" !="out of order" | logfmt | duration > 30s or status_code!="200"</code></p>
                </div>
              </div>
              <!-- Multiple parsers -->
              <div class="introduce-view__content">
                <h2 id="multiple-parsers">Multiple parsers</h2>
                <div class="introduce-view__content-label">
                  <p>To extract the method and the path of the following logfmt log line:</p>
                  <p><code v-pre class="fillbox">level=debug ts=2020-10-02T10:10:42.092268913Z caller=logging.go:66 traceID=a9d4d8a928d8db1 msg="POST /api/prom/api/v1/query_range (200) 1.5s"</code></p>
                  <p>You can use multiple parsers (logfmt and regexp) like this.</p>
                  <p><code v-pre class="fillbox">{job="loki-ops/query-frontend"} | logfmt | line_format "{{.msg}}" | regexp "(?P&lt;method&gt;\\w+) (?P&lt;path&gt;[\\w|/]+) \\((?P&lt;status&gt;\\d+?)\\) (?P&lt;duration&gt;.*)"</code></p>
                  <p>This is possible because the <code>| line_format</code> reformats the log line to become <code>POST /api/prom/api/v1/query_range (200) 1.5s</code> which can then be parsed with the <code>| regexp ...</code> parser.</p>
                </div>
              </div>
              <!-- Formatting -->
              <div class="introduce-view__content">
                <h2>Formatting</h2>
                <div class="introduce-view__content-label formatting-module">
                  <p>The following query shows how you can reformat a log line to make it easier to read on screen.</p>
                  <pre v-pre>{cluster="ops-tools1", name="querier", namespace="loki-dev"}
  |= "metrics.go" != "loki-canary"
  | logfmt
  | query != ""
  | label_format query="{{ Replace .query \"\\n\" \"\" -1 }}"
  | line_format "{{ .ts}}\t{{.duration}}\ttraceID = {{.traceID}}\t{{ printf \"%-100.100s\" .query }} "</pre>
                  <p>Label formatting is used to sanitize the query while the line format reduce the amount of information and creates a tabular output.</p>
                  <p>For these given log lines:</p>
                  <pre class="box-overflow">level=info ts=2020-10-23T20:32:18.094668233Z caller=metrics.go:81 org_id=29 traceID=1980d41501b57b68 latency=fast query="{cluster=\"ops-tools1\", job=\"loki-ops/query-frontend\"} |= \"query_range\"" query_type=filter range_type=range length=15m0s step=7s duration=650.22401ms status=200 throughput_mb=1.529717 total_bytes_mb=0.994659
level=info ts=2020-10-23T20:32:18.068866235Z caller=metrics.go:81 org_id=29 traceID=1980d41501b57b68 latency=fast query="{cluster=\"ops-tools1\", job=\"loki-ops/query-frontend\"} |= \"query_range\"" query_type=filter range_type=range length=15m0s step=7s duration=624.008132ms status=200 throughput_mb=0.693449 total_bytes_mb=0.432718</pre>
                  <p>The result would be:</p>
                  <pre>2020-10-23T20:32:18.094668233Z	650.22401ms	    traceID = 1980d41501b57b68	{cluster="ops-tools1", job="loki-ops/query-frontend"} |= "query_range"
2020-10-23T20:32:18.068866235Z	624.008132ms	traceID = 1980d41501b57b68	{cluster="ops-tools1", job="loki-ops/query-frontend"} |= "query_range"</pre>
                </div>
              </div>

               <!-- Metric queries -->
              <div class="introduce-view__content">
                <h1 class="page-header" id="metric-queries">Multiple parsers</h1>
                <div class="introduce-view__content-label">
                  <p>Metric queries extend log queries by applying a function to log query results. This powerful feature creates metrics from logs.</p>
                  <p>Metric queries can be used to calculate the rate of error messages or the top N log sources with the greatest quantity of logs over the last 3 hours.</p>
                  <p>Combined with parsers, metric queries can also be used to calculate metrics from a sample value within the log line, such as latency or request size. All labels, including extracted ones, will be available for aggregations and generation of new series.</p>
                </div>
              </div>
              <!-- Range Vector aggregation -->
              <div class="introduce-view__content">
                <h1 class="page-header">Range Vector aggregation</h1>
                <div class="introduce-view__content-label">
                  <p>LogQL shares the range vector concept of Prometheus. In Grafana Loki, the selected range of samples is a range of selected log or label values.</p>
                  <p>The aggregation is applied over a time duration. Loki defines Time Durations with the same syntax as Prometheus.</p>
                  <p>Loki supports two types of range vector aggregations: log range aggregations and unwrapped range aggregations.</p>
                </div>
              </div>
              <!-- Log range aggregations -->
              <div class="introduce-view__content">
                <h2>Log range aggregations</h2>
                <div class="introduce-view__content-label">
                  <p>A log range aggregation is a query followed by a duration. A function is applied to aggregate the query over the duration. The duration can be placed after the log stream selector or at end of the log pipeline.</p>
                  <p>The functions:</p>
                  <ul>
                    <li><code> rate(log-range)</code>: calculates the number of entries per second</li>
                    <li><code> count_over_time(log-range)</code>: counts the entries for each log stream within the given range.</li>
                    <li><code> bytes_rate(log-range)</code>: calculates the number of bytes per second for each stream.</li>
                    <li><code> bytes_over_time(log-range)</code>: counts the amount of bytes used by each log stream for a given range.</li>
                    <li><code> absent_over_time(log-range)</code>: returns an empty vector if the range vector passed to it has any elements and a 1-element vector with the value 1 if the range vector passed to it has no elements. (<code>absent_over_time</code> is useful for alerting on when no time series and logs stream exist for label combination for a certain amount of time.)</li>
                  </ul>
                  <p>Examples:</p>
                  <ul>
                    <li>
                      <p>Count all the log lines within the last five minutes for the MySQL job.</p>
                      <p><code class="fillbox">count_over_time({job="mysql"}[5m])</code></p>
                    </li>
                    <li>
                      <p>This aggregation includes filters and parsers. It returns the per-second rate of all non-timeout errors within the last minutes per host for the MySQL job and only includes errors whose duration is above ten seconds.</p>
                      <p><code class="fillbox">sum by (host) (rate({job="mysql"} |= "error" != "timeout" | json | duration > 10s [1m]))</code></p>
                    </li>
                  </ul>
                </div>
              </div>
               <!-- Unwrapped range aggregations -->
              <div class="introduce-view__content">
                <h2>Unwrapped range aggregations</h2>
                <div class="introduce-view__content-label">
                  <p>Unwrapped ranges uses extracted labels as sample values instead of log lines. However to select which label will be used within the aggregation, the log query must end with an unwrap expression and optionally a label filter expression to discard errors.</p>
                  <p>The unwrap expression is noted <code>| unwrap label_identifier</code> where the label identifier is the label name to use for extracting sample values.</p>
                  <p>Since label values are string, by default a conversion into a float (64bits) will be attempted, in case of failure the <code>__error__</code> label is added to the sample. Optionally the label identifier can be wrapped by a conversion function <code>| unwrap &lt;function&gt;(label_identifier)</code>, which will attempt to convert the label value from a specific format.</p>
                  <p>We currently support the functions:</p>
                  <ul>
                    <li><code>duration_seconds(label_identifier)</code> (or its short equivalent <code>duration</code>) which will convert the label value in seconds from the go duration format (e.g <code>5m</code>, <code>24s30ms</code>).</li>
                    <li><code>bytes(label_identifier)</code> which will convert the label value to raw bytes applying the bytes unit (e.g. <code>5 MiB</code>, <code>3k</code>, <code>1G</code>).</li>
                  </ul>
                  <p>Supported function for operating over unwrapped ranges are:</p>
                   <ul>
                    <li><code> rate(unwrapped-range)</code>: calculates per second rate of the sum of all values in the specified interval.</li>
                    <li><code> rate_counter(unwrapped-range)</code>: calculates per second rate of the values in the specified interval and treating them as “counter metric”</li>
                    <li><code> sum_over_time(unwrapped-range)</code>: the sum of all values in the specified interval.</li>
                    <li><code> avg_over_time(unwrapped-range)</code>: the average value of all points in the specified interval.</li>
                    <li><code> max_over_time(unwrapped-range)</code>: the maximum value of all points in the specified interval.</li>
                    <li><code> min_over_time(unwrapped-range)</code>: the minimum value of all points in the specified interval</li>
                    <li><code> first_over_time(unwrapped-range)</code>: the first value of all points in the specified interval</li>
                    <li><code> last_over_time(unwrapped-range)</code>: the last value of all points in the specified interval</li>
                    <li><code> stdvar_over_time(unwrapped-range)</code>: the population standard variance of the values in the specified interval.</li>
                    <li><code> stddev_over_time(unwrapped-range)</code>: the population standard deviation of the values in the specified interval.</li>
                    <li><code> quantile_over_time(scalar,unwrapped-range)</code>: the φ-quantile (0 ≤ φ ≤ 1) of the values in the specified interval.</li>
                    <li><code> absent_over_time(unwrapped-range)</code>: returns an empty vector if the range vector passed to it has any elements and a 1-element vector with the value 1 if the range vector passed to it has no elements. ( <code>absent_over_time</code> is useful for alerting on when no time series and logs stream exist for label combination for a certain amount of time.)</li>
                  </ul>
                  <p>Except for <code>sum_over_time</code>,<code>absent_over_time</code> and <code>rate</code>, unwrapped range aggregations support grouping.</p>
                  <p><code class="fillbox">&lt;aggr-op&gt;([parameter,] &lt;unwrapped-range&gt;) [without|by (&lt;label list&gt;)]</code></p>
                  <p>Which can be used to aggregate over distinct labels dimensions by including a <code>without</code> or <code>by</code> clause.</p>
                  <p><code>without</code> removes the listed labels from the result vector, while all other labels are preserved the output. <code>by</code> does the opposite and drops labels that are not listed in the <code>by</code> clause, even if their label values are identical between all elements of the vector.</p>
                </div>
              </div>
              <!-- Unwrapped examples -->
              <div class="introduce-view__content">
                <h2>Unwrapped examples</h2>
                <div class="introduce-view__content-label unwrapped-module">
                 <pre>quantile_over_time(0.99,
  {cluster="ops-tools1",container="ingress-nginx"}
    | json
    | __error__ = ""
    | unwrap request_time [1m]) by (path)</pre>
                 <p>This example calculates the p99 of the nginx-ingress latency by path.</p>
                 <pre>sum by (org_id) (
  sum_over_time(
  {cluster="ops-tools1",container="loki-dev"}
      |= "metrics.go"
      | logfmt
      | unwrap bytes_processed [1m])
  )</pre>
                 <p>This calculates the amount of bytes processed per organization ID.</p>
                </div>
              </div>
               <!-- Built-in aggregation operators -->
              <div class="introduce-view__content">
                <h1 class="page-header">Built-in aggregation operators</h1>
                <div class="introduce-view__content-label">
                  <p>Like PromQL, LogQL supports a subset of built-in aggregation operators that can be used to aggregate the element of a single vector, resulting in a new vector of fewer elements but with aggregated values:</p>
                  <ul>
                    <li><code> sum</code>: Calculate sum over labels</li>
                    <li><code> avg</code>: Calculate the average over labels</li>
                    <li><code> min</code>: Select minimum over labels</li>
                    <li><code> max</code>: Select maximum over labels</li>
                    <li><code> stddev</code>: Calculate the population standard deviation over labels</li>
                    <li><code> stdvar</code>: Calculate the population standard variance over labels</li>
                    <li><code> count</code>: Count number of elements in the vector</li>
                    <li><code> topk</code>: Select largest k elements by sample value</li>
                    <li><code> bottomk</code>: Select smallest k elements by sample value</li>
                  </ul>
                  <p>The aggregation operators can either be used to aggregate over all label values or a set of distinct label values by including a <code>without</code> or a <code>by</code> clause:</p>
                  <p><code class="fillbox">&lt;aggr-op&gt;([parameter,] &lt;vector expression&gt;) [without|by (&lt;label list&gt;)]</code></p>
                  <p><code>parameter</code> is required when using <code>topk</code> and <code>bottomk</code>. <code>topk</code> and <code>bottomk</code> are different from other aggregators in that a subset of the input samples, including the original labels, are returned in the result vector.</p>
                  <p><code>by</code> and <code>without</code> are only used to group the input vector. The <code>without</code> clause removes the listed labels from the resulting vector, keeping all others. The <code>by</code> clause does the opposite, dropping labels that are not listed in the clause, even if their label values are identical between all elements of the vector.</p>
                </div>
              </div>
               <!-- Vector aggregation examples -->
              <div class="introduce-view__content">
                <h2>Vector aggregation examples</h2>
                <div class="introduce-view__content-label">
                 <p>Get the top 10 applications by the highest log throughput:</p>
                 <p><code class="fillbox">topk(10,sum(rate({region="us-east1"}[5m])) by (name))</code></p>
                 <p>Get the count of log lines for the last five minutes for a specified job, grouping by level:</p>
                 <p><code class="fillbox">sum(count_over_time({job="mysql"}[5m])) by (level)</code></p>
                 <p>Get the rate of HTTP GET requests to the <code>/home</code> endpoint for NGINX logs by region:</p>
                 <p><code class="fillbox">avg(rate(({job="nginx"} |= "GET" | json | path="/home")[10s])) by (region)</code></p>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <transition name="right-box">
      <chartRightBox v-if="rightBox.show" ref="addChartModal" :chart="chartData" :from="$CONSTANTS.fromRoute.explore" :panel-data="panelData" :show-panel="{id: -1, name: '', type: 'explore'}" @close="handleBox(false)" @on-create-success="createSuccess"></chartRightBox>
    </transition>
  </div>
</template>

<script>
import bus from '../../../../libs/bus'
import promqlInput from './promqlInput'
import chart from '../overview/chart'
import axios from 'axios'
import { getUUID } from '../../../common/js/common'
import chartDataFormat from '../../../chart/chartDataFormat'
import logTab from './logTab'
import promqlInputMixin from '@/components/common/mixin/promqlInput'
import chartRightBox from '@/components/common/rightBox/chart/chartRightBox'

export default {
  name: 'exploreItem',
  components: {
    'promql-input': promqlInput,
    chartRightBox,
    chart,
    logTab
  },
  props: {
    tabIndex: Number,
    closable: Boolean
  },
  mixins: [promqlInputMixin],
  data () {
    return {
      chartLoading: false,
      logTabNoData: false,
      rightBox: { // 面板弹出框相关
        show: false
      },
      value: true,
      tabPosition: 'none',
      tableId: 'explore',
      searchMetrics: [
        {
          value: 'Metrics',
          label: this.$t('overall.metric'),
          icon: 'nz-icon nz-icon-Metrics'
        },
        {
          value: 'Logs',
          label: this.$t('dashboard.panel.chartForm.typeVal.log.label'),
          icon: 'nz-icon nz-icon-logs'
        }
      ],
      selectValue: this.$t('overall.metric'),
      selectIcon: 'nz-icon nz-icon-Metrics',
      showMetrics: true,
      promqlCount: 1,
      promqlKeys: [],
      expressions: [''],
      filterTime: [
        bus.timeFormate(bus.getOffsetTimezoneData(-1)),
        bus.timeFormate(bus.getOffsetTimezoneData())
      ],

      /* 工具参数 */
      tools: {
        loading: false, // 是否显示table加载动画
        showCustomTableTitle: false, // 自定义列弹框是否显示
        customTableTitle: [] // 自定义列工具的数据
      },
      tableTitle: [],
      showIntroduce: true,
      defaultChartVisible: true,
      defaultTableVisible: true,
      chartVisible: true,
      tableVisible: true,
      pageObj: {
        pageNo: 1,
        pageSize: this.$CONSTANTS.defaultPageSize,
        total: 0
      },
      tableData: [],
      saveDisabled: true,
      panelData: [],
      chartUnit: 0,
      historyParam: { useHistory: true, key: 'expore-history' },
      chartData: {},
      collapseValue: ['1', '2'],
      showTab: ['1', '2'],
      logData: [],
      letter: [
        'A', 'B', 'C', 'D', 'E', 'F', 'G',
        'H', 'I', 'J', 'K', 'L', 'M', 'N',
        'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z'
      ]
    }
  },
  created () {
    this.getPanelData()
    this.promqlKeys.push({
      id: getUUID(),
      state: 1
    })
    this.selectMetricsLogs()
  },
  methods: {
    jumpClick (id) {
      document.querySelector(id).scrollIntoView(true)
    },
    selectMetricsLogs (val, icon, label) {
      if (val) {
        this.selectIcon = icon
        this.selectValue = val
      } else {
        label = 'Metrics'
      }
      this.changeType(label)
    },
    changeType (value) {
      this.showMetrics = value === 'Metrics'
      this.showIntroduce = true
      this.resetExpression()
    },
    split () {
      this.$emit('split', this.tabIndex)
    },
    pageNo (val) {
      this.pageObj.pageNo = val
      this.tableData = this.filterShowData(this.storedTableData, this.pageObj)
    },
    pageSize (val) {
      this.pageObj.pageSize = val
      this.tableData = this.filterShowData(this.storedTableData, this.pageObj)
    },
    filterShowData (source, pageObj) {
      if (source) return source.slice((pageObj.pageNo - 1) * pageObj.pageSize, pageObj.pageNo * pageObj.pageSize)
    },
    chartUnitChange (unit) {
      this.chartUnit = unit
      this.$nextTick(() => {
        this.expressionChange()
      })
    },
    exportLog ({ limit, descending }) {
      const params = {
        logql: this.expressions,
        start: this.$stringTimeParseToUnix(bus.formateTimeToTime(this.filterTime[0])),
        end: this.$stringTimeParseToUnix(bus.formateTimeToTime(this.filterTime[1])),
        direction: descending ? 'backward' : 'forward',
        limit
      }
      axios.get('/logs/loki/export', { responseType: 'blob', params: params }).then(res => {
        if (window.navigator.msSaveOrOpenBlob) {
          // 兼容ie11
          const blobObject = new Blob([res.data])
          window.navigator.msSaveOrOpenBlob(blobObject, 'log')
        } else {
          const url = URL.createObjectURL(new Blob([res.data]))
          const a = document.createElement('a')
          document.body.appendChild(a) // 此处增加了将创建的添加到body当中
          a.href = url
          a.download = 'log'
          a.target = '_blank'
          a.click()
          a.remove() // 将a标签移除
        }
      }, error => {
        const $self = this
        const reader = new FileReader()
        reader.onload = function (event) {
          const responseText = reader.result
          const exception = JSON.parse(responseText)
          if (exception.message) {
            $self.$message.error(exception.message)
          } else {
            console.error(error)
          }
        }
        reader.readAsText(error.response.data)
      })
    },
    queryLogData (limit) { // log的chart和table是一个请求
      this.chartLoading = true
      if (!limit) {
        limit = this.$refs.logDetail ? this.$refs.logDetail.getLimit() : 100
      }
      this.$refs.logDetail && this.$refs.logDetail.resetOperation()
      if (this.expressions.length > 0) {
        const requestArr = []
        // 过滤掉state为0的元素
        this.expressions.forEach((item, index) => {
          if (item != '' && this.promqlKeys[index].state) {
            requestArr.push(this.$get('/logs/loki/api/v1/query_range?format=1&query=' + encodeURIComponent(item) + '&start=' + this.$stringTimeParseToUnix(bus.formateTimeToTime(this.filterTime[0])) + '&end=' + this.$stringTimeParseToUnix(bus.formateTimeToTime(this.filterTime[1])) + '&limit=' + limit))
          }
        })
        if (requestArr.length > 0) {
          this.showIntroduce = false
          this.saveDisabled = false
        }
        axios.all(requestArr).then(res => {
          this.chartLoading = false
          const errorRowIndex = []
          res.forEach((r, i) => {
            if (typeof r === 'string') {
              errorRowIndex.push(i)
            }
          })
          if (errorRowIndex.length > 0) {
            this.$message.error(this.$t('tip.errorInRow') + ': ' + errorRowIndex.map(e => e + 1).join(' ,'))
            res = res.filter((r, i) => errorRowIndex.indexOf(i) === -1)
          }
          if (res.length > 0) {
            const logData = res.map(r => r.data)
            if (logData[0].result.length > 0) {
              this.logTabNoData = false
            } else {
              this.logTabNoData = true
            }
            const hasGraph = logData.some(d => d.resultType === 'matrix')
            const hasLog = logData.some(d => d.resultType === 'streamsFormat')
            const graphTabIndex = this.showTab.indexOf('1')
            if (hasGraph) {
              if (graphTabIndex === -1) {
                this.showTab.push('1')
              }
            } else {
              if (graphTabIndex > -1) {
                this.showTab.splice(graphTabIndex, 1)
              }
            }
            const logTabIndex = this.showTab.indexOf('2')
            if (hasLog) {
              if (logTabIndex === -1) {
                this.showTab.push('2')
              }
            } else {
              if (logTabIndex > -1) {
                this.showTab.splice(logTabIndex, 1)
              }
            }
            this.$nextTick(() => {
              this.logData = logData
              hasGraph && this.loadLogGraph()
            })
          }
        }).catch(e => {
          this.chartLoading = false
          this.$message.error(this.$t('terminallog.statusItem.unknownError'))
        })
      }
    },
    loadLogGraph () {
      const graphData = this.logData.filter(l => l.resultType === 'matrix')
      if (graphData && graphData.length > 0) {
        this.$refs.logChart.startLoading()
        const promqlInputIndexs = []
        const queryExpression = []
        let series = []
        const legend = []
        this.expressions.forEach((item, index) => {
          if (item !== '') {
            promqlInputIndexs.push(index)
            queryExpression.push(item)
          }
        })
        this.logData.forEach((response, index) => {
          if (response.resultType === 'matrix') {
            const promqlIndex = promqlInputIndexs[index]
            const data = response.result
            if (!data || data.length < 1) {
              return
            }
            data.forEach((result, i) => {
              const seriesItem = {
                name: '',
                symbol: 'emptyCircle', // 去掉点
                symbolSize: [2, 2],
                showSymbol: false,
                smooth: 0.2, // 曲线变平滑
                data: [],
                lineStyle: {
                  width: 1,
                  opacity: 0.9
                },
                type: 'line'
              }
              let legendName = ''
              seriesItem.data = result.values.map((item) => {
                return [item[0] * 1000, item[1]]
              })
              if (result.metric && Object.keys(result.metric).length > 0) {
                const metric = Object.assign({}, result.metric)
                seriesItem.name += metric.__name__ ? metric.__name__ : ''
                seriesItem.name += '{'
                delete metric.__name__
                for (const key in metric) {
                  seriesItem.name += key + '=' + '"' + metric[key] + '",'
                }
                legendName = seriesItem.name.substr(0, seriesItem.name.length - 1)
                legendName += '}'
              } else {
                legendName = queryExpression[index]
              }
              seriesItem.name = legendName + '-' + index
              series.push(seriesItem)
              legend.push({ name: seriesItem.name, alias: legendName, isGray: false })
            })

            this.$refs['promql-' + promqlIndex][0].setError('')
          }
        })
        this.defaultChartVisible = true
        this.$nextTick(() => {
          this.$refs.logChart.setLegend(legend)
          this.$refs.logChart.setRandomColors(series.length)
          if (!series.length) {
            series = ''
          }
          this.$refs.logChart.setSeries(series)
          this.$refs.logChart.endLoading()
        })
      }
    },
    queryChartData () {
      this.$refs.exploreChart.startLoading()
      if (this.expressions.length > 0) {
        const requestArr = []
        const promqlInputIndexs = []
        const queryExpression = []
        // 过滤掉state为0的元素
        this.expressions.forEach((item, index) => {
          if (item != '' && this.promqlKeys[index].state) {
            const step = bus.getStep(bus.formateTimeToTime(this.filterTime[0]), bus.formateTimeToTime(this.filterTime[1]))
            promqlInputIndexs.push(index)
            queryExpression.push(item)
            requestArr.push(this.$get('/prom/api/v1/query_range?query=' + encodeURIComponent(item) + '&start=' + this.$stringTimeParseToUnix(bus.formateTimeToTime(this.filterTime[0])) + '&end=' + this.$stringTimeParseToUnix(bus.formateTimeToTime(this.filterTime[1])) + '&step=' + step + '&nullType=null'))
          }
        })
        if (requestArr.length > 0) {
          this.showIntroduce = false
          this.saveDisabled = false
        }
        axios.all(requestArr).then(res => {
          let series = []
          const legend = []
          if (res.length > 0) {
            res.forEach((response, index) => {
              const promqlIndex = promqlInputIndexs[index]
              if (response.data && response.status == 'success') {
                const data = response.data.result
                if ((!data || data.length < 1) && response.message) {
                  this.$refs['promql-' + promqlIndex][0].setError(response.message)
                  return
                }
                data.forEach((result, i) => {
                  const seriesItem = {
                    name: '',
                    symbol: 'emptyCircle', // 去掉点
                    symbolSize: [2, 2],
                    showSymbol: false,
                    smooth: 0.2, // 曲线变平滑
                    data: [],
                    lineStyle: {
                      width: 1,
                      opacity: 0.9
                    },
                    type: 'line'
                  }
                  let legendName = ''
                  seriesItem.data = result.values.map((item) => {
                    return [item[0] * 1000, item[1]]
                  })
                  if (result.metric && Object.keys(result.metric).length > 0) {
                    const metric = Object.assign({}, result.metric)
                    seriesItem.name += metric.__name__ ? metric.__name__ : ''
                    seriesItem.name += '{'
                    delete metric.__name__
                    for (const key in metric) {
                      seriesItem.name += key + '=' + '"' + metric[key] + '",'
                    }
                    legendName = seriesItem.name.substr(0, seriesItem.name.length - 1)
                    legendName += '}'
                  } else {
                    legendName = queryExpression[index]
                  }
                  seriesItem.name = legendName + '-' + index
                  series.push(seriesItem)
                  legend.push({ name: seriesItem.name, alias: legendName, isGray: false })
                })

                this.$refs['promql-' + promqlIndex][0].setError('')
              } else {
                if (response.error) {
                  this.$refs['promql-' + promqlIndex][0].setError(response.error)
                } else {
                  this.$refs['promql-' + promqlIndex][0].setError(response)
                }
              }
            })

            this.$refs.exploreChart.setLegend(legend)
            this.$refs.exploreChart.setRandomColors(series.length)
            if (!series.length) {
              series = ''
            }
            this.$refs.exploreChart.setSeries(series)
            this.defaultChartVisible = true
          }
          this.$refs.exploreChart.endLoading()
        })
      }
    },
    queryTableData () {
      this.tools.loading = true
      if (this.expressions.length > 0) {
        const requestArr = []
        this.expressions.forEach((item, index) => {
          // 过滤掉state为0的元素
          if (item !== '' && this.promqlKeys[index].state) {
            requestArr.push(this.$get('/prom/api/v1/query?query=' + encodeURIComponent(item)))
          }
        })
        if (requestArr.length > 0) {
          this.showIntroduce = false
        }
        axios.all(requestArr).then(res => {
          const tData = []
          let tLabels = []
          if (res.length > 0) {
            this.tableData = []
            this.tableTitle = []
            res.forEach((response, index) => {
              if (response.data && response.status === 'success') {
                const data = response.data.result
                if (data) {
                  data.forEach((result, i) => {
                    const metrics = Object.assign({}, result.metric)
                    if (!Array.isArray(result.value)) {
                      const val = result
                      result = {
                        value: ['', val]
                      }
                    }
                    this.$set(metrics, 'value#' + index, chartDataFormat.getUnit(this.chartUnit || 2).compute(result.value[1], null, 2))

                    this.$set(metrics, 'time', bus.timeFormate(bus.computeTimezone(result.value[0] * 1000)))
                    for (const key in metrics) {
                      const label = {
                        label: key,
                        prop: key,
                        show: true
                      }
                      const temp = tLabels.find((item, index) => {
                        return item.prop == label.prop
                      })
                      if (!temp) {
                        tLabels.push(label)
                      }
                    }
                    tData.push(metrics)
                  })
                }
              }
              tLabels.sort((a, b) => {
                return a.prop.charCodeAt(0) - b.prop.charCodeAt(0)
              })
              tLabels = tLabels.filter(label => label.prop !== 'time')
              tLabels.unshift({
                label: this.$t('overall.time'),
                prop: 'time',
                show: true
              })
              const filterArr = ['alertname', 'severity_id', 'severity', 'rule_type', 'asset_id', 'endpoint_id', 'project_id', 'datacenter_id', 'module_id', 'nz_agent_id', 'parent_asset_id']
              tLabels.forEach(tLabel => {
                if (filterArr.indexOf(tLabel.prop) !== -1) {
                  tLabel.show = false
                }
              })
            })
            if (tData.length > 0) {
              this.storedTableData = Object.assign([], tData)
              this.pageObj.total = this.storedTableData.length
              this.tableData = this.filterShowData(this.storedTableData, this.pageObj)
              this.tableTitle = Object.assign([], tLabels)
              this.tools.customTableTitle = Object.assign([], tLabels)
              this.defaultTableVisible = true
            } else {
              // this.defaultTableVisible = false;
              this.pageObj.total = 0
              this.pageObj.pageNo = 1
            }
          }
          this.tools.loading = false
        })
      }
    },
    expressionChange () {
      const nowTimeType = this.$refs.pickTime.$refs.timePicker.nowTimeType
      this.pageObj.pageNo = 1
      this.setSearchTime(nowTimeType.type, nowTimeType.value)
      if (this.showMetrics) {
        if (this.expressions && this.expressions.length >= 1) {
          this.queryTableData()
          this.queryChartData()
          this.storeHistory()
        }
      } else {
        if (this.expressions && this.expressions.length >= 1) {
          this.queryLogData()
        }
      }
    },
    setSearchTime (type, val) { // 设置searchTime
      if (type === 'minute') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setMinutes(new Date(bus.computeTimezone(new Date().getTime())).getMinutes() - val))
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())))
        this.$set(this.filterTime, 0, startTime)
        this.$set(this.filterTime, 1, endTime)
        this.$set(this.filterTime, 2, val + 'm')
      } else if (type === 'hour') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setHours(new Date(bus.computeTimezone(new Date().getTime())).getHours() - val))
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())))
        this.$set(this.filterTime, 0, startTime)
        this.$set(this.filterTime, 1, endTime)
        this.$set(this.filterTime, 2, val + 'h')
      } else if (type === 'date') {
        const startTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())).setDate(new Date(bus.computeTimezone(new Date().getTime())).getDate() - val))
        const endTime = bus.timeFormate(new Date(bus.computeTimezone(new Date().getTime())))
        this.$set(this.filterTime, 0, startTime)
        this.$set(this.filterTime, 1, endTime)
        this.$set(this.filterTime, 2, val + 'd')
      }
      this.$refs.pickTime.$refs.timePicker.searchTime = this.filterTime
    },
    storeHistory () {
      const expire = 24
      const historyJson = localStorage.getItem(this.historyParam.key)
      // 过滤掉state为0的元素
      const expressions = this.expressions.filter((item, index) => {
        return item && item != '' && this.promqlKeys[index].state
      })
      const username = localStorage.getItem('nz-username')
      if (historyJson && historyJson != 'undefined' && historyJson != '') {
        const historyObj = JSON.parse(historyJson)
        let history = historyObj[username]
        if (history) {
          // 过滤过期表达式
          history = history.filter(item => {
            return item.time + item.expire >= new Date().getTime()
          })
          let repeat = history.filter(item => {
            return expressions.includes(item.insertText)
          })
          const old = history.filter(item => {
            return !expressions.includes(item.insertText)
          })

          const freshExpression = expressions.filter(item => {
            const find = history.find(t => { return t.insertText == item })
            return !find
          })

          repeat = repeat.map(item => {
            item.time = new Date().getTime()
            item.num += 1
            item.documentation = this.$t('dashboard.metricPreview.historyTip', { time: item.num, hour: 24 })
            return item
          })

          const fresh = freshExpression.map(item => {
            return {
              label: item,
              insertText: item,
              documentation: this.$t('dashboard.metricPreview.historyTip', { time: 1, hour: 24 }),
              num: 1,
              time: new Date().getTime(),
              expire: expire * 60 * 60 * 1000
            }
          })

          historyObj[username] = fresh.concat(repeat).concat(old)
        } else {
          const history = expressions.map(item => {
            return {
              label: item,
              insertText: item,
              documentation: this.$t('dashboard.metricPreview.historyTip', { time: 1, hour: 24 }),
              num: 1,
              time: new Date().getTime(),
              expire: expire * 60 * 60 * 1000
            }
          })
          historyObj[username] = history
        }
        localStorage.setItem(this.historyParam.key, JSON.stringify(historyObj))
      } else {
        const history = expressions.map(item => {
          return {
            label: item,
            insertText: item,
            documentation: this.$t('dashboard.metricPreview.historyTip', { time: 1, hour: 24 }),
            num: 1,
            time: new Date().getTime(),
            expire: expire * 60 * 60 * 1000
          }
        })
        if (history && history.length > 0) {
          const stored = {}
          stored[username] = history
          localStorage.setItem(this.historyParam.key, JSON.stringify(stored))
        }
      }
    },
    // 禁用启用表达式
    enableExpression (index) {
      this.promqlKeys[index].state = this.promqlKeys[index].state ? 0 : 1
      const temp = this.expressions.some((item, index) => {
        return item != '' && this.promqlKeys[index].state
      })
      if (!temp) {
        this.showIntroduce = true
      }
      this.expressionChange()
    },
    addExpression (index) {
      this.expressions.splice(index + 1, 0, '')
      this.promqlKeys.splice(index + 1, 0, {
        id: getUUID(),
        state: 1
      })
      this.promqlCount++
    },
    copyExpression (index) {
      this.expressions.push(this.expressions[index])
      this.promqlKeys.push({
        id: getUUID(),
        state: 1
      })
      this.promqlCount++
    },
    removeExpression (index) {
      if (this.promqlCount > 1) {
        this.expressions.splice(index, 1)
        this.promqlKeys.splice(index, 1)
        this.promqlCount--
      }
    },
    resetExpression () {
      this.expressions = ['']
      this.promqlKeys = [{
        id: getUUID(),
        state: 1
      }]
      this.promqlCount = 1
    },
    changeChartVisible () {
      this.chartVisible = !this.chartVisible
    },
    changeTableVisible () {
      this.tableVisible = !this.tableVisible
    },
    handleBox (show) {
      this.rightBox.show = show
    },
    saveChart () {
      const chart = {
        id: '',
        name: '',
        panelName: '',
        type: 'line',
        span: 4,
        datasource: 'metrics',
        height: 4,
        unit: 2,
        param: {
          stack: 0,
          nullType: 'null',
          legend: { placement: 'bottom', values: [], show: true },
          thresholdShow: true,
          thresholds: [{ value: undefined, color: '#eeeeeeff' }]
        },
        elements: [],
        panel: '',
        sync: 0,
        remark: '',
        groupId: -1
      }
      this.expressions.forEach((exp, index) => {
        chart.elements.push({ state: this.promqlKeys[index].state, expression: exp, legend: '', type: 'expert', id: '', name: this.transformNumToLetter(index) })
      })
      this.chartData = chart
      this.rightBox.show = true
    },
    saveChartLogs () {
      const chart = {
        id: '',
        name: '',
        panelName: '',
        span: 4,
        height: 4,
        unit: 2,
        groupId: -1,
        updateBy: 1,
        updateAt: '2022-05-18 07:51:45',
        type: 'log',
        weight: 6,
        param: { limit: 100 },
        pid: null,
        buildIn: 0,
        seq: null,
        x: 0,
        y: 1.93,
        elements: [],
        children: null,
        chartNums: null,
        asset: null,
        varType: null,
        varId: null,
        varName: null,
        datasource: 'logs',
        enable: { thresholds: false, legend: true, valueMapping: false },
        sync: 0,
        remark: ''
      }
      this.expressions.forEach((exp, index) => {
        chart.elements.push({ state: this.promqlKeys[index].state, expression: exp, legend: '', type: 'expert', id: '', name: this.transformNumToLetter(index) })
      })
      this.chartData = chart
      this.rightBox.show = true
    },
    createSuccess (panel) { // 添加chart成功
      this.$confirm(this.$t('dashboard.metric.goPanelTip'), this.$t('tip.saveSuccess'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'success'
      }).then(() => {
        bus.$emit('menu-change', 'panel')
        this.$store.commit('panelShowPanelChange', panel)
        this.$router.push({
          path: '/panel',
          query: {
            t: +new Date()
          }
        })
      })
    },
    getPanelData () { // 获取panel数据
      this.$get('visual/panel?pageNo=1&pageSize=-1').then(response => {
        if (response.code === 200) {
          this.panelData = response.data.list
        }
      })
    },
    jumpTo (data, id) {
      bus.$emit('menu-change', data)
      this.$router.push({
        path: '/' + data,
        query: {
          t: +new Date()
        }
      })
    },
    logsCollapseChange (activeNames, a, b) {
      this.$nextTick(() => {
        if (this.$refs.exploreChart) {
          this.$refs.exploreChart.resize()
        }
        if (this.$refs.logChart) {
          this.$refs.logChart.resize()
        }
        if (this.$refs.logDetail) {
          this.$refs.logDetail.myChart.resize()
        }
      })
    },
    updateCustomTableTitle (custom) {
      this.tools.customTableTitle = custom
      this.$refs.exploreTable.doLayout()
    },
    transformNumToLetter (num) { // 相当于26进制 获取idaddExpression
      const self = this
      let letter = ''
      const loopNum = parseInt(num / 26)
      if (loopNum > 0) {
        letter += this.transformNumToLetter(loopNum - 1)
      }
      letter += self.letter[num % 26]
      return letter
    }
  },
  watch: {
    promqlCount (n, o) {
      this.expressionChange()
    },
    showMetrics (n, o) { // 更换type后，将折叠面板都置为展开状态
      if (n !== o) {
        this.collapseValue = ['1', '2']
      }
    },
    expressions: {
      immediate: true,
      handler (n, o) {
        // if (n.length == 1 && (!n[0] || n[0] == '')) {
        //   this.showIntroduce = true
        // } else if (n.length > 1) {
        //   const temp = n.find((item, index) => {
        //     return item != ''
        //   })
        //   if (!temp) {
        //     this.showIntroduce = true
        //   } else {
        //     // this.showIntroduce = false
        //   }
        // } else {
        //   // this.showIntroduce = false
        // }
        const temp = n.some((item, index) => {
          return item != '' && this.promqlKeys[index].state
        })
        if (!temp) {
          this.showIntroduce = true
        }
      }
    }
  }
}
</script>
