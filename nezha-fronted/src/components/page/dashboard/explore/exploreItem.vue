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
                <h1 class="page-header" style="margin-Top:0px" id="log-query-language">LogQL: Log query language<a class="header-anchor" href="https://grafana.com/docs/loki/latest/logql/" rel="noopener noreferrer" target="_blank"><i class="nz-icon nz-icon-link1" style="font-size: 16px;" :title="$t('overall.link')"></i></a></h1>
                <div class="title-heard__divider"></div>
                <div class="page-header-label">
                    <p style="width:calc(100% - 380px);">LogQL is Grafana Loki’s PromQL-inspired query language. Queries act as if they are a distributed grep to aggregate log sources. LogQL uses labels and operators for filtering.</p>
                    <p>There are two types of LogQL queries:</p>
                    <ul>
                     <li><b style="color: #3C92F1" @click="jumpClick('#log-queries')" class="log-link">Log queries </b>return the contents of log lines.</li>
                     <li><b style="color: #3C92F1" @click="jumpClick('#metric-queries')" class="log-link">Metric queries </b>extend log queries to calculate values based on query results.</li>
                    </ul>
                </div>

                <!-- Log queries -->
                <!-- start -->
                <div class="introduce-view__content">
                  <h1 class="page-header-one" id="log-queries">Log queries</h1>
                  <p>All LogQL queries contain a <b>log stream selector.</b></p>
                  <div class="img-hidden"><img src="data:image/png;base64,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" alt=""></div>
                  <p>Optionally, the log stream selector can be followed by <b>a log pipeline</b>. A log pipeline is a set of stage expressions that are chained together and applied to the selected log streams. Each expression can filter out, parse, or mutate log lines and their respective labels.</p>
                  <p>The following example shows a full log query in action:</p>
                  <p><code class="fillbox">{container="query-frontend",namespace="loki-dev"} |= "metrics.go" | logfmt | duration > 10s and throughput_mb < 500</code></p>
                  <p>The query is composed of:</p>
                  <ul>
                    <li>a log stream selector <code>{container="query-frontend",namespace="loki-dev"}</code> which targets the <code>query-frontend</code> container in the <code>loki-dev</code> namespace.</li>
                    <li>a log pipeline <code>|= "metrics.go" | logfmt | duration > 10s and throughput_mb < 500</code> which will filter out log that contains the word <code>metrics.go</code>, then parses each log line to extract more labels and filter with them.</li>
                  </ul>
                  <pre class="box-overflow">To avoid escaping special characters you can use the <code>`</code>(backtick) instead of<code> " </code>when quoting strings. For example <code>`\w+`</code> is the same as <code>"\\w+"</code>. This is specially useful when writing a regular expression which contains multiple <br/>backslashes that require escaping.</pre>
                </div>
                <!-- Log stream selector -->
                <div class="introduce-view__content">
                  <h1 class="page-header-two" id="log-stream-selector">Log stream selector</h1>
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
                  <h1 class="page-header-two" id="log-pipeline">Log pipeline</h1>
                  <div class="introduce-view__content-label">
                    <p>A log pipeline can be appended to a log stream selector to further process and filter log streams. It is composed of a set of expressions. Each expression is executed in left to right sequence for each log line. If an expression filters out a log line, the pipeline will stop processing the current log line and start processing the next log line.</p>
                    <p>Some expressions can mutate the log content and respective labels, which will be then be available for further filtering and processing in subsequent expressions. An example that mutates is the expression</p>
                    <p><code v-pre class="fillbox">| line_format "{{.status_code}}"</code></p>
                    <p>Log pipeline expressions fall into one of three categories:</p>
                    <ul>
                      <li>Filtering expressions: <b style="color: #3C92F1" @click="jumpClick('#line-filter-expressions')" class="log-link">line filter expressions</b> and <b style="color: #3C92F1" @click="jumpClick('#label-filter-expressions')" class="log-link">label filter expressions</b></li>
                      <li><b style="color: #3C92F1" @click="jumpClick('#parsing-expressions')" class="log-link">Parsing expressions</b></li>
                      <li>Formatting expressions: <b style="color: #3C92F1" @click="jumpClick('#line-format-expressions')" class="log-link">line format expressions</b> and <b style="color: #3C92F1" @click="jumpClick('#label-format-expressions')" class="log-link">label format expressions</b></li>
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
                        <p>Keep log lines that contain a substring that starts with <code>tsdb-ops</code> and ends with <code>io:2003</code>. A complete query with a regular expression:</p>
                        <p><code class="fillbox">{name="kafka"} |~ "tsdb-ops.*io:2003"</code></p>
                      </li>
                      <li>
                        <p>Keep log lines that contain a substring that starts with <code>error=</code>, and is followed by 1 or more word characters. A complete query with a regular expression:</p>
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
                    <p>String type work exactly like Prometheus label matchers use in <b style="color: #3C92F1" @click="jumpClick('#log-stream-selector')" class="log-link">log stream selector</b>. This means you can use the same operations (<code>=</code>,<code>!=</code>,<code>=~</code>,<code>!~</code>).</p>
                    <pre class="box-overflow">The string type is the only one that can filter out a log line with a label <code>__error__</code>.</pre>
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
                      <pre class="box-overflow">Label filter expressions are the only expression allowed after the unwrap expression. This is mainly to allow filtering errors from the metric extraction.</pre>
                      <p>Label filter expressions have support matching IP addresses. See Matching IP addresses for details.</p>
                  </div>
                </div>
                <!-- Parser expression -->
                <div class="introduce-view__content">
                  <h2 id="parsing-expressions">Parser expression</h2>
                  <div class="introduce-view__content-label">
                    <p>Parser expression can parse and extract labels from the log content. Those extracted labels can then be used for filtering using <b style="color: #3C92F1" @click="jumpClick('#label-filter-expressions')" class="log-link">label filter expressions</b> or for <b style="color: #3C92F1" @click="jumpClick('#metric-queries')" class="log-link">metric aggregations</b>.</p>
                    <p>Extracted label keys are automatically sanitized by all parsers, to follow Prometheus metric name convention.(They can only contain ASCII letters and digits, as well as underscores and colons. They cannot start with a digit.)</p>
                    <p>For instance, the pipeline <code>| json</code> will produce the following mapping:</p>
                    <p><code class="fillbox">{ "a.b": {c: "d"}, e: "f" }</code></p>
                    <p>-></p>
                    <p><code class="fillbox">{a_b_c="d", e="f"}</code></p>
                    <p>In case of errors, for instance if the line is not in the expected format, the log line won’t be filtered but instead will get a new <code>__error__</code> label added.</p>
                    <p>If an extracted label key name already exists in the original log stream, the extracted label key will be suffixed with the <code>_extracted</code> keyword to make the distinction between the two labels. You can forcefully override the original label using a <b style="color: #3C92F1" @click="jumpClick('#label-format-expressions')" class="log-link">label formatter expression</b>. However if an extracted key appears twice, only the latest label value will be kept.</p>
                    <p>Loki supports <b style="color: #3C92F1" @click="jumpClick('#JSON')" class="log-link">JSON</b>, <b style="color: #3C92F1" @click="jumpClick('#logfmt')" class="log-link">logfmt</b>, <b style="color: #3C92F1" @click="jumpClick('#pattern')" class="log-link">pattern</b>, <b style="color: #3C92F1"  @click="jumpClick('#regexp')" class="log-link">regexp</b> and <b style="color: #3C92F1" @click="jumpClick('#unpack')" class="log-link">unpack</b> parsers.</p>
                    <p>It’s easier to use the predefined parsers <code>json</code> and <code>logfmt</code> when you can. If you can’t, the <code>pattern</code> and <code>regexp</code> parsers can be used for log lines with an unusual structure. The <code>pattern</code> parser is easier and faster to write; it also outperforms the <code>regexp</code> parser. Multiple parsers can be used by a single log pipeline. This is useful for parsing complex logs. There are examples in <b style="color: #3C92F1" @click="jumpClick('#multiple-parsers')" class="log-link">Multiple parsers</b>.</p>
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
                  <pre class="box-overflow">at=info method=GET path=/ host=grafana.net fwd="124.133.124.161" service=8ms status=200</pre>
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
                  <pre class="box-overflow">level=debug ts=2021-06-10T09:24:13.472094048Z caller=logging.go:66 traceID=0568b66ad2d9294c msg="POST /loki/api/v1/push (204) 16.652862ms"</pre>
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
                 <pre class="box-overflow" v-pre>{container="frontend"} | logfmt | line_format "{{.ip}} {{.status}} {{div .duration 1000}}"</pre>
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
                 <pre class="box-overflow">A single label name can only appear once per expression. This means <code>| label_format foo=bar,foo="new"</code> is not allowed but you can use two expressions for the desired effect: <code>| label_format foo=bar | label_format foo="new"</code></pre>
                </div>
              </div>
              <!-- Log queries examples -->
               <h1 class="page-header-two" id="log-queries-examples">Log queries examples</h1>
               <!-- Multiple filtering -->
              <div class="introduce-view__content">
                <h2 id="multiple-filtering">Multiple filtering</h2>
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
                <h2 id="formatting">Formatting</h2>
                <div class="introduce-view__content-label formatting-module">
                  <p>The following query shows how you can reformat a log line to make it easier to read on screen.</p>
                  <pre class="box-overflow" v-pre>{cluster="ops-tools1", name="querier", namespace="loki-dev"}
  |= "metrics.go" != "loki-canary"
  | logfmt
  | query != ""
  | label_format query="{{ Replace .query &#92;"&#92;&#92;n&#92;" &#92;"&#92;" -1 }}"
  | line_format "{{ .ts}}&#92;t{{.duration}}&#92;ttraceID = {{.traceID}}&#92;t{{ printf &#92;"%-100.100s&#92;" .query }} "</pre>
                  <p>Label formatting is used to sanitize the query while the line format reduce the amount of information and creates a tabular output.</p>
                  <p>For these given log lines:</p>
                  <pre class="box-overflow">level=info ts=2020-10-23T20:32:18.094668233Z caller=metrics.go:81 org_id=29 traceID=1980d41501b57b68 latency=fast query="{cluster=\"ops-tools1\", job=\"loki-ops/query-frontend\"} |= \"query_range\"" query_type=filter range_type=range length=15m0s step=7s duration=650.22401ms status=200 throughput_mb=1.529717 total_bytes_mb=0.994659
level=info ts=2020-10-23T20:32:18.068866235Z caller=metrics.go:81 org_id=29 traceID=1980d41501b57b68 latency=fast query="{cluster=\"ops-tools1\", job=\"loki-ops/query-frontend\"} |= \"query_range\"" query_type=filter range_type=range length=15m0s step=7s duration=624.008132ms status=200 throughput_mb=0.693449 total_bytes_mb=0.432718</pre>
                  <p>The result would be:</p>
                  <pre class="box-overflow">2020-10-23T20:32:18.094668233Z	650.22401ms	    traceID = 1980d41501b57b68	{cluster="ops-tools1", job="loki-ops/query-frontend"} |= "query_range"
2020-10-23T20:32:18.068866235Z	624.008132ms	traceID = 1980d41501b57b68	{cluster="ops-tools1", job="loki-ops/query-frontend"} |= "query_range"</pre>
                </div>
              </div>

               <!-- Metric queries -->
              <div class="introduce-view__content">
                <h1 class="page-header-one" id="metric-queries">Metric queries</h1>
                <div class="introduce-view__content-label">
                  <p>Metric queries extend log queries by applying a function to log query results. This powerful feature creates metrics from logs.</p>
                  <p>Metric queries can be used to calculate the rate of error messages or the top N log sources with the greatest quantity of logs over the last 3 hours.</p>
                  <p>Combined with parsers, metric queries can also be used to calculate metrics from a sample value within the log line, such as latency or request size. All labels, including extracted ones, will be available for aggregations and generation of new series.</p>
                </div>
              </div>
              <!-- Range Vector aggregation -->
              <div class="introduce-view__content">
                <h1 class="page-header-two" id="range-vector-aggregation">Range Vector aggregation</h1>
                <div class="introduce-view__content-label">
                  <p>LogQL shares the range vector concept of Prometheus. In Grafana Loki, the selected range of samples is a range of selected log or label values.</p>
                  <p>The aggregation is applied over a time duration. Loki defines Time Durations with the same syntax as Prometheus.</p>
                  <p>Loki supports two types of range vector aggregations: log range aggregations and unwrapped range aggregations.</p>
                </div>
              </div>
              <!-- Log range aggregations -->
              <div class="introduce-view__content">
                <h2 id="log-range-aggregations">Log range aggregations</h2>
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
                <h2 id="unwrapped-range-aggregations">Unwrapped range aggregations</h2>
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
                <h2 id="unwrapped-examples">Unwrapped examples</h2>
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
                <h1 class="page-header-two" id="built-in-aggregation-operators">Built-in aggregation operators</h1>
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
                <h2 id="vector-aggregation-examples">Vector aggregation examples</h2>
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
              <div class="catalog">
                <ul>
                  <li style="list-style:square;">
                    <div @click="jumpClick('#log-queries')"><span>Log queries</span></div>
                    <ul>
                      <li style="list-style:disc;" @click="jumpClick('#log-stream-selector')"><span>Log stream selector</span></li>
                      <li style="list-style:disc;">
                        <div @click="jumpClick('#log-pipeline')"><span>Log pipeline</span></div>
                         <ul>
                            <li @click="jumpClick('#line-filter-expressions')"><span>Line filter expression</span></li>
                            <li @click="jumpClick('#label-filter-expressions')"><span>Label filter expression</span></li>
                            <li @click="jumpClick('#parsing-expressions')"><span>Parser expression</span></li>
                            <li @click="jumpClick('#JSON')"><span>JSON</span></li>
                            <li @click="jumpClick('#logfmt')"><span>logfmt</span></li>
                            <li @click="jumpClick('#pattern')"><span>Pattern</span></li>
                            <li @click="jumpClick('#regexp')"><span>Regular expression</span></li>
                            <li @click="jumpClick('#unpack')"><span>unpack</span></li>
                            <li @click="jumpClick('#line-format-expressions')"><span>Line format expression</span></li>
                            <li @click="jumpClick('#label-format-expressions')"><span>Labels format expression</span></li>
                         </ul>
                      </li>
                      <li style="list-style:disc;">
                        <div @click="jumpClick('#log-queries-examples')"><span>Log queries examples</span></div>
                         <ul>
                            <li @click="jumpClick('#multiple-filtering')"><span>Multiple filtering</span></li>
                            <li @click="jumpClick('#multiple-parsers')"><span>Multiple parsers</span></li>
                            <li @click="jumpClick('#formatting')"><span>Formatting</span></li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <li style="list-style:square;">
                    <div @click="jumpClick('#metric-queries')"><span>Metric queries</span></div>
                    <ul>
                      <li style="list-style:disc;">
                        <div @click="jumpClick('#range-vector-aggregation')"><span>Range Vector aggregation</span></div>
                        <ul>
                          <li @click="jumpClick('#log-range-aggregations')"><span>Log range aggregations</span></li>
                          <li @click="jumpClick('#unwrapped-range-aggregations')"><span>Unwrapped range aggregations</span></li>
                          <li @click="jumpClick('#unwrapped-examples')"><span>Unwrapped examples</span></li>
                        </ul>
                      </li>
                      <li style="list-style:disc;">
                        <div @click="jumpClick('#built-in-aggregation-operators')"><span>Built-in aggregation operators</span></div>
                        <ul><li @click="jumpClick('#vector-aggregation-examples')"><span>Vector aggregation examples</span></li></ul>
                      </li>
                    </ul>
                  </li>
                  </ul>
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
