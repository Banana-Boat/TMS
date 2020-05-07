/////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 填充字典
function refreshData(){
    $('#NoticeDel').empty();
    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/NoticeList.json',  //后端Url
        success: function(result){
            if(result.Status == 'error'){
                alert('获取数据失败，请稍后重试..');
            }else{
                for(let p in result)
                    $('#NoticeDel').append('<option value="' + p + '">' + result[p] + '</option>')
            }
        },
        error: function(){
            alert('获取信息失败，请稍后重试...');
        }
    });
}
$(window).on('load', refreshData)
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
$('#addNoticeBtn').click(function(){
    var btn = this;
    changeBtnStyle(btn, '添加公告');
    let transData = {
        'Content' : $('#NoticeAdd').val()
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
                alert('添加成功！')
                refreshData();
            }
            changeBtnStyle(btn, '添加公告');
        },
        error: function(){
            alert('添加失败，请稍后重试...');
            changeBtnStyle(btn, '添加公告');
        }
    });
    
})
$('#delNoticeBtn').click(function(){
    var btn = this;
    changeBtnStyle(btn, '删除公告');
    $.ajax({
        type: 'POST',
        dataType: 'JSON',
        url: '...?id=' + $('#NoticeDel').val(),                            //url待改    后附公告ID
        success: function(result){
            if(result.Status == 'error'){
                alert('删除失败，请稍后重试...');
            }else{
                alert('删除成功！');
                refreshData();
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