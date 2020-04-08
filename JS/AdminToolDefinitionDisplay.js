////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//定义全局变量
var initData = [];              //全体数据
var pageSize = 16;              //一页最多显示16条信息
var filterBy = {                //存放筛选条件
    'Code': '',
    'Name': '',
    'Family': '',
    'Model': ''
};   
var mod_str = '', pm_str = '';            //Family、Model字典
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 初始化/刷新表格数据
function displayTable(data){
    $('#paginationToolDeinit').jqPaginator({
        first: '<li class="first"><a href="javascript:;">首页</a></li>',
        prev: '<li class="prev"><a href="javascript:;"><<</a></li>',
        next: '<li class="next"><a href="javascript:;">>></a></li>',
        last: '<li class="last"><a href="javascript:;">末页</a></li>',
        page: '<li class="page"><a href="javascript:;">{{page}}</a></li>',
        totalPages: Math.ceil(data.length / pageSize),
        totalCounts: data.length,
        pageSize: pageSize,
        onPageChange: function(num){
            $('tbody').empty();
            var begin = (num - 1) * pageSize;
            for(var i = begin; i < data.length && i < begin + pageSize; i++){
                $('tbody').append('<tr><td>' + data[i].Code
                + '</td><td>' + data[i].Name
                + '</td><td>' + data[i].Family
                + '</td><td>' + data[i].Model
                + '</td><td>' + data[i].PartNo
                + '</td><td>' + data[i].OwnerID + '&nbsp&nbsp&nbsp' + data[i].OwnerName
                + '</td><td><button class="btn act-btn" onclick="getInfo(this);">查看详情</button>'
                + '<button class="btn act-btn" onclick="getEntity(this);">查看实体</button>'
                + '</td></tr>');
            }
        }
    });
}
function refleshTable(){
    $.ajax({                    //获取夹具定义数据
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/ToolDefinitionList.json',  //后端Url，待改
        success: function(result){
            if(result.Status == 'error'){
                alert('获取数据失败，请稍后重试..');
            }else{
                displayTable(result);
                initData = result;
            }
        },
        error: function(){
            alert('获取信息失败，请刷新重试...');
        }
    });
}
$(window).on('load', function(){
    refleshTable();

    $.ajax({                    //获取family、model字典
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/FamModPMDict.json',  //后端Url，待改
        success: function(result){           //字典数据绑定至筛选下拉框、信息修改下拉框
            if(result.Status == 'error'){
                alert('获取下拉列表数据失败，请自行填写..');
            }else{
                //说明：为查看详情时可自动将Family和Model两个下拉框补全，故采用value与text均为实际内容
                for(let p in result.Family){
                    $('#familyFilterInput').append('<option value="' + result.Family[p] + '">' + result.Family[p] + '</option>');
                    $('#Family').append('<option value="' + result.Family[p] + '">' + result.Family[p] + '</option>');
                    $('#NewFamily').append('<option value="' + result.Family[p] + '">' + result.Family[p] + '</option>');
                }
                for(let n in result.Model){
                    $('#modelFilterInput').append('<option value="' + result.Model[n] + '">' + result.Model[n] + '</option>');
                    //由于每次打开两个模态窗都会重置Model的输入，故将<option>数据暂存为字符串
                    mod_str += '<option value="' + result.Model[n] + '">' + result.Model[n] + '</option>';     
                }
                for(let n in result.PMContent){
                    pm_str += '<option value="' + result.PMContent[n] + '">' + result.PMContent[n] + '</option>'; 
                }
            }
        },
        error: function(){
            alert('获取下拉列表数据失败，请自行填写..');
            $('#familyFilterInput').replaceWith('<input class="form-control filterby-input" id="familyFilterInput" onchange="changeFilter(this, ' + "'Model'" + ');">');
            $('#modelFilterInput').replaceWith('<input class="form-control filterby-input" id="modelFilterInput" onchange="changeFilter(this, ' + "'Family'" + ');">');
        }
    })
})
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 筛选
function runFilter(e, type){  //执行筛选，并刷新展示的表格
    var tempData = initData;
    if(filterBy.Code != '')
        tempData = tempData.filter(item => {return item.Code == filterBy.Code});
    if(filterBy.Name != '')
        tempData = tempData.filter(item => {return item.Name == filterBy.Name});
    if(filterBy.Family != '')
        tempData = tempData.filter(item => {return item.Family == filterBy.Family});
    if(filterBy.Model != '')
        tempData = tempData.filter(item => {return item.Model == filterBy.Model});
    
    if(tempData.length > 0)
        displayTable(tempData);
    else{
        alert('无筛选结果..');
        $(e).val('');
        filterBy[type] = '';
    }
}
function changeFilter(e, type){  //响应绑定的控件
    filterBy[type] = $(e).val()
    runFilter(e, type);
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 筛选框动画效果、固定顶部
function showFilterInput(e){
    var inputBoxNode = $(e).parent().children().eq(1);
    var iconNode = $(e).parent().children().eq(0).children().eq(0);
    var inputNode = inputBoxNode.children().eq(0); 
    if(inputBoxNode.css('display') == 'none'){
        inputBoxNode.show(200);                                         //显示输入框
        iconNode.css("transform", "rotate(180deg)");                    //旋转图标
        iconNode.css("transition", "all 0.1s ease-in-out");             //控制旋转图标的时间
    }else{
        inputNode.val("");                                //由于直接直接设置value值不会触发changeFilter函数，故获取元素id判断
        switch(inputNode.attr('id')){
            case 'codeFilterInput':
                changeFilter(inputNode, 'Code');
                break;
            case 'nameFilterInput':
                changeFilter(inputNode, 'Name');
                break;
            case 'familyFilterInput':
                changeFilter(inputNode, 'Family');
                break;                
            case 'modelFilterInput':
                changeFilter(inputNode, 'Model');
                break;
        }                                  
        inputBoxNode.hide(200);                                  
        iconNode.css("transform", "rotate(0deg)");              
        iconNode.css("transition", "all 0.1s ease-in-out");     
    }
}

$(window).scroll(function(){
    if($(window).scrollTop() > 100)
        $('.filter-box').addClass('filter-box-sticky');
    else
        $('.filter-box').removeClass('filter-box-sticky');
})

//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 获取夹具定义的详细信息、多个模组相关事件
function getInfo(e){
    var code = $(e).parent().parent().children().eq(0).text();
    $('#ModelInputBox').empty();                             //清除可能出现的多个模组框
    $('#ModelInputBox').append('<div style="display: flex;">'
            + '<select class="form-control">' + mod_str + '</select>'
            + '<i class="fa fa-plus-circle input-group-icon-plus" onclick="AddBtn(' + "'Model'" + ');"></i>'
            + '</div>')
    $('#PMContentInputBox').empty();                             //清除可能出现的多个点检框
    $('#PMContentInputBox').append('<div style="display: flex;">'
            + '<select class="form-control">' + pm_str + '</select>'
            + '<i class="fa fa-plus-circle input-group-icon-plus" onclick="AddBtn(' + "'PMContent'" + ');"></i>'
            + '</div>')              

    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/ToolDefinitionInfo.json',  //code附在url后  "...?code=' + code
        success: function(result){
            if(result.Status == 'error'){
                alert('获取数据失败，请稍后重试..');
            }else{  
                $('#Code').val(result.Code);
                $('#Name').val(result.Name);
                $('#Family').val(result.Family);

                $('#ModelInputBox').children().children().eq(0).val(result.Model.split('/')[0]);
                for(let i = 1; i < result.Model.split('/').length; i++){
                    AddBtn("Model");
                    $('#ModelInputBox').children().last().children().eq(0).val(result.Model.split('/')[i]);
                }
                $('#PMContentInputBox').children().children().eq(0).val(result.PMContent.split('/')[0]);
                for(let i = 1; i < result.PMContent.split('/').length; i++){
                    AddBtn("PMContent");
                    $('#PMContentInputBox').children().last().children().eq(0).val(result.PMContent.split('/')[i]);
                }
                
                $('#PartNo').val(result.PartNo);
                $('#UPL').val(result.UPL);
                $('#UsedFor').val(result.UsedFor);
                $('#PMPeriod').val(result.PMPeriod);
                $('#OwnerID').val(result.OwnerID);
                $('#OwnerName').val(result.OwnerName);
                $('#RecOn').val(result.RecOn);
                $('#RecorderID').val(result.RecorderID);
                $('#RecorderName').val(result.RecorderName);
                $('#EditOn').val(result.EditOn);
                $('#EditorID').val(result.EditorID);
                $('#EditorName').val(result.EditorName);
                $('#Workcell').val(result.Workcell);

                $('#InfoModal').modal('show');
            }
        },
        error: function(){
            alert('获取数据失败，请稍后重试...')
        }
    });
}
function AddBtn(type){
    if($('#' + type + 'InputBox').children().length < 6){
        $('#' + type + 'InputBox').children().last().children().last().remove();
        let temp = '<div class="input-group">'
        + '<select class="form-control">' + (type == 'Model' ? mod_str : pm_str) + '</select>'
        + '<i class="fa fa-minus-circle input-group-icon-minus" onclick="MinusBtn(this, ' + "'" + type + "'" + ');"></i>'
        + '<i class="fa fa-plus-circle input-group-icon-plus" onclick="AddBtn(' + "'" + type + "'" + ');"></i>'
        + '</div>'
        $('#' + type + 'InputBox').append(temp);
    }
}
function MinusBtn(e, type){
    if($(e)[0] == $('#' + type + 'InputBox').children().last().children().eq(1)[0]){       //当前元素为最后一个减号
        $(e).parent().remove();
        $('#' + type + 'InputBox').children().last().append('<i class="fa fa-plus-circle input-group-icon-plus" onclick="AddBtn(' + "'" + type + "'" + ');"></i>');
    }
    $(e).parent().remove();
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 修改夹具定义信息
/* function findKey(obj, value, compare = (a, b) => a === b) {  //根据value查找key
    return Object.keys(obj).find(k => compare(obj[k], value))
} */
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
$('#EditBtn').click(function(){
    let Btn = this;
    changeBtnStyle(Btn, '确认修改');

    let tempModel = $('#ModelInputBox').children().eq(0).children().eq(0).val()     //整合model
    for(let i = 1; i < $('#ModelInputBox').children().length; i++){
        tempModel += '/' + $('#ModelInputBox').children().eq(i).children().eq(0).val();
    }

    var transData = {
        'Code': $('#Code').val(),
        'Name': $('#Name').val(),
        'Family': $('#Family').val(),
        'Model': tempModel,
        'PartNo': $('#PartNo').val(),
        'UPL': $('#UPL').val(),
        'UsedFor': $('#UsedFor').val(),
        'PMPeriod': $('#PMPeriod').val(),
        'PMContent': $('#PMContent').val(),
        'OwnerID': $('#OwnerID').val()
    };
    $.ajax({
        type: 'POST',
        dataType: 'JSON',
        contentType: 'application/json',
        data: transData,
        url: '',                                    //待改
        success: function(result){
            if(result.Status == 'success'){
                alert('修改成功！');
                refleshTable();
            }else{
                alert('修改失败，请稍后重试...');
            }
            changeBtnStyle(Btn, '确认修改');
        },
        error: function(){
            changeBtnStyle(Btn, '确认修改');
            alert('修改失败，请稍后重试...');
        }
    });
});
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 添加夹具定义信息
$('#showEntityModalBtn').click(function(){
    $('#NewModelInputBox').empty();                             //清除可能出现的多个模组框
    $('#NewModelInputBox').append('<div style="display: flex;">'
            + '<select class="form-control">' + mod_str + '</select>'
            + '<i class="fa fa-plus-circle input-group-icon-plus" onclick="NewAddBtn(' + "'Model'" + ');"></i>'
            + '</div>')  
    $('#NewPMContentInputBox').empty();                             //清除可能出现的多个模组框
    $('#NewPMContentInputBox').append('<div style="display: flex;">'
            + '<select class="form-control">' + pm_str + '</select>'
            + '<i class="fa fa-plus-circle input-group-icon-plus" onclick="NewAddBtn(' + "'PMContent'" + ');"></i>'
            + '</div>') 

    $('#EntityAddModal').modal('show');
})

$('#AddBtn').click(function(){
    let Btn = this;
    changeBtnStyle(Btn, '确认添加');

    let tempModel = $('#NewModelInputBox').children().eq(0).children().eq(0).val()     //整合model
    for(let i = 1; i < $('#NewModelInputBox').children().length; i++){
        tempModel += '/' + $('#NewModelInputBox').children().eq(i).children().eq(0).val();
    }
    let tempPMContent = $('#NewPMContentInputBox').children().eq(0).children().eq(0).val()     //整合model
    for(let i = 1; i < $('#NewPMContentInputBox').children().length; i++){
        tempPMContent += '/' + $('#NewPMContentInputBox').children().eq(i).children().eq(0).val();
    }
    var transData = {
        'Code': $('#NewCode').val(),
        'Name': $('#NewName').val(),
        'Family': $('#NewFamily').val(),
        'Model': tempModel,
        'PartNo': $('#NewPartNo').val(),
        'UPL': $('#NewUPL').val(),
        'UsedFor': $('#NewUsedFor').val(),
        'PMPeriod': $('#NewPMPeriod').val(),
        'PMContent': tempPMContent,
        'OwnerID': $('#NewOwnerID').val()
    };
    $.ajax({
        type: 'POST',
        dataType: 'JSON',
        contentType: 'application/json',
        data: transData,
        url: '',                                    //待改
        success: function(result){
            if(result.Status == 'success'){
                alert('添加成功！');
                refleshTable();
            }else{
                alert('添加失败，请稍后重试...');
            }
            changeBtnStyle(Btn, '确认添加');
        },
        error: function(){
            changeBtnStyle(Btn, '确认添加');
            alert('修改失败，请稍后重试...');
        }
    });
});
function NewAddBtn(type){
    if($('#New' + type + 'InputBox').children().length < 6){
        $('#New' + type + 'InputBox').children().last().children().last().remove();
        $('#New' + type + 'InputBox').append('<div class="input-group">'
                + '<select class="form-control">' + (type == 'Model' ? mod_str : pm_str) + '</select>'
                + '<i class="fa fa-minus-circle input-group-icon-minus" onclick="NewMinusBtn(this, ' + "'" + type + "'" + ');"></i>'
                + '<i class="fa fa-plus-circle input-group-icon-plus" onclick="NewAddBtn(' + "'" + type + "'" + ');"></i>'
                + '</div>');
    }
}
function NewMinusBtn(e, type){
    if($(e)[0] == $('#New' + type + 'InputBox').children().last().children().eq(1)[0]){       //当前元素为最后一个减号
        $(e).parent().remove();
        $('#New' + type + 'InputBox').children().last().append('<i class="fa fa-plus-circle input-group-icon-plus" onclick="NewAddBtn(' + "'" + type + "'" + ');"></i>');
    }
    $(e).parent().remove();
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 点击查看实体按钮跳转指定实体展示页面
function getEntity(e){
    var code = $(e).parent().parent().children().eq(0).text();
    window.location = '../HTML/DisplayToolEntity.html?code=' + code;
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