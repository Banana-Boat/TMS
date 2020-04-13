////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//定义全局变量
var initData = [];
var searchType = '';
var pageSize = 20;              //一页最多显示20条信息

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 获取定义列表、刷新待申请列表（函数）
$(window).on('load', function(){
    refreshTable();
});
function refreshTable(){
    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/ToolEntityList.json',  //后端Url
        success: function(result){
            if(result.Status == 'error'){
                alert('获取数据失败，请稍后重试..');
            }else{
                function compare(a, b){
                    if(a.State == '可用' && b.State == '可用')  return 0;
                    else if(a.State == '可用')  return -5;
                    else if(b.State == '可用')  return 5;
                    else    return a.State.localeCompare(b.State);
                }
                initData = result.sort(compare);    //将实体数据按照状态排序  可用放最前
                displayTable(initData);
            }
        },
        error: function(){
            alert('获取信息失败，请稍后重试...');
        }
    });
}
function displayTable(data){ 
    if(data.length > 0){
        $('#paginationToolEntity').jqPaginator({
            first: '<li class="first"><a href="javascript:;">首页</a></li>',
            prev: '<li class="prev"><a href="javascript:;"><<</a></li>',
            next: '<li class="next"><a href="javascript:;">>></a></li>',
            last: '<li class="last"><a href="javascript:;">末页</a></li>',
            page: '<li class="page"><a href="javascript:;">{{page}}</a></li>',
            totalPages: Math.ceil(data.length / pageSize),
            totalCounts: data.length,
            pageSize: pageSize,
            onPageChange: function(num){
                $('#definitionTbody').empty();
                var begin = (num - 1) * pageSize;
                for(var i = begin; i < data.length && i < begin + pageSize; i++){
                    var appendData = 
                        '<tr><td>' + data[i].Code
                        + '</td><td>' + data[i].SeqID
                        + '</td><td>' + data[i].RegDate
                        + '</td><td>' + data[i].UsedCount
                        + '</td><td>' + data[i].State
                        + '</td><td><button class="btn act-btn" onclick="getInfo(this);">查看详情</button></td></tr>';
                    $('#definitionTbody').append(appendData);
                }
            }
        });
    }else{
        alert('无筛选结果');
    }                        
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 查找
function chooseSearchType(e){
    $('#searchTypeBtn').text($(e).text());
    searchType = $(e).text();
    $('#paramInput').focus();
}

$('#searchBtn').click(function(){
    var param = $('#paramInput').val();
    switch(searchType){
        case '按使用次数':
            displayTable(initData.filter(item => { return item.UsedCount == param}));
            break;
        case '按夹具状态':
            displayTable(initData.filter(item => { return item.State == param}));
            break;
        default:
            $('#paramInput').val('');
            displayTable(initData);
    }
});
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 获取夹具定义的详细信息
function getInfo(e){
    var code = $(e).parent().parent().children().eq(0).text();
    var seqID = $(e).parent().parent().children().eq(1).text();
    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/ToolEntityInfo.json',  //code附在url后  '...?Code=' + code + '&SeqID=' + seqID
        success: function(result){
            if(result.Status == 'error'){
                alert('获取数据失败，请稍后重试..');
            }else{
                $('#Code').text(result.Code);
                $('#SeqID').text(result.SeqID);
                $('#Buyoff').text(result.Buyoff);
                $('#RegDate').text(result.RegDate);
                $('#UsedCount').text(result.UsedCount);
                $('#State').text(result.State);
                $('#BillNo').text(result.BillNo);
                $('#StoreHouse').text(result.StoreHouse);
                $('#LastTestTime').text(result.LastTestTime);
                $('#TotalUsedTime').text(result.TotalUsedTime);
                $('#Image').attr('src', result.Image);
                
                $('#InfoModal').modal('show');
            }
        },
        error: function(){
            alert('获取数据失败，请稍后重试...')
        }
    });
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 获取Url查询字符串
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 滚动条监听，操作窗固定
$(window).scroll(function(){
    if($(window).scrollTop() > 100)
        $('.oper-box').addClass('oper-box-sticky');
    else
        $('.oper-box').removeClass('oper-box-sticky');
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 展示夹具状态饼图
$('#danglingShow').click(function(){
    //if(!$('#ToolStateChart').children().length > 0){      //若已初始化，则直接展示
        var toolChart = echarts.init(document.getElementById('ToolStateChart'));
        toolChart.setOption({
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b} : {c} ({d}%)'
            },
            series: [
                {
                    name: '夹具状态',
                    type: 'pie',
                    radius: '75%',
                    center: ['50%', '50%'],
                    data: [
                        {value: getSum(initData, '可用'), name: '可用', itemStyle: {color: '#87bd71'}},
                        {value: getSum(initData, '待入库'), name: '待入库', itemStyle: {color: '#d66464'}},
                        {value: getSum(initData, '已报废'), name: '已报废', itemStyle: {color: '#58aece'}},
                        {value: getSum(initData, '报修锁定'), name: '报修锁定', itemStyle: {color: '#f83232'}},
                        {value: getSum(initData, '报废锁定'), name: '报废锁定', itemStyle: {color: '#f83232'}},
                        {value: getSum(initData, '待点检'), name: '待点检', itemStyle: {color: '#f83232'}}
                    ].sort(function (a, b) { return a.value - b.value; }),
                    roseType: 'radius',
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
    //}
    $('#ToolStateChartModal').modal('show');
})
function getSum(data, state){
    var sum = 0;
    for(let p in data){
        if(data[p].State == state)
            sum ++;
    }
    return sum;
}
//#endregion