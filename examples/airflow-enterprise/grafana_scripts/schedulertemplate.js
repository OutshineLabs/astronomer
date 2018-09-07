/* global _ */

/*
 * Complex scripted dashboard
 * This script generates a dashboard object that Grafana can load. It also takes a number of user
 * supplied URL parameters (in the ARGS variable)
 *
 * Return a dashboard object, or a function
 *
 * For async scripts, return a function, this function must take a single callback function as argument,
 * call this callback function with the dashboard object (look at scripted_async.js for an example)
 */

'use strict';

// accessible variables in this scope
var window, document, ARGS, $, jQuery, moment, kbn;

// Setup some variables
var dashboard;

// All url parameters are available via the ARGS object
var ARGS;

// Initialize a skeleton with nothing but a rows array and service object
dashboard = {
  rows : []
};

// Set a title
dashboard.title = 'Master Scheduler Dashboard';

// Set default time
// time can be overridden in the url using from/to parameters, but this is
// handled automatically in grafana core during dashboard initialization
dashboard.time = {
  from: "now-1h",
  to: "now"
};

var rows = 1;
var seriesName = 'customArgName';
var prefix = ARGS.prefix;

var queries = [prefix + '_scheduler_heartbeat',
               prefix + '_collect_dags',
               prefix + '_dagbag_size',
               'sum(' + prefix + '_localtaskjob_start - ' + prefix + '_localtaskjob_end)',
               'sum(' + prefix + '_ti_successes)',
               'sum(' + prefix + '_ti_failures)',
               'rate(' + prefix + '_operator_successes[1m])',
               'rate(' + prefix + '_operator_failures[1m])',
               prefix + '_dagrun_dependency_check{quantile=\"0.5\"}',
               prefix + '_dagrun_dependency_check{quantile=\"0.9\"}',
               prefix + '_dagrun_dependency_check{quantile=\"0.99\"}'];

var metricTitles = ['Scheduler Heartbeat',
                    'DAG Collection Time',
                    'DAGBag Size',
                    'Ongoing Local Task Jobs',
                    'Successful Task Instances',
                    'Failed Task Instances',
                    'Operator Success Rate',
                    'Operator Failure Rate',
                    'Dependency Checks q0.5',
                    'Dependency Checks q0.9',
                    'Dependency Check q0.99']

var num_small_panels = 6;
// var num_large_panels = 2;
var num_small_graphs = 2;
var num_medium_graphs = 3;


if(!_.isUndefined(ARGS.rows)) {
  rows = parseInt(ARGS.rows, 10);
}

if(!_.isUndefined(ARGS.name)) {
  seriesName = ARGS.name;
}

var panels = [];

for (var a = 0; a < num_small_panels; a++) {
  panels.push(
    {
      title: metricTitles[a],
      thresholds: "",
      valueFontSize: "10%",
      valueMaps: [
        {
          op: "=",
          text: "N/A",
          value: null
        }
      ],
      valueName: "current",
      type: 'singlestat',
      span: 2,
      fill: 1,
      linewidth: 2,
      datasource: "Prometheus",
      format: "none",
      cacheTimeout: null,
      colorBackground: false,
      colorValue: false,
      "colors": [
        "#299c46",
        "rgba(237, 129, 40, 0.89)",
        "#d44a3a"
      ],
      gauge: {
        maxValue: 100,
        minValue: 0,
        show: false,
        thresholdLabels: false,
        thresholdMarkers: true
      },
      gridPos: {
        h: 3,
        w: 6,
        x: a * 6,
        y: 0
      },
      id: a + 1,
      interval: null,
      links: [],
      mappingType: 1,
      mappingTypes: [
        {
          name: "value to text",
          value: 1
        },
        {
          name: "range to text",
          value: 2
        }
      ],
      maxDataPoints: 100,
      nullPointMode: "connected",
      nullText: null,
      postfix: "",
      postfixFontSize: "50%",
      prefix: "",
      prefixFontSize: "50%",
      rangeMaps: [
        {
          from: null,
          text: "N/A",
          to: null
        }
      ],
      sparkline: {
        fillColor: "rgba(31, 118, 189, 0.18)",
        full: false,
        lineColor: "rgb(31, 120, 193)",
        show: true
      },
      tableColumn: "",
      targets: [
        {
           expr: queries[a],
           format: "time_series",
           intervalFactor: 2,
           refId: "A"
        }
      ],
      valueFontSize: "80%",
      valueMaps: [
        {
          op: "=",
          text: "N/A",
          value: null
        }
      ],
      valueName: "current"
    }
  )
}

panels.push(
  {
    "aliasColors": {
      "dagbag_size": "#82b5d8",
      "failure": "#1f78c1"
    },
    "bars": false,
    "dashLength": 10,
    "dashes": false,
    "datasource": "Prometheus",
    "fill": 2,
    "grid": {
      "max": null,
      "min": null
    },
    "id": 105,
    "interactive": true,
    "lines": true,
    "linewidth": 2,
    "links": [],
    "nullPointMode": "connected",
    "options": false,
    "percentage": false,
    "pointradius": 1,
    "points": false,
    "renderer": "flot",
    "resolution": 100,
    "scale": 1,
    "show": null,
    "spaceLength": 10,
    "span": 6,
    "stack": false,
    "steppedLine": false,
    "targets": [
      {
        "expr": "airflow_dagbag_size",
        "alias": "dagbag_size",
        "refId": "A",
        "intervalFactor": 1,
        "format": "time_series",
        "legendFormat": "Number of DAGs",
        "interval": ""
      },
      {
        "expr": "airflow_running_dagruns",
        "alias": "running_dags",
        "refId": "B",
        "intervalFactor": 1,
        "format": "time_series",
        "legendFormat": "Running DAGs"
      },
      {
        "expr": "airflow_failed_dagruns",
        "alias": "failed_dags",
        "refID": "C",
        "intervalFactor": 1,
        "format": "time_series",
        "refId": "C",
        "legendFormat": "Failed DAGs"
      }
    ],
    "thresholds": [],
    "timeFrom": null,
    "timeShift": null,
    "timezone": "browser",
    "title": "DAGRun States",
    "tooltip": {
      "query_as_alias": true,
      "shared": true,
      "sort": 0,
      "value_type": "cumulative"
    },
    "type": "graph",
    "xaxis": {
      "buckets": null,
      "mode": "time",
      "name": null,
      "show": true,
      "values": []
    },
    "yaxes": [
      {
        "format": "short",
        "label": "",
        "logBase": 1,
        "max": null,
        "min": null,
        "show": true,
        "decimals": 0
      },
      {
        "format": "string",
        "label": null,
        "logBase": 1,
        "max": null,
        "min": null,
        "show": false
      }
    ],
    "zerofill": true,
    "yaxis": {
      "align": false,
      "alignLevel": null
    },
    "gridPos": {
      "x": 0,
      "y": 7,
      "w": 24,
      "h": 7
    },
    "seriesOverrides": [],
    "legend": {
      "show": true,
      "values": false,
      "min": false,
      "max": false,
      "current": false,
      "total": false,
      "avg": false
    }
  }
)

panels.push(
  {
    "aliasColors": {
      "success": "#82b5d8",
      "failure": "#1f78c1",
    },
    "bars": false,
    "dashLength": 10,
    "dashes": false,
    "datasource": "Prometheus",
    "fill": 2,
    "grid": {
      "max": null,
      "min": null
    },
    "id": 101,
    "interactive": true,
    "lines": true,
    "linewidth": 2,
    "links": [],
    "nullPointMode": "connected",
    "options": false,
    "percentage": false,
    "pointradius": 1,
    "points": false,
    "renderer": "flot",
    "resolution": 100,
    "scale": 1,
    "show": null,
    "spaceLength": 10,
    "span": 6,
    "stack": false,
    "steppedLine": false,
    "targets": [
      {
        "expr": prefix + "_ti_successes",
        "alias": "success",
        "refId": "A",
        "intervalFactor": 1,
        "format": "time_series"
      },
      {
        "expr": prefix + "_ti_failures",
        "alias": "failure",
        "refId": "B",
        "intervalFactor": 1,
        "format": "time_series"
      }
    ],
    "thresholds": [],
    "timeFrom": null,
    "timeShift": null,
    "timezone": "browser",
    "title": "Task Instance States",
    "tooltip": {
      "query_as_alias": true,
      "shared": true,
      "sort": 0,
      "value_type": "cumulative"
    },
    "type": "graph",
    "xaxis": {
      "buckets": null,
      "mode": "time",
      "name": null,
      "show": true,
      "values": []
    },
    "yaxes": [
      {
        "format": "short",
        "label": "",
        "logBase": 1,
        "max": null,
        "min": null,
        "show": true,
        "decimals": null
      },
      {
        "format": "short",
        "label": null,
        "format" : "string",
        "logBase": 1,
        "max": null,
        "min": null,
        "show": false
      }
    ],
    "zerofill": true,
    "yaxis": {
      "align": false,
      "alignLevel": null
    },
    "gridPos": {
      "x": 0,
      "y": 21,
      "w": 24,
      "h": 7
    },
    "seriesOverrides": []
  }
)

// for (var b = 4; b < 4 + num_large_panels; b++) {
//   panels.push(
//     {
//       cacheTimeout: null,
//       colorBackground: false,
//       colorValue: false,
//       colors: [
//         "#299c46",
//         "rgba(237, 129, 40, 0.89)",
//         "#d44a3a"
//       ],
//       datasource: "Prometheus",
//       format: "none",
//       gauge: {
//         maxValue: 100,
//         minValue: 0,
//         show: false,
//         thresholdLabels: false,
//         thresholdMarkers: true
//       },
//       gridPos: {
//         h: 3,
//         w: 12,
//         x: (b - 4)*12,
//         y: 3
//       },
//       id: b + 1,
//       interval: null,
//       links: [],
//       mappingType: 1,
//       mappingTypes: [
//         {
//           name: "value to text",
//           value: 1
//         },
//         {
//           name: "range to text",
//           value: 2
//         }
//       ],
//       maxDataPoints: 100,
//       nullPointMode: "connected",
//       nullText: null,
//       postfix: "",
//       postfixFontSize: "50%",
//       prefix: "",
//       prefixFontSize: "50%",
//       rangeMaps: [
//         {
//           from: "null",
//           text: "N/A",
//           to: "null"
//         }
//       ],
//       span: 6,
//       sparkline: {
//         fillColor: "rgba(31, 118, 189, 0.18)",
//         full: false,
//         lineColor: "rgb(31, 120, 193)",
//         show: true
//       },
//       tableColumn: "",
//       targets: [
//         {
//           expr: queries[b],
//           format: "time_series",
//           intervalFactor: 2,
//           refId: "A"
//         }
//       ],
//       thresholds: "",
//       title: metricTitles[b],
//       type: "singlestat",
//       valueFontSize: "80%",
//       valueMaps: [
//         {
//           op: "=",
//           text: "0",
//           value: "null"
//         }
//       ],
//       valueName: "current"
//     }
//   )
// }

for (var c = 6; c < 6 + num_small_graphs; c++) {
  panels.push(
    {
      aliasColors: {},
      bars: false,
      dashLength: 10,
      dashes: false,
      datasource: "Prometheus",
      fill: 1,
      gridPos: {
        h: 5,
        w: 12,
        x: 0,
        y: 6
      },
      id: c + 1,
      legend: {
        avg: false,
        current: false,
        max: false,
        min: false,
        show: true,
        total: false,
        values: false
      },
      lines: true,
      linewidth: 1,
      links: [],
      nullPointMode: "null as zero",
      percentage: false,
      pointradius: 5,
      points: false,
      renderer: "flot",
      seriesOverrides: [],
      spaceLength: 10,
      span: 6,
      stack: true,
      steppedLine: false,
      targets: [
        {
          expr: queries[c],
          format: "time_series",
          intervalFactor: 1,
          legendFormat: "{{operator}}",
          refId: "A"
        }
      ],
      thresholds: [],
      timeFrom: null,
      timeShift: null,
      title: metricTitles[c],
      tooltip: {
        shared: true,
        sort: 0,
        value_type: "individual"
      },
      type: "graph",
      xaxis: {
        buckets: null,
        mode: "time",
        name: null,
        show: true,
        values: []
      },
      yaxes: [
        {
          format: "short",
          label: null,
          logBase: 1,
          max: null,
          min: null,
          show: true
        },
        {
          format: "short",
          label: null,
          logBase: 1,
          max: null,
          min: null,
          show: true
        }
      ],
      yaxis: {
        align: false,
        alignLevel: null
      }
    }
  )
}

panels.push(
  {
    "aliasColors": {
      "success": "#E24D42",
      "fail": "#1f78c1",
    },
    "annotate": {
      "enable": false
    },
    "bars": false,
    "dashLength": 10,
    "dashes": false,
    "datasource": "Prometheus",
    "editable": true,
    "fill": 3,
    "grid": {
      "max": null,
      "min": 0
    },
    "gridPos": {
      "h": 7,
      "w": 8,
      "x": 0,
      "y": 0
    },
    "id": 102,
    "interactive": true,
    "legend": {
      "avg": false,
      "current": true,
      "max": false,
      "min": true,
      "show": true,
      "total": false,
      "values": false
    },
    "legend_counts": true,
    "lines": true,
    "linewidth": 2,
    "nullPointMode": "connected",
    "options": false,
    "percentage": false,
    "pointradius": 5,
    "points": false,
    "renderer": "flot",
    "resolution": 100,
    "scale": 1,
    "seriesOverrides": [
      {
        "alias": "success",
        "fill": 0,
        "lines": true,
        "yaxis": 2,
        "zindex": 2
      },
      {
        "alias": "fail",
        "pointradius": 2,
        "points": true
      }
    ],
    "spaceLength": 10,
    "span": 12,
    "spyable": true,
    "stack": false,
    "steppedLine": false,
    "targets": [
      {
        "hide": false,
        "refId": "A",
        "expr": "rate(" + prefix + "_operator_successes[1m])",
        "alias": "success"
      },
      {
        "refId": "B",
        "expr": "rate(" + prefix + "_operator_failures[1m])",
        "alias": "fail"
      }
    ],
    "thresholds": [],
    "timeFrom": null,
    "timeShift": null,
    "timezone": "browser",
    "title": "Operator Success/Fail Rate",
    "tooltip": {
      "msResolution": false,
      "query_as_alias": true,
      "shared": false,
      "sort": 0,
      "value_type": "cumulative"
    },
    "type": "graph",
    "xaxis": {
      "buckets": null,
      "mode": "time",
      "name": null,
      "show": true,
      "values": []
    },
    "yaxes": [
      {
        "format": "none",
        "logBase": 1,
        "max": null,
        "min": null,
        "show": true
      },
      {
        "format": "percent",
        "logBase": 1,
        "max": null,
        "min": 0,
        "show": true
      }
    ],
    "zerofill": true,
    "yaxis": {
      "align": false,
      "alignLevel": null
    }
  }
)

panels.push(
  {
    "aliasColors": {
      "q0.5": "#82b5d8",
      "q0.9": "#1f78c1",
      "q0.99": "#508642"
    },
    "bars": false,
    "dashLength": 10,
    "dashes": false,
    "datasource": "Prometheus",
    "fill": 2,
    "grid": {
      "max": null,
      "min": null
    },
    "id": 100,
    "interactive": true,
    "legend": {
      "alignAsTable": true,
      "current": true,
      "legendSideLastValue": true,
      "max": true,
      "min": true,
      "leftSide": true,
      "show": true,
      "total": false,
      "values": true,
      "avg": false,
      "rightSide": true,
      "sideWidth": null,
      "hideEmpty": false
    },
    "legend_counts": true,
    "lines": true,
    "linewidth": 2,
    "links": [],
    "nullPointMode": "connected",
    "options": false,
    "percentage": false,
    "pointradius": 1,
    "points": false,
    "renderer": "flot",
    "resolution": 100,
    "scale": 1,
    "spaceLength": 10,
    "span": 12,
    "stack": false,
    "steppedLine": false,
    "targets": [
      {
        "expr": prefix + "_dagrun_dependency_check{quantile=\"$quant\"}",
        "alias": "q0.5",
        "refId": "A",
        "intervalFactor": 1,
        "format": "time_series",
        "legendFormat": "{{dag_id}} 0.5Q"
      },
      {
        "expr": prefix + "_dagrun_dependency_check{quantile=\"0.9\"}",
        "alias": "q0.9",
        "refId": "B",
        "intervalFactor": 1,
        "format": "time_series",
        "legendFormat": "{{dag_id}} 0.9Q"
      },
      {
        "expr": prefix + "_dagrun_dependency_check{quantile=\"0.99\"}",
        "alias": "q0.99",
        "refId": "C",
        "intervalFactor": 1,
        "format": "time_series",
        "legendFormat": "{{dag_id}} 0.99Q"
      }
    ],
    "thresholds": [],
    "timeFrom": null,
    "timeShift": null,
    "timezone": "browser",
    "title": "Dependency Checks (0.5q, 0.9q, 0.99q)",
    "tooltip": {
      "query_as_alias": true,
      "shared": true,
      "sort": 0,
      "value_type": "cumulative"
    },
    "type": "graph",
    "xaxis": {
      "buckets": null,
      "mode": "time",
      "name": null,
      "show": true,
      "values": []
    },
    "yaxes": [
      {
        "format": "short",
        "label": "",
        "logBase": 1,
        "max": null,
        "min": null,
        "show": true,
        "decimals": null
      },
      {
        "format": "short",
        "label": null,
        "logBase": 1,
        "max": null,
        "min": null,
        "show": false
      }
    ],
    "zerofill": true,
    "yaxis": {
      "align": false,
      "alignLevel": null
    },
    "gridPos": {
      "x": 0,
      "y": 21,
      "w": 24,
      "h": 7
    },
    "seriesOverrides": []
  }
)

for (var d = 8; d < 8 + num_medium_graphs; d++) {
  panels.push(
    {
      aliasColors: {},
      bars: false,
      dashLength: 10,
      dashes: false,
      datasource: "Prometheus",
      fill: 1,
      gridPos: {
        h: 5,
        w: 8,
        x: 0,
        y: 11
      },
      id: d + 1,
      legend: {
        avg: false,
        current: false,
        max: false,
        min: false,
        show: true,
        total: false,
        values: false
      },
      lines: true,
      linewidth: 1,
      links: [],
      nullPointMode: "null as zero",
      percentage: false,
      pointradius: 5,
      points: false,
      renderer: "flot",
      seriesOverrides: [],
      spaceLength: 10,
      span: 4,
      stack: false,
      steppedLine: false,
      targets: [
        {
          expr: queries[d],
          format: "time_series",
          instant: false,
          intervalFactor: 1,
          legendFormat: "{{dag_id}}",
          refId: "A"
        }
      ],
      thresholds: [],
      timeFrom: null,
      timeShift: null,
      title: metricTitles[d],
      tooltip: {
        shared: true,
        sort: 0,
        value_type: "individual"
      },
      transparent: false,
      type: "graph",
      xaxis: {
        buckets: null,
        mode: "time",
        name: null,
        show: true,
        values: []
      },
      yaxes: [
        {
          format: "short",
          label: null,
          logBase: 1,
          max: null,
          min: null,
          show: true
        },
        {
          format: "short",
          label: null,
          logBase: 1,
          max: null,
          min: null,
          show: true
        }
      ],
      yaxis: {
        align: false,
        alignLevel: null
      }
    }
  )
}

dashboard.rows.push(
  {
    panels
  }
)

return dashboard;
