////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var displayType = 'Out';                //当前展示的申请类型
var initData = {};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 获取待审核申请列表、刷新列表（函数）
function refreshTable(url){
    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url: url,  //后端Url待改
        success: function(result){
            if(result.Status == 'error'){
                alert('获取数据失败，请稍后重试..');
            }else{
                function compare(a, b){
                    return -a.ApplicationTime.localeCompare(b.ApplicationTime);
                }
                for(let p in result){                //将实体数据按照申请时间排序
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
    $('#' + displayType + 'Tbody').empty();
    if(data != null){
        if(data.length > 0){
            switch(displayType){
                case 'Out':
                    for(let i = 0; i < data.length; i++){
                        $('#' + displayType + 'Tbody').append(
                            '<tr><td>' + data[i].OrderID
                            + '</td><td>' + data[i].ApplicantID + '&nbsp&nbsp&nbsp' + data[i].ApplicantName
                            + '</td><td>' + data[i].ApplicationTime
                            + '</td><td>' + data[i].UserID + '&nbsp&nbsp&nbsp' + data[i].UserName
                            + '</td><td>' + data[i].Remarks
                            + '</td></tr>');
                    }
                    break;
                case 'In':
                    for(let i = 0; i < data.length; i++){
                        $('#' + displayType + 'Tbody').append(
                            '<tr><td>' + data[i].OrderID
                            + '</td><td>' + data[i].ApplicantID + '&nbsp&nbsp&nbsp' + data[i].ApplicantName
                            + '</td><td>' + data[i].ApplicationTime
                            + '</td><td>' + data[i].Remarks
                            + '</td></tr>');
                    }
                    break;
                case 'Repair':
                    for(let i = 0; i < data.length; i++){
                        $('#' + displayType + 'Tbody').append(
                            '<tr><td>' + data[i].OrderID
                            + '</td><td>' + data[i].ApplicantID + '&nbsp&nbsp&nbsp' + data[i].ApplicantName
                            + '</td><td>' + data[i].ApplicationTime
                            + '</td><td>' + data[i].ReviewerID + '&nbsp&nbsp&nbsp' + data[i].ReviewerName
                            + '</td><td>' + data[i].PMContent
                            + '</td><td>' + data[i].Reason
                            + '</td></tr>');
                    }
                    break;
                case 'Check':
                    for(let i = 0; i < data.length; i++){
                        $('#' + displayType + 'Tbody').append(
                            '<tr><th>' + (i + 1).toString()
                            + '</th><td>' + data[i].ExaminerID + '&nbsp&nbsp&nbsp' + data[i].ExaminerName
                            + '</td><td>' + data[i].ApplicationTime
                            + '</td></tr>');
                    }
                    break;
            }
        }
    }
}

$(window).on('load', function(){
    if($.cookie('code_toolapplication')){                           //如果是从实体展示页面跳转来。则直接读取cookie中的code与seqid并查询
        let Code = $.cookie('code_toolapplication');
        let SeqID = $.cookie('seqid_toolapplication');

        $('#CodeInput').val(Code);
        $('#SeqIDInput').val(SeqID);

        refreshTable('../TestData/ToolApplicationList.json')        //后附code和seqid

        $.removeCookie('code_toolapplication');                     //清除cookie
        $.removeCookie('seqid_toolapplication');
    }

    $.timeliner({
        startOpen:[]
    });
    $(".CBmodal").colorbox({inline:true, initialWidth:100, maxWidth:682, initialHeight:100, transition:"elastic",speed:750});
});
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 切换展示的申请类型
function changeTab(e, type){
    $('#' + displayType + 'Tab').removeClass('a-tab-active');
    $(e).addClass('a-tab-active');
    $('#' + displayType + 'Table').hide();
    $('#' + type + 'Table').show();
    displayType = type;
    displayTable(initData[displayType], displayType);
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 模态窗查看夹具的生命周期使用情况
$('#danglingShow').click(function(){
    $('#timelineContent').empty();
    let Code = $('#CodeInput').val();
    let SeqID = $('#SeqIDInput').val();
    if(Code != '' && SeqID != ''){
        $.ajax({
            type: 'GET',
            dataType: 'JSON',
            url: '../TestData/ToolLifecycleList.json',  //Code与SeqID 附后端Url
            success: function(result){
                if(result.Status == 'error'){
                    alert('获取数据失败，请稍后重试..');
                }else{
                    result.forEach(element => {
                        let tempStr = '<div class="timelineMajor"><h2 class="timelineMajorMarker"><span>' + element.YearMonth + '</span></h2>'
                        element.List.forEach(item => {
                            let iconClass = ''
                            let typeChinese = ''
                            let item_id = item.Date.split('/')[0] + item.Date.split('/')[1] + item.Date.split('/')[2]
                            switch (item.Type) {
                                case 'Purchase':
                                    iconClass = 'fa fa-shopping-cart'
                                    typeChinese = '采购入库'
                                    break;
                                case 'Out':
                                    iconClass = 'fa fa-sign-out'
                                    typeChinese = '出库'
                                    break;
                                case 'In':
                                    iconClass = 'fa fa-sign-in'
                                    typeChinese = '入库'
                                    break;
                                case 'Repair':
                                    iconClass = 'fa fa-wrench'
                                    typeChinese = '报修'
                                    break;
                                case 'Scrap':
                                    iconClass = 'fa fa-trash'
                                    typeChinese = '报废'
                                    break;
                            }
    
                            tempStr += '<dl class="timelineMinor"><dt id="' + item_id + '"><a><i class="' + iconClass + '"></i>&nbsp;&nbsp;' + typeChinese
                                + ' - ' + item.Date + '</a></dt><dd class="timelineEvent" id="' + item_id + 'EX" style="display:none;">'
                                + item.Content + '</dd></dl>'
                        })
                        tempStr += '</div>'
                        $('#timelineContent').append(tempStr)
                    });
                    $('#lifecycleModal').modal('show');
                }
            },
            error: function(){
                alert('获取数据失败，请稍后重试..');
            }
        });
    }
})
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 查找按钮点击事件
$('#searchBtn').click(function(){
    let Code = $('#CodeInput').val();
    let SeqID = $('#SeqIDInput').val();
    refreshTable('')
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