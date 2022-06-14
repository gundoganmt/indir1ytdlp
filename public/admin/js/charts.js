var options = {
    chart: {
      height: 280,
      type: 'line',
      toolbar: {
          show: false,
      },
    },
    dataLabels: {
      enabled: false
    },
    series: [
      {
        name: "Downloads",
        data: data
      }
    ],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        gradientToColors: [ '#FDD835'],
        shadeIntensity: 1,
        type: 'horizontal',
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100, 100, 100]
      },
    },
    stroke: {
      width: 5,
      curve: 'smooth'
    },
    xaxis: {
      categories: dates
    },
    yaxis: {
      min: 0,
      labels: {
        formatter: function(val) {
          return val.toFixed(0)
        }
      }
    }
};
var chart = new ApexCharts(document.querySelector("#total_chart"), options);
if (document.getElementById('total_chart')) {
    chart.render();
}

// Downloads per Source Chart
var optionsSourceChart = {
    series: [{
        name: 'Downloads',
        data: source_data
    }],
    chart: {
        type: 'bar',
        height: '400px',
        fontFamily: 'Inter',
        foreColor: '#4B5563',
    },
    colors: ['#f0bc74', '#31316A'],
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '40%',
            borderRadius: 10,
            colors: {
                backgroundBarColors: ['#fff'],
                backgroundBarOpacity: .2,
                backgroundBarRadius: 10,
            },
        },
    },
    grid: {
        show: false,
    },
    dataLabels: {
        enabled: false
    },
    legend: {
        show: true,
        fontSize: '14px',
        fontFamily: 'Inter',
        fontWeight: 500,
        height: 40,
        tooltipHoverFormatter: undefined,
        offsetY: 10,
        markers: {
            width: 14,
            height: 14,
            strokeWidth: 1,
            strokeColor: '#ffffff',
            radius: 50,
        },
    },
    stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
    },
    xaxis: {
        categories: ['Youtube', 'Facebook', 'Twitter', 'Instagram', 'Tiktok', 'Reddit', 'TedTalk', 'Vlive', 'Vimeo', 'SoundCloud', 'Izlesene'],
        labels: {
            style: {
                fontSize: '12px',
                fontWeight: 500,
            },
        },
        axisBorder: {
            color: '#EBE3EE',
        },
        axisTicks: {
            color: '#f1f1f1',
        }
    },
    yaxis: {
        show: false,
    },
    fill: {
        opacity: 1
    },
    responsive: [{
        breakpoint: 1499,
        options: {
            chart: {
                height: '400px',
            },
        },
    }]
};
        
var dwSourceChart = document.getElementById('chart_per_source');
if (dwSourceChart) {
    var SourceChart = new ApexCharts(dwSourceChart, optionsSourceChart);
    SourceChart.render();
}