//////////////////////////////////////////////////////////////////////////////////////////////////////
var displayType = 'Repair';                //当前展示的申请类型
var initData = {};
var pageSize = 20;              //一页最多显示16条信息
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 获取待审核申请列表、刷新列表（函数）
function refreshTable(){
    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/HistoryApplicationList.json',  //后端Url待改
        success: function(result){
            if(result.Status == 'error'){
                alert('获取数据失败，请稍后重试..');
            }else{
                for(let p in result){
                    initData[p] = result[p].reverse()       //初始数据按时间顺序
                }
                displayTable(initData[displayType], displayType);
            }
        },
        error: function(){
            alert('获取信息失败，请稍后重试...');
        }
    });
}

function displayTable(data, displayType){
    if(displayType == 'Purchase'){              //采购入库申请
        $('#commonTable').hide();
        $('#purchaseTable').show();
        if(data.length > 0){
            $('#paginationApplication').jqPaginator({
                first: '<li class="first"><a href="javascript:;">首页</a></li>',
                prev: '<li class="prev"><a href="javascript:;"><<</a></li>',
                next: '<li class="next"><a href="javascript:;">>></a></li>',
                last: '<li class="last"><a href="javascript:;">末页</a></li>',
                page: '<li class="page"><a href="javascript:;">{{page}}</a></li>',
                totalPages: Math.ceil(data.length / pageSize),
                totalCounts: data.length,
                pageSize: pageSize,
                onPageChange: function(num){
                    $('#purchaseTbody').empty();
                    var begin = (num - 1) * pageSize;
                    var n = 1;
                    for(var i = begin; i < data.length && i < begin + pageSize; i++){
                        let appendData = 
                            '<tr><th>' + n
                            + '</th><td>' + data[i].Code
                            + '</td><td>' + data[i].SeqID
                            + '</td><td>' + data[i].State
                            + '</td><td>' + data[i].ApplicantID + '&nbsp&nbsp&nbsp' + data[i].ApplicantName
                            + '</td><td>' + data[i].ApplicationTime
                            + '</td><td><button class="btn act-btn" onclick="getPurchaseInfo(this);">查看详情</button>'
                            + '</td></tr>';
                        $('#purchaseTbody').append(appendData);
                        n++;   //当前页面序号
                    }
                }
            });
        }
    }else{                                      //其余四类申请
        $('#commonTable').show();
        $('#purchaseTable').hide();
        if(data.length > 0){
            $('#paginationApplication').jqPaginator({
                first: '<li class="first"><a href="javascript:;">首页</a></li>',
                prev: '<li class="prev"><a href="javascript:;"><<</a></li>',
                next: '<li class="next"><a href="javascript:;">>></a></li>',
                last: '<li class="last"><a href="javascript:;">末页</a></li>',
                page: '<li class="page"><a href="javascript:;">{{page}}</a></li>',
                totalPages: Math.ceil(data.length / pageSize),
                totalCounts: data.length,
                pageSize: pageSize,
                onPageChange: function(num){
                    $('#commonTbody').empty();
                    var begin = (num - 1) * pageSize;
                    for(var i = begin; i < data.length && i < begin + pageSize; i++){
                        let appendData = 
                            '<tr><td>' + data[i].OrderID
                            + '</td><td>' + data[i].State
                            + '</td><td>' + data[i].ApplicantID + '&nbsp&nbsp&nbsp' + data[i].ApplicantName
                            + '</td><td>' + data[i].ApplicationTime
                            + '</td><td><button class="btn act-btn" onclick="getInfo(this);">查看详情</button>'
                            + '</td></tr>';
                        $('#commonTbody').append(appendData);
                    }
                }
            });
        }
    }
}

$(window).on('load', refreshTable());
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 切换展示的申请类型
function changeTab(e, type){
    $('#' + displayType + 'Tab').removeClass('a-tab-active');
    $(e).addClass('a-tab-active');
    $('#selectAll').prop('checked', false);
    displayType = type;
    displayTable(initData[displayType], displayType);
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 点击查看详情、模态窗显示、模态窗提交
function getInfo(e){
    var OrderID = $(e).parent().parent().children().eq(0).text()
    $('#OrderID').text(OrderID);
    $('#State').text($(e).parent().parent().children().eq(1).text());
    $('#Applicant').text($(e).parent().parent().children().eq(2).text());
    $('#ApplicationTime').text($(e).parent().parent().children().eq(3).text());
    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/HistoryApplicationInfo.json'/*  + '?OrderID=' + OrderID */,      //url待改 后附OrderID参数
        success: function(result){
            if(result.Status == 'error'){
                alert('获取信息失败，请稍后重试...');
            }else{
                $('#repairBox').hide();
                $('#scrapBox').hide();

                $('#ToolList').text('');                     //清空富文本框显示夹具
                let temp = '';
                switch(displayType){                         //更改模态窗内容
                    case 'Repair':
                        $('#modalTitle').text('报修申请单详情');
                        $('#PMContent').text(result.PMContent);
                        $('#RepairReason').text(result.Reason);
                        temp = '\t\t代码\t\t序列号\n';
                        for(let i = 0; i < result.ToolList.length; i++){
                            temp += 'No.' + (i + 1) + '\t' 
                                + result.ToolList[i].Code + '\t\t' 
                                + result.ToolList[i].SeqID + '\n';
                        }
                        $('#ToolList').text(temp);

                        $('#repairBox').show();
                        break;
                    case 'Scrap':
                        $('#modalTitle').text('报废申请单详情');
                        $('#ScrapReason').text(result.Reason);
                        temp = '\t\t代码\t\t序列号\t使用寿命\n';
                        for(let i = 0; i < result.ToolList.length; i++){
                            temp += 'No.' + (i + 1) + '\t' 
                                + result.ToolList[i].Code + '\t\t' 
                                + result.ToolList[i].SeqID + '\t\t'
                                + result.ToolList[i].ServiceLife + '\n';
                        }
                        $('#ToolList').text(temp);

                        $('#scrapBox').show();
                        break;
                }
                $('#Reviewer').empty();
                $('#Reviewer').append(result.ReviewerID + '&nbsp;&nbsp;&nbsp;' + result.Reviewer);
                
                  
                
                $('#applicationInfoModal').modal('show');
            }
        },
        error: function(){
            alert('获取信息失败，请稍后重试...');
        }
    });
}
//采购入库申请操作
function getPurchaseInfo(e){
    var Code = $(e).parent().parent().children().eq(1).text();
    var SeqID = $(e).parent().parent().children().eq(2).text();
    $('#Code').text(Code);
    $('#SeqID').text(SeqID);
    $('#purchaseState').text($(e).parent().parent().children().eq(3).text());
    $('#purchaseApplicant').text($(e).parent().parent().children().eq(4).text());
    $('#purchaseApplicationTime').text($(e).parent().parent().children().eq(5).text());
    $.ajax({
        type: 'GET',
        contentType: 'application/json;charset=UTF-8',
        url: '../TestData/HistoryApplicationInfo(purchase).json'/*  + '?Code=' + OrderID + '&SeqID=' + SeqID */,      //url待改 后附参数
        success: function(result){
            if(result.Status == 'error'){
                alert('获取信息失败，请稍后重试...');
            }else{
                $('#Code').text(result.Code); 
                $('#SeqID').text(result.SeqID);
                $('#Buyoff').text(result.Buyoff);
                $('#BillNo').text(result.BillNo);
                $('#StoreHouse').text(result.StoreHouse);
                $('#purchaseReviewer').empty();
                $('#purchaseReviewer').append(result.ReviewerID + '&nbsp;&nbsp;&nbsp;' + result.Reviewer);

                $('#purchaseInfoModal').modal('show');
            }
        },
        error: function(){
            alert('获取信息失败，请稍后重试...');
        }
    });
}
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