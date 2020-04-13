//////////////////////////////////////////////////////////////////////////////////////////////////////
var selectedApplication = [];   //已选择的申请
var displayType = 'Repair';                //当前展示的申请类型
var initData = {};
var pageSize = 20;              //一页最多显示16条信息
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 获取待审核申请列表、刷新列表（函数）
function refreshTable(){
    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/ApplicationList.json',  //后端Url待改
        success: function(result){
            if(result.Status == 'error'){
                alert('获取数据失败，请稍后重试..');
            }else{
                function compare(a, b){
                    return -(a.State.length - b.State.length);
                }
                for(let p in result){                    //将实体数据按照状态排序  待审核放最前
                    initData[p] = result[p].sort(compare);
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
                    if(data[i].State == '通过' || data[i].State == '驳回'){
                        appendData += '</td></tr>';
                    }else{
                        appendData += '<button class="btn act-btn" onclick="purchasAeccept(this);">同意</button>'
                            + '<button class="btn act-btn" onclick="purchasReject(this);">驳回</button>'
                            + '</td></tr>';
                    }
                    $('#purchaseTbody').append(appendData);
                    n++;   //当前页面序号
                }
            }
        });
    }else{                                      //其余四类申请
        $('#commonTable').show();
        $('#purchaseTable').hide();

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
                        '<tr><td><input class="checkbox" onchange="selectOne(this);" type="checkbox">'
                        + '</td><td>' + data[i].OrderID
                        + '</td><td>' + data[i].State
                        + '</td><td>' + data[i].ApplicantID + '&nbsp&nbsp&nbsp' + data[i].ApplicantName
                        + '</td><td>' + data[i].ApplicationTime
                        + '</td><td><button class="btn act-btn" onclick="getInfo(this);">查看详情</button>'
                    if(data[i].State == '通过' || data[i].State == '驳回'){
                        appendData += '</td></tr>';
                    }else{
                        appendData += '<button class="btn act-btn" onclick="accept(this);">同意</button>'
                            + '<button class="btn act-btn" onclick="reject(this);">驳回</button>'
                            + '</td></tr>';
                    }
                    $('#commonTbody').append(appendData);
                }
            }
        });
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
    var OrderID = $(e).parent().parent().children().eq(1).text()
    $('#OrderID').text(OrderID);
    $('#State').text($(e).parent().parent().children().eq(2).text());
    $('#Applicant').text($(e).parent().parent().children().eq(3).text());
    $('#ApplicationTime').text($(e).parent().parent().children().eq(4).text());
    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/ApplicationInfo.json'/*  + '?OrderID=' + OrderID */,      //url待改 后附OrderID参数
        success: function(result){
            if(result.Status == 'error'){
                alert('获取信息失败，请稍后重试...');
            }else{
                $('#repairBox').hide();
                $('#scrapBox').hide();
                switch(displayType){                         //更改模态窗内容
                    case 'Repair':
                        $('#modalTitle').text('报修申请单详情');
                        $('#PMContent').text(result.PMContent);
                        $('#RepairReason').text(result.Reason);
                        $('#repairBox').show();
                        break;
                    case 'Scrap':
                        $('#modalTitle').text('报废申请单详情');
                        $('#ServiceLife').text(result.ServiceLife);
                        $('#ScrapReason').text(result.Reason);
                        $('#scrapBox').show();
                        break;
                }
                $('#ToolList').text('');                       //清空富文本框显示夹具  
                for(let i = 0; i < result.ToolList.length; i++){          //刷新富文本框显示夹具
                    let temp = $('#ToolList').text();
                    $('#ToolList').text(temp + 'No.' + (i + 1) + '    ' 
                        + result.ToolList[i].Code + '    ' 
                        + result.ToolList[i].SeqID + '\n');
                }
                $('#applicationInfoModal').modal('show');
            }
        },
        error: function(){
            alert('获取信息失败，请稍后重试...');
        }
    });
}
function acceptInModal(e){
    var transData = {
        'Type': 'accept',
        'OrderID': [
            $(e).parent().parent().children().eq(0).children().eq(1).text()
        ]
    }
    //SubmitByAjax(transData, '');
}
function rejectInModal(e){
    var transData = {
        'Type': 'reject',
        'OrderID': [
            $(e).parent().parent().children().eq(0).children().eq(1).text()
        ]
    }
    //SubmitByAjax(transData, '');
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
        url: '../TestData/ApplicationInfo(purchase).json'/*  + '?Code=' + OrderID + '&SeqID=' + SeqID */,      //url待改 后附参数
        success: function(result){
            if(result.Status == 'error'){
                alert('获取信息失败，请稍后重试...');
            }else{
                $('#Code').text(result.Code); 
                $('#SeqID').text(result.SeqID);
                $('#Buyoff').text(result.Buyoff);
                $('#BillNo').text(result.BillNo);
                $('#StoreHouse').text(result.StoreHouse);
                $('#Image').attr('src', result.Image);

                $('#purchaseInfoModal').modal('show');
            }
        },
        error: function(){
            alert('获取信息失败，请稍后重试...');
        }
    });
}
function purchaseAcceptInModal(e){
    var Code = $(e).parent().parent().children().eq(0).children().eq(1).text()
    var SeqID = $(e).parent().parent().children().eq(1).children().eq(1).text()
    var Type = 'accept';            
    var url = '.....?Code=' + Code + '&SeqID=' + SeqID + '&Type' + Type
    //SubmitWithUrl(url)
}
function purchaseRejectInModal(e){
    var Code = $(e).parent().parent().children().eq(0).children().eq(1).text()
    var SeqID = $(e).parent().parent().children().eq(1).children().eq(1).text()
    var Type = 'accept';            
    var url = '.....?Code=' + Code + '&SeqID=' + SeqID + '&Type' + Type
    //SubmitWithUrl(url)
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region checkbox
$('#selectAll').change(function(){
    if($(this).prop('checked')){
        for(let i = 0; i < $('tbody').children().length; i++){
            $('tbody').children().eq(i).children().eq(0).children().eq(0).prop('checked', true);
            $('tbody').children().eq(i).addClass('tr-selected');
        }
    }else{
        for(let i = 0; i < $('tbody').children().length; i++){
            $('tbody').children().eq(i).children().eq(0).children().eq(0).prop('checked', false);
            $('tbody').children().eq(i).removeClass('tr-selected');
        }
    }
})
function selectOne(e){
    if(!$(e).prop('checked')){
        $(e).prop('checked', false);
        $(e).parent().parent().removeClass('tr-selected');
    }else{
        $(e).prop('checked', true);
        $(e).parent().parent().addClass('tr-selected');
    }
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 单个同意、驳回
function SubmitByAjax(data, url){
    $.ajax({
        type: 'POST',
        dataType: 'JSON',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify(data),
        url: url,  
        success: function(result){
            if(result.Status == 'error'){
                alert('提交失败，请稍后重试...');
            }else{
                alert('提交成功！');
                refreshTable();
            }
        },
        error: function(){
            alert('提交失败，请稍后重试...');
        }
    });
}
function accept(e){
    var transData = {
        'Type': 'accept',
        'OrderID': [
            $(e).parent().parent().children().eq(1).text()
        ]
    }
    //SubmitByAjax(transData, '');
}
function reject(e){
    var transData = {
        'Type': 'reject',
        'OrderID': [
            $(e).parent().parent().children().eq(1).text()
        ]
    }
    //SubmitByAjax(transData, '');
}
//采购入库申请操作
function SubmitWithUrl(url){
    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url: url,                   
        success: function(result){
            if(result.Status == 'error'){
                alert('提交失败，请稍后重试...');
            }else{
                alert('提交成功！');
                refreshTable();
            }
        },
        error: function(){
            alert('提交失败，请稍后重试...');
        } 
    });
}
function purchasAeccept(e){
    var Code = $(e).parent().parent().children().eq(1).text();
    var SeqID = $(e).parent().parent().children().eq(2).text();
    var Type = 'accept';            
    var url = '.....?Code=' + Code + '&SeqID=' + SeqID + '&Type' + Type
    //SubmitWithUrl(url)
}
function purchasReject(e){
    var Code = $(e).parent().parent().children().eq(1).text();
    var SeqID = $(e).parent().parent().children().eq(2).text();
    var Type = 'reject';            
    var url = '.....?Code=' + Code + '&SeqID=' + SeqID + '&Type' + Type
    //SubmitWithUrl(url)
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 批量同意、驳回 （采购入库无该操作）
function AddToSelectedApplication(){
    selectedApplication = [];
    for(let i = 0; i < $('tbody').children().length; i++){    //将选中的夹具添加入变量数组
        if($('tbody').children().eq(i).children().eq(0).children().eq(0).prop('checked')){
            selectedApplication.push($('tbody').children().eq(i).children().eq(1).text());
        }
    }
}
$('#bulkAccept').click(function(){
    AddToSelectedApplication();
    if(selectedApplication.length == 0){
        alert('您当前还未选择任何夹具！');
    }else{
        var transData = {
            'Type': 'accept',
            'OrderID': selectedApplication
        }
        //SubmitByAjax(transData, '');
    }
});
$('#bulkReject').click(function(){
    AddToSelectedApplication();
    if(selectedApplication.length == 0){
        alert('您当前还未选择任何夹具！');
    }else{
        var transData = {
            'Type': 'reject',
            'OrderID': selectedApplication
        }
        //SubmitByAjax(transData, '');
    }
});
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