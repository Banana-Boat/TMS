//////////////////////////////////////////////////////////////////////////////////////////////////////
var selectedApplication = [];   //已选择的申请
var displayType = 'Out';                //当前展示的申请类型
var initData = {};
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
                initData = result;
                displayTable(initData[displayType]);
            }
        },
        error: function(){
            alert('获取信息失败，请稍后重试...');
        }
    });
}
function displayTable(data){
    $('tbody').empty();
    for(let i = 0; i < data.length; i++){
        $('tbody').append(
            '<tr><td><input class="checkbox" onchange="selectOne(this);" type="checkbox">'
            + '</td><td>' + data[i].OrderID
            + '</td><td>' + data[i].ApplicantID + '&nbsp&nbsp&nbsp' + data[i].ApplicantName
            + '</td><td>' + data[i].ApplicationTime
            + '</td><td><button class="btn act-btn" onclick="getInfo(this);">查看详情</button>'
            + '<button class="btn act-btn" onclick="accept(this);">同意</button>'
            + '<button class="btn act-btn" onclick="reject(this);">驳回</button>'
            + '</td></tr>');
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
    displayTable(initData[displayType]);
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 点击查看详情、模态窗显示、模态窗提交
function getInfo(e){
    var OrderID = $(e).parent().parent().children().eq(1).text()
    $('#OrderID').text(OrderID);
    $('#Applicant').text($(e).parent().parent().children().eq(2).text());
    $('#ApplicationTime').text($(e).parent().parent().children().eq(3).text());
    $.ajax({
        type: 'GET',
        contentType: 'application/json;charset=UTF-8',
        url: '../TestData/ApplicationInfo.json'/*  + '?OrderID=' + OrderID */,      //url待改 后附OrderID参数
        success: function(result){
            if(result.Status == 'error'){
                alert('获取信息失败，请稍后重试...');
            }else{
                $('#outBox').hide();
                $('#inBox').hide();
                $('#repairBox').hide();
                $('#scrapBox').hide();
                switch(displayType){                         //更改模态窗内容
                    case 'Out': 
                        $('#modalTitle').text('出库申请单详情');
                        $('#UserName').text(result.UserName);
                        $('#LineName').text(result.LineName);
                        $('#Check').text(result.Check);
                        $('#OutRemarks').text(result.Remarks);
                        $('#outBox').show();
                        break;
                    case 'In':
                        $('#modalTitle').text('入库申请单详情');
                        $('#InRemarks').text(result.Remarks);
                        $('#inBox').show();
                        break;
                    case 'Repair':
                        $('#modalTitle').text('报修申请单详情');
                        $('#PMContent').text(result.PMContent);
                        $('#RepairReason').text(result.Reason);
                        $('#repairBox').show();
                        break;
                    case 'Scrap':
                        $('#modalTitle').text('报废申请单详情');
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
        } 
    });
}
function acceptInModal(e){
    var transData = {
        'Type': 'accept',
        'OrderID': [
            $(e).parent().children().eq(0).children().eq(1).text()
        ]
    }
    //SubmitByAjax(transData, '');
}
function rejectInModal(e){
    var transData = {
        'Type': 'reject',
        'OrderID': [
            $(e).parent().children().eq(0).children().eq(1).text()
        ]
    }
    //SubmitByAjax(transData, '');
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
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 批量同意、驳回
function AddToSelectedApplication(){
    selectedApplication = [];
    for(let i = 0; i < $('tbody').children().length; i++){    //将选中的夹具添加入变量数组
        if($('tbody').children().eq(i).children().eq(0).children().eq(0).prop('checked')){
            selectedApplication.push($('tbody').children().eq(i).children().eq(1).text());
        }
    }
}
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
        } 
    });
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