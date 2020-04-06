/////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 验证库位输入
var is_storehouse_legal = false;
var storehouse_reg1 = /[0-9]{1,2}-[a-zA-Z0-9]{2}-[0-9]{1,2}/;
var storehouse_reg2 = /[0-9]{1,2}-[a-zA-Z0-9]{2}/;
$('#StoreHouse').change(function(){
    if(storehouse_reg1.test($(this).val()) || storehouse_reg2.test($(this).val())){
        is_storehouse_legal = true;
        $(this).parent().parent().attr('class', 'panel-body has-success has-feedback');
        $(this).parent().children('span').remove();
        $(this).parent().append('<span class="glyphicon glyphicon-ok form-control-feedback" style="right: 15px;"></span>');
    }else{
        is_storehouse_legal = false;
        $(this).parent().parent().attr('class', 'panel-body has-error has-feedback');
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
$('#addStoreHouseBtn').click(function(){
    var btn = this;
    if(is_storehouse_legal){
        changeBtnStyle(btn, '添加库位');
        let transData = {
            'StoreHouse': $('#StoreHouse').val()
        }
        $.ajax({
            type: 'POST',
            dataType: 'JSON',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify(transData),
            url: '',                            //url待改  
            success: function(result){
                if(result.Status == 'error'){
                    alert('添加失败，请稍后重试...');
                }else{
                    alert('添加成功！');
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
$('#addPMContentBtn').click(function(){
    var btn = this;
    changeBtnStyle(btn, '添加点检');
    let transData = {
        'PMContent': $('#PMContent').val()
    }
    $.ajax({
        type: 'POST',
        dataType: 'JSON',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify(transData),
        url: '',                            //url待改  
        success: function(result){
            if(result.Status == 'error'){
                alert('添加失败，请稍后重试...');
            }else{
                alert('添加成功！');
            }
            changeBtnStyle(btn, '添加点检');
        },
        error: function(){
            alert('添加失败，请稍后重试...');
            changeBtnStyle(btn, '添加点检');
        }
    });
})
//#endregion