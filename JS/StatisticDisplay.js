//////////////////////////////////////////////////////////////////////////////////////////////////////
var displayType = 'Overview';                //当前展示的统计类型
var clock = null;                            //定时器
var lastData = null;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 获取数据并解析为图
function getAndParseData(url, type){
    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url: url,
        success: function(result){
            if(result.Status == 'error'){
                alert('获取数据失败...');
            }else{
                /* 将获取到的数据解析为统计图表 */  
                switch(type){
                    case 'RealTime':                //实时使用情况数据
                        /* 更新统计图 */
                        $('#RealTimeContent').empty();
                        $('#RealTimeContent').removeAttr('_echarts_instance_', 'style');
                        let toolChart = echarts.init(document.getElementById('RealTimeContent'));
                        toolChart.setOption({
                            tooltip: {
                                trigger: 'item',
                                formatter: '{a} <br/>{b} : {c} ({d}%)'
                            },
                            series: [
                                {
                                    name: '使用情况',
                                    type: 'pie',
                                    radius: '65%',
                                    center: ['50%', '50%'],
                                    data: [
                                        {value: result.Yes, name: '已出库', itemStyle: {color: '#d66464'}},
                                        {value: result.No, name: '未出库', itemStyle: {color: '#87bd71'}}
                                    ].sort(function (a, b) { return a.value - b.value; }),
                                    /* roseType: 'radius', */       //半径大小也变化
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
                        /* 更新表格 */
                        function plusZero(sec) {         //固定时间格式
                            return sec < 10 ? '0' + sec : sec;
                        }
                        if(lastData){
                            let outDiff = result.Yes - lastData.Yes;
                            let inDiff = result.No - lastData.No;
                            let date = new Date();
                            $('#RealTimeBBS').append(
                                '<tr><td>' + (outDiff >= 0 ? '+' + outDiff : '-' + outDiff).toString()
                                + '</td><td>' + (inDiff >= 0 ? '+' + inDiff : '-' + inDiff).toString()
                                + '</td><td>' + date.getHours() + ':' + plusZero(date.getMinutes())
                                + '</td></tr>'
                            )
                        }
                        lastData = result
                        break;
                    case 'Single':                  //单项统计数据
                        function addToTbody(type){
                            $('#Single' + type + 'Content').empty();
                            let num = 1;
                            for(let p in result[type]){
                                $('#Single' + type + 'Content').append(
                                    '<tr><td>' + num
                                    + '</td><td>' + p
                                    + '</td><td>' + result[type][p]
                                    + '</td></tr>'
                                )
                                num++;
                            }
                        }
                        addToTbody('Out');
                        addToTbody('Repair');
                        addToTbody('Purchase');
                        break;  
                    default:                        //三类总览数据（年月周）
                        let xArray;
                        switch (type) {             //初始化x轴
                            case 'OverviewYear':
                                xArray = ['Year', '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
                                break;
                            case 'OverviewMonth':
                                xArray = ['Month'];
                                for(let i = 1; i < result.Out.length + 1; i++)
                                    xArray.push(i.toString());
                                break;
                            case 'OverviewWeek':
                                xArray = ['Week', '周一', '周二', '周三', '周四', '周五', '周六', '周日', ]
                                break;
                        }
                        let outArray = result.Out.slice();      //深复制！！
                        outArray.unshift('出库');
                        let inArray = result.In.slice();
                        inArray.unshift('入库');
                        let repairArray = result.Repair.slice();
                        repairArray.unshift('报修');
                        let purchaseArray = result.Purchase.slice();
                        purchaseArray.unshift('采购入库');

                        let applicationChart = echarts.init(document.getElementById(type + 'Content'));
                        applicationChart.setOption( {
                            legend: {},
                            tooltip: {
                                trigger: 'axis',
                                showContent: false
                            },
                            toolbox: {
                                show: true,
                                feature: {
                                    saveAsImage: {show: true}
                                }
                            },
                            dataset: {
                                source: [
                                    xArray,
                                    outArray,
                                    inArray,
                                    repairArray,
                                    purchaseArray
                                ]
                            },
                            xAxis: {
                                type: 'category',
                                axisLabel:{
                                    interval:0,
                                    rotate:45,//倾斜度 -90 至 90 默认为0
                                    margin:10,
                                }
                            },
                            yAxis: {gridIndex: 0},
                            grid: {top: '15%', left: '5%', right: '45%'},
                            series: [
                                {type: 'line', smooth: true, seriesLayoutBy: 'row'},
                                {type: 'line', smooth: true, seriesLayoutBy: 'row'},
                                {type: 'line', smooth: true, seriesLayoutBy: 'row'},
                                {type: 'line', smooth: true, seriesLayoutBy: 'row'},
                                {
                                    type: 'pie',
                                    id: 'pie',
                                    radius: '40%',
                                    center: ['80%', '50%'],
                                    label: {
                                        formatter: '{b}: {@' + xArray[1] + '} ({d}%)'
                                    },
                                    encode: {
                                        itemName: xArray[0],
                                        value: xArray[1],
                                        tooltip: xArray[1]
                                    }
                                }
                            ]
                        });
                        applicationChart.on('updateAxisPointer', function (event) {        //饼图响应光标移动事件
                            let xAxisInfo = event.axesInfo[0];
                            if (xAxisInfo) {
                                var dimension = xAxisInfo.value + 1;
                                applicationChart.setOption({
                                    series: {
                                        id: 'pie',
                                        label: {
                                            formatter: '{b}: {@[' + dimension + ']} ({d}%)'
                                        },
                                        encode: {
                                            value: dimension,
                                            tooltip: dimension
                                        }
                                    }
                                });
                            }
                        });
                        break;
                }
            }
        },
        error: function(){
            alert('获取数据失败...');
        }
    });
}
function displayChart(){
    switch(displayType){
        case 'Overview':
            $('#RealTime').hide();
            $('#Single').hide();
            $('#Overview').show();

            clearInterval(clock);
            lastData = null;
            break;
        case 'RealTime':
            $('#RealTimeBBS').empty();
            getAndParseData('/TestData/RealTimeStatisticInfo.json', 'RealTime');
            clock = setInterval(function(){
                getAndParseData('/TestData/RealTimeStatisticInfo.json', 'RealTime');
            }, 30000)

            $('#Overview').hide();
            $('#Single').hide();
            $('#RealTime').show();
            break;
        case 'Single':
            $('#Overview').hide();
            $('#RealTime').hide();
            $('#Single').show();

            clearInterval(clock);
            lastData = null;
            break;    
    }
}
$(window).on('load', function(){
    /* 绑定年份、月份下拉框 */
    var date = new Date();
    for(let i = 1; i < 13; i++)
        $('#monthInputOfMonthBox').append('<option value=' + i + '>' + i + '月</option>');
    $('#monthInputOfMonthBox').val(date.getMonth() + 1);
    $.ajax({                                              //获取申请记录的最早年份，用于绑定下拉框
        type: 'GET',
        dataType: 'JSON',
        url: '/TestData/ApplicationBeginYear.json',       //待改
        success: function(result){
            if(result.Status == 'error'){
                $('#yearInputOfMonthBox').replaceWith('<input class="form-control" id="yearInputOfMonthBox" type="text">');
                $('#yearInputOfYearBox').replaceWith('<input class="form-control" id="yearInputOfYearBox" type="text">');
            }else{
                for(let i = date.getFullYear(); i > result.Year - 1; i--){
                    $('#yearInputOfMonthBox').append('<option value=' + i + '>' + i + '年</option>');
                    $('#yearInputOfYearBox').append('<option value=' + i + '>' + i + '年</option>');
                }
            }
        },
        error: function(){
            $('#yearInputOfMonthBox').replaceWith('<input class="form-control" id="yearInputOfMonthBox" type="text">');
            $('#yearInputOfYearBox').replaceWith('<input class="form-control" id="yearInputOfYearBox" type="text">');
        }
    });
    /* 预先初始化发送请求获取统计数据 */        //第一个参数url待改，初始为当前年份月份
    getAndParseData('/TestData/OverviewStatisticInfo(year).json?year=' + date.getFullYear(), 'OverviewYear');
    getAndParseData('/TestData/OverviewStatisticInfo(month).json?year=' + date.getFullYear() + '&month=' + (date.getMonth() + 1), 'OverviewMonth');                                     
    getAndParseData('/TestData/OverviewStatisticInfo(week).json', 'OverviewWeek');
    getAndParseData('/TestData/SingleStatisticInfo.json', 'Single');
    /* 展示当前选项卡的数据图表 */ 
    displayChart();
});
$(window).on('unload', function(){          //清除定时器
    if(clock){
        clearInterval(clock);
    }
})
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 切换展示的申请类型
function changeTab(e, type){
    $('#' + displayType + 'Tab').removeClass('a-tab-active');
    $(e).addClass('a-tab-active');
    displayType = type;
    displayChart();
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 总览查询
$('#OverviewYearSearchBtn').click(function(){
    getAndParseData('/TestData/OverviewStatisticInfo(year).json?year=' 
        + $('#yearInputOfYearBox').val(), 'OverviewYear');
})
$('#OverviewMonthSearchBtn').click(function(){
    getAndParseData('/TestData/OverviewStatisticInfo(month).json?year=' 
        + $('#yearInputOfMonthBox').val() + '&month=' + $('#monthInputOfMonthBox').val(), 'OverviewMonth');  
})
//#endregion
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 回到顶部悬浮按钮
$(window).on('load', function(){
    // 获取页面可视区域的高度
    var clientHeight = document.documentElement.clientHeight;
    var timer = null;// 定义定时器变量
    var isTop = true;// 是否返回顶部
    // 滚动滚动条时候触发
    $(window).on('scroll', function(){
        // 获取滚动条到顶部高度-返回顶部显示或者隐藏
        var osTop = document.documentElement.scrollTop || document.body.scrollTop;
        if (osTop >= clientHeight / 3) {
            $('#danglingBack').show();
        } else {
            $('#danglingBack').hide();
        }
        // 如果是用户触发滚动条就取消定时器
        if (!isTop) {
            clearInterval(timer);
        }
        isTop = false;
    });
    // 返回顶部按钮点击事件
    $('#danglingBack').click(function(){
        timer = setInterval(function() {
            // 获取滚动条到顶部高度
            var osTop = document.documentElement.scrollTop || document.body.scrollTop;
            var distance = Math.floor(-osTop / 6);
            document.documentElement.scrollTop = document.body.scrollTop = osTop + distance;
            isTop = true;
            if (osTop == 0) {
                clearInterval(timer);
            }
        }, 30);
    });
})
//#endregion