/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 全局变量
var is_password_legal = true;
var is_rePassword_legal = true;
var is_email_legal = true;
var password_reg = new RegExp('^[a-zA-Z0-9]{6,12}$');
var email_reg = new RegExp('^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$');
//#endregion

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 渲染数据
function refleshData(){
    $('#UserID').text('');
    $('#Name').text('');
    $('#Email').text('');
    $('#Privilege').text('');
    $('#Workcell').text('');
    $('#LastLogin').text('');
    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/UserInfo.json',  //待改
        success: function(result){
            if(result.Status == 'error'){
                alert('获取数据失败，请稍后重试..');
            }else{
                $('#UserID').text(result.UserID);
                $('#Name').text(result.Name);
                $('#Email').text(result.Email);
                $('#Privilege').text(result.Privilege);
                $('#Workcell').text(result.Workcell);
                $('#LastLogin').text(result.LastLogin);
            }
        },
        error: function(){
            alert('数据获取失败，请稍后重试...');
        }
    });
}
$(window).on('load', refleshData());
//#endregion

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 弹出修改窗、提交修改
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
$('#showEditModal').click(function(){
    $('#modalUserID').val($('#UserID').text());
    $('#modalName').val($('#Name').text());
    $('#newEmail').val($('#Email').text());
    $('#editModal').modal('show');
});
$('#EditBtn').click(function(){
    var Btn = this;
    if(is_password_legal && is_rePassword_legal && is_email_legal){
        changeBtnStyle(Btn, '确认修改');
        var transData = {
            'UserID': $('#modalUserID').val(),
            'NewName': $('#modalName').val(),
            'NewPassword': $('#newPassword').val(),
            'NewEmail': $('#newEmail').val()
        };
        /* $.ajax({
            type: 'POST',
            dataType: 'JSON',
            contentType: 'application/json',
            data: transData,
            url: '',       //待填
            success: function(result){
                if(result.Status == 'success'){
                    alert('修改成功！');
                    refleshData();
                }else{
                    alert('修改失败，请稍后重试...');
                }
                changeBtnStyle(Btn, '确认修改');
            },
            error: function(){
                alert('修改失败，请稍后重试...');
                changeBtnStyle(Btn, '确认修改');
            }
        }); */
    }else{
        alert('请正确填写信息');
    }
});
//#endregion

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 修改窗输入框验证（姓名无验证..）
$('#newPassword').change(function(){
    if($(this).val() != ""){
        if(!password_reg.test($(this).val())){
            is_password_legal = false;
            $(this).parent().parent().attr('class', 'form-group has-error has-feedback');
            $(this).parent().children('span').remove();
            $(this).parent().append('<span class="glyphicon glyphicon-remove form-control-feedback"></span>');
        }else{
            is_password_legal = true;
            $(this).parent().parent().attr('class', 'form-group has-success has-feedback');
            $(this).parent().children('span').remove();
            $(this).parent().append('<span class="glyphicon glyphicon-ok form-control-feedback"></span>');

            is_rePassword_legal = false;
            $('#rePassword').parent().parent().attr('class', 'form-group has-error has-feedback');
            $('#rePassword').parent().children('span').remove();
            $('#rePassword').parent().append('<span class="glyphicon glyphicon-remove form-control-feedback"></span>');
        }
    }else{
        is_password_legal = true;
        $(this).parent().parent().attr('class', 'form-group');
        $(this).parent().children('span').remove();
    }
});

$('#rePassword').change(function(){
    if($(this).val() != $('#newPassword').val()){
        is_rePassword_legal = false;
        $(this).parent().parent().attr('class', 'form-group has-error has-feedback');
        $(this).parent().children('span').remove();
        $(this).parent().append('<span class="glyphicon glyphicon-remove form-control-feedback"></span>');
    }else{
        is_rePassword_legal = true;
        $(this).parent().parent().attr('class', 'form-group has-success has-feedback');
        $(this).parent().children('span').remove();
        $(this).parent().append('<span class="glyphicon glyphicon-ok form-control-feedback"></span>');
    }
});

$('#newEmail').change(function(){
    if($(this).val() != ""){
        if(!email_reg.test($(this).val())){
            is_email_legal = false;
            $(this).parent().parent().attr('class', 'form-group has-error has-feedback');
            $(this).parent().children('span').remove();
            $(this).parent().append('<span class="glyphicon glyphicon-remove form-control-feedback"></span>');
        }else{
            is_email_legal = true;
            $(this).parent().parent().attr('class', 'form-group has-success has-feedback');
            $(this).parent().children('span').remove();
            $(this).parent().append('<span class="glyphicon glyphicon-ok form-control-feedback"></span>');
        }
    }else{
        is_email_legal = true;
        $(this).parent().parent().attr('class', 'form-group');
        $(this).parent().children('span').remove();
    }
});

//#endregion