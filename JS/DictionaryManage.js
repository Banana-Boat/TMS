/////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 填充字典
function refreshDictionary(){
    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/StoPMFamModParDict.json',  //后端Url
        success: function(result){
            if(result.Status == 'error'){
                alert('获取数据失败，请稍后重试..');
            }else{
                function addToDataList(type){
                    $('#' + type + 'Del').empty();
                    for(let p in result[type])
                        $('#' + type + 'Del').append('<option value="' + result[type][p] + '">' + result[type][p] + '</option>')
                }
                addToDataList('StoreHouse');
                addToDataList('PMContent');
                addToDataList('Line');
                addToDataList('Family');
                addToDataList('Model');
                addToDataList('PartNo');
            }
        },
        error: function(){
            alert('获取信息失败，请稍后重试...');
        }
    });
}
$(window).on('load', refreshDictionary)
//#endregion

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 验证库位输入
var is_storehouse_legal = false;
var storehouse_reg1 = /[0-9]{1,2}-[a-zA-Z0-9]{2}-[0-9]{1,2}/;
var storehouse_reg2 = /[0-9]{1,2}-[a-zA-Z0-9]{2}/;
$('#StoreHouseAdd').change(function(){
    if(storehouse_reg1.test($(this).val()) || storehouse_reg2.test($(this).val())){
        is_storehouse_legal = true;
        $(this).parent().parent().attr('class', 'form-group has-success has-feedback');
        $(this).parent().children('span').remove();
        $(this).parent().append('<span class="glyphicon glyphicon-ok form-control-feedback" style="right: 15px;"></span>');
    }else{
        is_storehouse_legal = false;
        $(this).parent().parent().attr('class', 'form-group has-error has-feedback');
        $(this).parent().children('span').remove();
        $(this).parent().append('<span class="glyphicon glyphicon-remove form-control-feedback" style="right: 15px;"></span>');
    }
});
//#endregion

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 添加事件
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
function ThreeEvent(type, zhongwen){
    $('#add' + type + 'Btn').click(function(){
        var btn = this;
        changeBtnStyle(btn, '添加' + zhongwen);
        let transData = {
            'Type': type,
            'Content' : $('#' + type + 'Add').val()
        }
        $.ajax({
            type: 'POST',
            dataType: 'JSON',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify(transData),
            url: url,                                         
            success: function(result){
                if (result.Status == 'error') {
                    alert('添加失败，请稍后重试...');
                }else {
                    alert('添加成功！')
                    refreshDictionary();
                }
                changeBtnStyle(btn, '添加' + zhongwen);
            },
            error: function(){
                alert('添加失败，请稍后重试...');
                changeBtnStyle(btn, '添加' + zhongwen);
            }
        });
    })
    $('#del' + type + 'Btn').click(function(){
        var btn = this;
        changeBtnStyle(btn, '删除' + zhongwen);
        let transData = {
            'Type': type,
            'Content': $('#' + type + 'Del').val()
        }
        $.ajax({
            type: 'POST',
            dataType: 'JSON',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify(transData),
            url: url,                            //url待改  
            success: function(result){
                if(result.Status == 'error'){
                    alert('删除失败，请稍后重试...');
                }else{
                    alert('删除成功！');
                    refreshDictionary();
                }
                changeBtnStyle(btn, '删除' + zhongwen);
            },
            error: function(){
                alert('删除失败，请稍后重试...');
                changeBtnStyle(btn, '删除' + zhongwen);
            }
        });
    })
}

//第三个参数为url       接口可不同
ThreeEvent('PMContent', '点检')
ThreeEvent('Line', '产线')
ThreeEvent('Family', '大类')
ThreeEvent('Model', '模组')
ThreeEvent('PartNo', '料号')


$('#addStoreHouseBtn').click(function(){
    var btn = this;
    if(is_storehouse_legal){
        changeBtnStyle(btn, '添加库位');
        let transData = {
            'Type': 'StoreHouse',
            'Content' : $('#StoreHouseAdd').val()
        }
        $.ajax({
            type: 'POST',
            dataType: 'JSON',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify(transData),
            url: '',                                         
            success: function(result){
                if (result.Status == 'error') {
                    alert('添加失败，请稍后重试...');
                }else {
                    alert('添加成功！ 成功个数：' + result.Success + ' 失败个数：' + result.Failure + ' 重复个数：' + result.Repetition);
                    refreshDictionary();
                }
                changeBtnStyle(btn, '添加库位');
            },
            error: function(){
                alert('添加失败，请稍后重试...');
                changeBtnStyle(btn, '添加库位');
            }
        });
    }
})
$('#delStoreHouseBtn').click(function(){
    var btn = this;
    changeBtnStyle(btn, '删除库位');
    let transData = {
        'Type': 'StoreHouse',
        'Content': $('#StoreHouseDel').val()
    }
    $.ajax({
        type: 'POST',
        dataType: 'JSON',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify(transData),
        url: '',                            //url待改  
        success: function(result){
            if(result.Status == 'error'){
                alert('删除失败，请稍后重试...');
            }else{
                alert('删除成功！');
                refreshDictionary();
            }
            changeBtnStyle(btn, '删除库位');
        },
        error: function(){
            alert('删除失败，请稍后重试...');
            changeBtnStyle(btn, '删除库位');
        }
    });
})
//#endregion