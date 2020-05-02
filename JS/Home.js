//////////////////////////////////////////////////////////////////////////////////////////////////
//全局变量
var key = '70c1e3393205c7c29e3297d0a27941e9';
var initToolData = null;
var displayType = 'line';
//////////////////////////////////////////////////////////////////////////////////////////////////
//#region 初始化数据
$(window).on('load', function(){
    $.ajax({                               //用户信息
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/HomeInfo.json',  //后端Url待改
        success: function(result){
            if(result.Status == 'error'){
                alert('获取数据失败，请稍后重试..');
            }else{
                $('#welcome').text(getWelcomeStr(result.UserInfo['Name']));
                $('#info').append(result.UserInfo['Workcell'] + '&nbsp;&nbsp;&nbsp;&nbsp;' + result.UserInfo['Privilege']);
                if(result.TodoList.TempTool != '0')
                    $('#TodoList').append('<a class="todo-item" href="../HTML/TempApplicationManage.html">夹具暂存申请<span class="badge">' + result.TodoList.TempTool + '</span></a>');
                if(result.TodoList.Tool != '0')
                    $('#TodoList').append('<a class="todo-item" href="../HTML/ApplicationReview.html">夹具申请审核<span class="badge">' + result.TodoList.Tool + '</span></a>');
                if(result.TodoList.PWReset != '0')
                    $('#TodoList').append('<a class="todo-item" href="../HTML/PwResetApplicationManage.html">重置密码申请<span class="badge">' + result.TodoList.PWReset + '</span></a>');

                initToolData = result.ToolInfo;
                showChart();

                for(let p in result.Notice){
                    $('#Notice').append('<p style="font-size: 16px">' + (Number.parseInt(p) + 1).toString() + '. ' + result.Notice[p] + '</p>');
                }
            }
        },
        error: function(){
            alert('获取信息失败，请稍后重试...');
        }
    });
    $.ajax({                                //天气
        type: 'GET',
        dataType: 'JSON',
        url: 'https://restapi.amap.com/v3/ip?key=' + key,
        success: function(result){
            if(result.status==0)
                alert('获取数据失败，请稍后重试..');
            else {
                var citycode = result.adcode;
                $.ajax({
                    type: 'GET',
                    dataType: 'JSON',
                    url: 'https://restapi.amap.com/v3/weather/weatherInfo?key=' + key + '&city=' + citycode,
                    success: function(result){
                        if(result.status == 0){
                            alert('获取数据失败，请稍后重试..');
                        }else{
                            let weather = result.lives[0].weather;
                            if(weather.indexOf('晴') != -1)
                                $('#weatherImg').attr('src', '../IMG/sun.png')        //路径待改
                            else if(weather.indexOf('雨') != -1)
                                $('#weatherImg').attr('src', '../IMG/rain.png')
                            else if(weather.indexOf('雪') != -1)
                                $('#weatherImg').attr('src', '../IMG/snow.png')
                            else
                                $('#weatherImg').attr('src', '../IMG/cloudy.png')

                            $('#temperature').append('<span style="font-size: 28px">' + weather
                                     + '</span>&nbsp;' + result.lives[0].temperature + '℃');
                            $('#city').append('&nbsp;&nbsp;&nbsp;' + result.lives[0].city);
                        }
                    },
                    error: function(){
                        alert('获取信息失败，请刷新重试...');
                    }
                })
            }
        },
        error: function(){
            alert('获取数据失败，请稍后重试..');
        }
    })
})
function getWelcomeStr(name) {
    var tempStr;
    var h = new Date().getHours();
    if(h < 6)
        tempStr = '夜深了,早点睡吧';
    else if(h <= 10)
        tempStr = "早上好！" + name;
    else if(h <= 12)
        tempStr = "中午好！" + name;
    else if(h <= 18)
        tempStr = "下午好！" + name;
    else
        tempStr = "晚上好！" + name;
    
    return tempStr;
}
function showChart(){
    $('#ToolInfo').empty();
    $('#ToolInfo').removeAttr('_echarts_instance_', 'style');
    var toolChart = echarts.init(document.getElementById('ToolInfo'));
    if(displayType == 'line'){
        toolChart.setOption({
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data:['出库', '入库', '报修', '采购入库']
            },
            toolbox: {
                show: true,
                feature: {
                    magicType: {show: true, type: ['stack', 'tiled']},
                    saveAsImage: {show: true}
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: initToolData.Date
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                name: '出库',
                type: 'line',
                smooth: true,
                data: initToolData.Out
            },
            {
                name: '入库',
                type: 'line',
                smooth: true,
                data: initToolData.In
            },
            {
                name: '报修',
                type: 'line',
                smooth: true,
                data: initToolData.Repair
            },
            {
                name: '采购入库',
                type: 'line',
                smooth: true,
                data: initToolData.Purchase
            }]
        });
    }else{
        toolChart.setOption({
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b} : {c} ({d}%)'
            },
            series: [
                {
                    name: '申请类型',
                    type: 'pie',
                    radius: '75%',
                    center: ['50%', '50%'],
                    data: [
                        {value: getSum(initToolData.Out), name: '出库', itemStyle: {color: '#d66464'}},
                        {value: getSum(initToolData.In), name: '入库', itemStyle: {color: '#87bd71'}},
                        {value: getSum(initToolData.Repair), name: '报修', itemStyle: {color: '#58aece'}},
                        {value: getSum(initToolData.Purchase), name: '采购入库', itemStyle: {color: '#f83232'}}
                    ].sort(function (a, b) { return a.value - b.value; }),
                    label: {
                        color: 'rgba(0, 0, 0, 0.6)',
                        fontSize: 17
                    },
                    labelLine: {
                        lineStyle: {
                            color: 'rgba(0, 0, 0, 0.6)'
                        },
                        smooth: 0.2,
                        length: 10,
                        length2: 20
                    },
                    itemStyle: {
                        shadowBlur: 30,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    },
                    animationType: 'scale',
                    animationEasing: 'elasticOut',
                    animationDelay: function (idx) {
                        return Math.random() * 200;
                    }
                }
            ]
        });
    }
}
function getSum(array){
    var sum = 0;
    for(let p in array)
        sum += Number.parseInt(array[p]);
    return sum;
}
//#endregion

//////////////////////////////////////////////////////////////////////////////////////////////////
//#region 改变图表类型
function changeChart(){
    if(displayType == 'line')
        displayType = 'pie';
    else
        displayType = 'line';
    showChart();
}
//#endregion


    




