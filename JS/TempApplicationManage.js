////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//定义全局变量
var initData = {};
var displayType = 'Out';                //当前展示的申请类型
var searchType = '';                    //搜索类型
var selectedToolModel = [];             //已选择的夹具实体
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 获取待提交申请列表、刷新待申请列表（函数）
function refreshTable(){
    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/TempApplicationList.json',  //后端Url，附加code参数
        success: function(result){
            if(result.Status == 'error'){
                alert('获取数据失败，请稍后重试..');
            }else{
                initData = result;
                
                $('#Workcell').val(initData['Workcell']);        //将申请人信息绑定至申请单
                $('#ApplicantID').val(initData['ApplicantID']);
                $('#ApplicantName').val(initData['ApplicantName']);

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
            + '</td><td>' + data[i].Code
            + '</td><td>' + data[i].SeqID
            + '</td><td>' + data[i].Name
            + '</td><td><i class="glyphicon glyphicon-remove remove-icon" onclick="remove(this);"></i></td></tr>');
    }
}

$(window).on('load', function(){
    refreshTable();
    $.ajax({                //获取故障类型与产线的字典
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/LinePMDict.json',  //后端Url，附加code参数
        success: function(result){
            if(result.Status == 'error'){
                alert('获取数据失败，请稍后重试..');
            }else{
                for(let p in result['Line']){            //将产线、故障字典绑定至下拉框
                    $('#Line').append('<option value="' 
                        + result['Line'][p] + '">' + result['Line'][p] + '</option>');
                }
                for(let p in result['PMContent']){
                    $('#PMContent').append('<option value="' 
                        + result['PMContent'][p] + '">' + result['PMContent'][p] + '</option>');
                }
            }
        },
        error: function(){
            alert('获取信息失败，请稍后重试...');
        }
    });
});
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
//#region 删除按钮
function remove(e){
    var code = $(e).parent().parent().children().eq(1).text();
    var seqID = $(e).parent().parent().children().eq(2).text();
    var transData = [];
    transData.push({'Code': code, 'SeqID': seqID, 'Type': displayType});
    $.ajax({
        type: 'POST',
        dataType: 'JSON',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify(transData),
        url: '',  //待改  后端接口
        success: function(result){
            if(result.Status == 'error'){
                alert('操作失败，请稍后重试...');
            }else{
                alert('操作成功！');
            }
        } 
    });
    displayTable(initData[displayType]);
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 查找
function chooseSearchType(e, type){
    $('#searchTypeBtn').text($(e).text());
    searchType = type;
    $('#paramInput').focus();
}

$('#searchBtn').click(function(){
    var param = $('#paramInput').val();
    switch(searchType){
        case 'Code':
            displayTable(initData[displayType].filter(item => { return item.Code == param}));
            break;
        case 'Name':
            displayTable(initData[displayType].filter(item => { return item.Name == param}));
            break;
        default:
            $('#paramInput').val('');
            displayTable(initData[displayType]);
    }
});
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 填写申请单
function showFillInModal(){
    selectedToolModel = [];
    var selectedCount = 0;        //选中夹具数
    for(let i = 0; i < $('tbody').children().length; i++){    //将选中的夹具添加入变量数组
        if($('tbody').children().eq(i).children().eq(0).children().eq(0).prop('checked')){
            selectedToolModel.push({
                'Code': $('tbody').children().eq(i).children().eq(1).text(),
                'SeqID': $('tbody').children().eq(i).children().eq(2).text()
            });
            selectedCount++;
        }
    }
    if(selectedCount == 0){
        alert('您当前还未选择任何夹具！');
        return;
    }
    $('#outInput').hide();
    $('#inInput').hide();
    $('#repairInput').hide();
    $('#scrapInput').hide();
    switch(displayType){                         //更改模态窗内容
        case 'Out': 
            $('#modalTitle').text('填写出库申请单');
            $('#UserID').val('');
            $('#Line').val('');
            $('#OutRemarks').val('');
            $('#outInput').show();
            break;
        case 'In':
            $('#modalTitle').text('填写入库申请单');
            $('#InRemarks').val('');
            $('#inInput').show();
            break;
        case 'Repair':
            $('#modalTitle').text('填写报修申请单');
            $('#PMContent').val('');
            $('#RepairReason').val('');
            $('#repairInput').show();
            break;
        case 'Scrap':
            $('#modalTitle').text('填写报废申请单');
            $('#ScrapReason').val('');
            $('#scrapInput').show();
            break;
    }

    $('#selectedModelTextarea').text('');                       //清空富文本框显示夹具  
    for(let i = 0; i < selectedToolModel.length; i++){          //刷新富文本框显示夹具
        let temp = $('#selectedModelTextarea').text();
        $('#selectedModelTextarea').text(temp + 'No.' + (i + 1) + '    ' 
            + selectedToolModel[i].Code + '    ' 
            + selectedToolModel[i].SeqID + '\n');
    }
    
    $('#fillInModal').modal('show');
}

$('#SubmitBtn').click(function(){               //提交申请单
    var Btn = this;
    changeBtnStyle(Btn, '确认提交');
    var transData = {
        'ToolModel': selectedToolModel,
        'Workcell': initData['Workcell'],
        'ApplicantID': initData['ApplicantID'],
        'ApplicantName': initData['ApplicantName']
    };
    switch(displayType){
        case 'Out':
            transData['UserID'] = $('#UserID').val();
            transData['Line'] = $('#Line').val();
            transData['Remarks'] = $('#OutRemarks').val();
            //SubmitByAjax(transData, '', Btn);
            break;
        case 'In':
            transData['Remarks'] = $('#InRemarks').val();
            //SubmitByAjax(transData, '', Btn);
            break;
        case 'Repair':
            transData['PMContent'] = $('#PMContent').val();
            transData['Reason'] = $('#RepairReason').val();
            //SubmitByAjax(transData, '', Btn);
            break;
        case 'Scrap':
            transData['Reason'] = $('#ScrapReason').val();
            //SubmitByAjax(transData, '', Btn);
            break;
    }
});

//响应时改变按钮显示
function changeBtnStyle(Btn, BtnText){
    if($(Btn).attr('disabled')){
        $(Btn).empty();
        $(Btn).text(BtnText);
        $(Btn).removeAttr('disabled');
    }else{
        $(Btn).text('');
        $(Btn).append('<i class="fa fa-spinner fa-spin fa-1x fa-fw"></i>');
        $(Btn).attr('disabled', true);
    }
}
function SubmitByAjax(data, url, Btn){
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
                $('#fillInModal').modal('hide');
                alert('提交成功！');
                refreshTable();
            }
            changeBtnStyle(Btn, '确认提交');
        },
        error: function(){
            alert('提交失败，请稍后重试...');
            changeBtnStyle(Btn, '确认提交');
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