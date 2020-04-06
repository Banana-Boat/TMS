////////////////////////////////////////////////////////////////////////////////////////////////////////
var displayType = 'Definition';                //当前展示的申请类型
var defiInitData, entiInitData, userInitData;    //存放未处理的夹具定义、实体，用户信息数据
////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 上传Excel并刷新展示
function refleshTable(data, type){
    $('#' + type + 'Table').empty();
    $('#' + type + 'Table').append('<thead id="' + type + 'Thead"><tr></tr></thead>');
    for(var th in data[0]){  //设置表头
        $('#' + type + 'Thead').children('tr').append("<th>" + th + "</th>");
    }
    $('#' + type + 'Table').append('<tbody id="' + type + 'Tbody"></tbody>');
    for(var i = 0; i < data.length; i++){ 
        $('#' + type + 'Tbody').append('<tr></tr>');
        for(var td in data[i]){
            $('#' + type + 'Tbody').children('tr').eq(i).append('<td>' + data[i][td] + '</td>');
        }
    }
};
$('#upload').change(function(){
    var reader = new FileReader();
    var file = $('#upload')[0].files[0];
    if(file){
        reader.readAsBinaryString(file);
        reader.onload = function(){
            var data = this.result;
            var wb = XLSX.read(data, {type:'binary'}) //利用XLSX解析二进制文件为xlsx对象
            var initData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) //利用XLSX把wb第一个sheet转换成JSON对象
            switch(displayType){
                case 'Definition':
                    defiInitData = initData;
                    refleshTable(defiInitData, 'Definition'); 
                    break;
                case 'Entity':
                    entiInitData = initData;
                    refleshTable(entiInitData, 'Entity');
                    break;
                case 'UserInfo':
                    userInitData = initData;
                    refleshTable(userInitData, 'UserInfo');
                    break;
            }   
        }
    }
});
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 切换展示的数据类型
function changeTab(e, type){
    $('#' + displayType + 'Tab').removeClass('a-tab-active');
    $(e).addClass('a-tab-active');
    displayType = type;

    switch(type){       //刷新操作
        case 'Definition':
            $('#download').text('点击下载夹具实体EXCEL模板');
            $('#download').attr('href', '../EXCEL/夹具实体模板.xlsx');
            $('#download').attr('download', '夹具实体模板.xlsx');
            $('#DefinitionTable').show();
            $('#EntityTable').hide();
            $('#UserInfoTable').hide();
            break;
        case 'Entity':
            $('#download').text('点击下载夹具定义EXCEL模板');
            $('#download').attr('href', '../EXCEL/夹具定义模板.xlsx');
            $('#download').attr('download', '夹具定义模板.xlsx');
            $('#EntityTable').show();
            $('#DefinitionTable').hide();
            $('#UserInfoTable').hide();
            break;
        case 'UserInfo':
            $('#download').text('点击下载用户信息EXCEL模板');
            $('#download').attr('href', '../EXCEL/用户信息模板.xlsx');
            $('#download').attr('download', '用户信息模板.xlsx');
            $('#UserInfoTable').show();
            $('#EntityTable').hide();
            $('#DefinitionTable').hide();
            break;
    }
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 提交（批量导入）
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
$('#submitBtn').click(function(){
    if(defiInitData || entiInitData || userInitData){
        var Btn = this;
        changeBtnStyle(Btn, '导入');
        var transData;
        switch(displayType){
            case 'Definition':
                transData = {
                    'Type': 'definition',
                    'List': defiInitData
                }
                break;
            case 'Entity':
                transData = {
                    'Type': 'entity',
                    'List': entiInitData
                }
                break;
            case 'UserInfo':
                transData = {
                    'Type': 'userinfo',
                    'List': userInitData
                }
                break;
        }   
        /* $.ajax({
            type: 'POST',
            dataType: 'JSON',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify(transData),
            url: ,                                  //后端url待填
            success: function(result){
                if(result.Status == 'error'){
                    alert('导入失败，请稍后重试...');
                }else{
                    alert('导入成功！成功个数：' + result.Success
                          + '失败个数：' + result.Failure
                          + '重复个数：' + result.Repetition);
                    refreshTable();
                }
                changeBtnStyle(Btn, '导入');
            },
            error: function(){
                alert('导入失败，请稍后重试...');
                changeBtnStyle(Btn, '导入');
            }
        }); */
    }else{
        alert('您还未选择任何EXCEL文件');
    }
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