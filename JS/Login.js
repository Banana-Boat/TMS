/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//全局变量
var id_is_legal = false;
var pwd_is_legal = false;
var id_reg = new RegExp('^[0-9]{7}$');
var password_reg = new RegExp('^[a-zA-Z0-9]{6,12}$');
var is_visitor = false;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 填充workcell下拉框
$(window).on('load', function(){
    $.ajax({                            
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/WorkcellList.json',                        //url待改
        success: function(result){
            if(result.Status == 'error'){
                $('#Workcell').replaceWith('<input class="form-control" type="text" id="Workcell">');
                $('#systemInitDelWorkcellInput').replaceWith('<input class="form-control" type="text" id="systemInitDelWorkcellInput">')
            }else{
                for(let i = 0; i < result.length; i++){
                    $('#Workcell').append('<option value="' + result[i]
                        + '">' + result[i] + '</option>');
                    $('#systemInitDelWorkcellInput').append('<option value="' + result[i]
                        + '">' + result[i] + '</option>');
                }
            }
        },
        error: function(){
            $('#Workcell').replaceWith('<input class="form-control" type="text" id="Workcell">')
            $('#systemInitDelWorkcellInput').replaceWith('<input class="form-control" type="text" id="systemInitDelWorkcellInput">')
        }
    });
})
//#endregion

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 若存在cookie读入cookie
$(window).on('load', function(){
    if($.cookie('UserID')){
        $('#UserID').val($.cookie('UserID'));
        $('#Password').val($.cookie('Password'));
        $('#rememberCheckbox').prop('checked', true);
        id_is_legal = true;
        pwd_is_legal = true;
    }
})
//#endregion

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 登录窗校验
$('#UserID').change(function(){
    if(!id_reg.test($('#UserID').val())){
        id_is_legal = true;
        $('#tip').text("请输入正确格式的工号");
        $('#tip').css('display', 'block');
    }else{
        id_is_legal = true;
        $('#tip').css('display', 'none');
    }
});
$('#Password').change(function(){
    if(!password_reg.test($('#Password').val())){
        pwd_is_legal = true;
        $('#tip').text("请输入正确格式的密码");
        $('#tip').css('display', 'block');
    }else{
        pwd_is_legal = true;
        $('#tip').css('display', 'none');
    }
});
function validate(){
    if(id_is_legal == true && pwd_is_legal == true){
        return true;
    }else{
        return false;
    }
}
//#endregion

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 三种不同情况登录、首次登陆更改初始密码
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
//普通登录
function commonLogin(){
    var Btn = $('#loginBtn');
    if(validate()){
        changeBtnStyle(Btn, '登录');
        var transData = {
            'UserID': $('#UserID').val(),
            'Password': $('#Password').val()
        }
        /* $.ajax({                            //url待改
            type: 'POST',
            dataType: 'JSON',
            contentType: 'application/json',
            data: JSON.stringify(transData),
            url: '',
            success: function(result){
                if(result.Status == 'success'){
                    if($('#rememberCheckbox').prop('checked')){     //选择记住账号密码
                        $.cookie('UserID', $('#UserID').val());
                        $.cookie('Password', $('#Password').val());
                    }else{                                          //没有勾选
                        if($.cookie('UserID')){                     //上次登录勾选，需删除
                            $.removeCookie('UserID');
                            $.removeCookie('Password');
                        }
                    }
                    window.location = '';              //url待改
                }else if(result.Status == 'choose'){
                    $('#chooseWorkcellModal').modal('show');
                }
                else if(result.Status == 'first'){     //用户首次登录，需更改初始密码
                    $('#setPwModal').modal('show');
                }
                else{
                    alert('登录失败，请稍后重试...');
                }
                changeBtnStyle(Btn, '登录');
            },
            error: function(){
                alert('登录失败，请稍后重试...');
                changeBtnStyle(Btn, '登录');
            }
        }) */
    }
}
$('#loginBtn').click(commonLogin)
$(window).keypress(function(event){     //回车直接登录
    if(event.which == 13)
        commonLogin();
})
//选择工作部门后登录
$('#workcellSubmitBtn').click(function(){    
    var Btn = this;  
    changeBtnStyle(Btn, '登录'); 
    if(is_visitor){                     //游客登录
        let transData = {
            'Workcell': $('#Workcell').val()
        };
        /* $.ajax({                           
            type: 'POST',
            dataType: 'JSON',
            contentType: 'application/json',
            data: JSON.stringify(transData),
            url: ,     //url待改
            success: function(result){
                if(result.Status == 'success'){
                    window.location = '';                    //url待改
                }
                else{
                    alert('登录失败，请稍后重试...');
                }
                changeBtnStyle(Btn, '登录'); 
            },
            error: function(){
                alert('登录失败，请稍后重试...');
                changeBtnStyle(Btn, '登录');
            }
        }); */
    }else{                              //非游客登录
        let transData = {
            'UserID': $('#UserID').val(),
            'Password': $('#Password').val(),
            'Workcell': $('#Workcell').val()
        };
        $.ajax({                           
            type: 'POST',
            dataType: 'JSON',
            contentType: 'application/json',
            data: JSON.stringify(transData),
            url: '',                                   //url待改
            success: function(result){
                if(result.Status == 'success'){
                    window.location = '';              //url待改
                }
                else if(result.Status == 'first'){     //用户首次登录，需更改初始密码
                    $('##chooseWorkcellModal').modal('hide');
                    $('#setPwModal').modal('show');
                }
                else{
                    alert('登录失败，请稍后重试...');
                }
                changeBtnStyle(Btn, '登录'); 
            },
            error: function(){
                alert('登录失败，请稍后重试...');
                changeBtnStyle(Btn, '登录');
            }
        })
    }
})

//游客登录
$('#visitorLoginBtn').click(function(){  
    is_visitor = true;
    $('#chooseWorkcellModal').modal('show');      
})
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 首次登录更改初始密码

//输入框验证
var is_password_legal = false;
var is_rePassword_legal = false;
$('#newPassword').change(function(){
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

//点击提交
$('#newPwBtn').click(function(){
    var Btn = this;  
    var transData = {
        'UserID': $('#UserID').val(),
        'NewPassword': $('#newPassword').val()
    };
    if(is_password_legal && is_rePassword_legal){
        changeBtnStyle(Btn, '提交');
      /*$.ajax({                           
            type: 'POST',
            dataType: 'JSON',
            contentType: 'application/json',
            data: JSON.stringify(transData),
            url: '',                                   //url待改
            success: function(result){
                if(result.Status == 'success'){
                    window.location = '';              //url待改
                }
                else{
                    alert('登录失败，请稍后重试...');
                }
                changeBtnStyle(Btn, '提交');
            },
            error: function(){
                alert('登录失败，请稍后重试...');
                changeBtnStyle(Btn, '提交');
            }
        }) */
    }
})
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 申请重置密码（模态窗）
$('#resetPassword').click(function(){
    $('#resetPwModal').modal('show');
});

var _id_is_legal = false;
var email_is_legal = false;
var valiNum_is_legal = false;
var email_reg = new RegExp('^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$');
var valiNum_reg = new RegExp('^[0-9]{4}$');

$('#_UserID').change(function(){
    if(!id_reg.test($(this).val())){
        _id_is_legal = true;
        $('#_tip').text("请输入正确格式的工号");
        $('#_tip').css('display', 'block');
    }else{
        _id_is_legal = true;
        $('#_tip').css('display', 'none');
    }
});

$('#Email').change(function(){
    if(!email_reg.test($(this).val())){
        email_is_legal = false;
        $('#_tip').text("请输入正确格式的邮箱");
        $('#_tip').css('display', 'block');
    }else{
        email_is_legal = true;
        $('#_tip').css('display', 'none');
    }
});

//点击获取验证码按钮的事件
$('#getNum').click(function(){
    if(_id_is_legal && email_is_legal){
        var time = 60;    //60s内不可重复获取验证码
        $(this).attr('disabled', 'disabled');
        
        var json_data = {     //构造json
            'UserID': $('#_UserID').val(),
            'Email': $('#Email').val()  
        };
        $.ajax({              //向后端发送工号与该工号的绑定邮箱（json）
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(json_data),
            url: '',           //后端action
            success: function(result){
                if(result.Status == 'error')
                    alert('您未绑定该邮箱，请检查邮箱填写或直接联系管理员');
            }
        });

        var timer = setInterval(function(){
            if(time == 0){
                $('#getNum').removeAttr('disabled');
                $('#getNum').html('再次获取');
                clearInterval(timer);
            }else{
                $('#getNum').html(time + 's');
                time--;
            }
        }, 1000);
    }
});

$('#valiNum').change(function(){
    if(!valiNum_reg.test($(this).val())){
        valiNum_is_legal = false;
        $('#_tip').text("请输入正确格式的验证码");
        $('#_tip').css('display', 'block');
    }else{
        valiNum_is_legal = true;
        $('#_tip').css('display', 'none');
    }
});

//点击提交申请按钮事件
$('#valiBtn').click(function(){
    var Btn = this;
    if(_id_is_legal && email_is_legal && valiNum_is_legal){
        changeBtnStyle(Btn, '提交申请');
        var json_data = {
            'UserID': $('#_UserID').val(),
            'Email': $('#Email').val(),
            'ValiNum': $('#valiNum').val()
        };
        $.ajax({              
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(json_data),
            url: '',           //后端action
            success:function(result){
                if(result.Status == 'success'){
                    alert('已成功向管理员提交重置密码申请，请耐心等待通知！');
                }else{
                    alert('申请提交失败，请自行告知管理员...');
                }
                changeBtnStyle(Btn, '提交申请');
            },
            error: function(){
                alert('申请提交失败，请自行告知管理员...');
                changeBtnStyle(Btn, '提交申请');
            }
        });
    }
});
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 系统初始

//输入框验证
var is_privatekey_legal = false;
var is_initpsw_legal = false;
var is_reinitpsw_legal = false;

//Ctrl+i显示系统初始窗
$(window).keypress(function(event){         
    if(event.which == 9){
        /* 模态窗初始化  */
        $('#privateKeyInput').val('');
        $('#systemInitAddWorkcellInput').val('');
        $('#hasAccountInput').prop('checked', false);
        $('#systemInitUserIDInput').val('');
        $('#systemInitPswInput').val('');
        $('#systemInitRepswInput').val('');
        is_privatekey_legal = false
        is_initpsw_legal = false;
        is_reinitpsw_legal = false;
        $('#systemInitRepswBox').show();

        $('#systemInitModal').modal('show');
    }
});

$('#privateKeyInput').change(function(){                //私钥验证
    if($(this).val() == ''){
        is_privatekey_legal = false;
        $(this).parent().parent().attr('class', 'form-group has-error has-feedback');
        $(this).parent().children('span').remove();
        $(this).parent().append('<span class="glyphicon glyphicon-remove form-control-feedback"></span>');
    }else{
        is_privatekey_legal = true;
        $(this).parent().parent().attr('class', 'form-group has-success has-feedback');
        $(this).parent().children('span').remove();
        $(this).parent().append('<span class="glyphicon glyphicon-ok form-control-feedback"></span>');
    }
});
$('#systemInitValiBtn').click(function(){                   //验证私钥
    var Btn = this;
    if(is_privatekey_legal){ 
        changeBtnStyle(Btn, '验证');       
        var transData = {
            'PrivateKey': $('#privateKeyInput').val()
        };
        $.ajax({ 
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(transData),
            url: '',           //url待改
            success: function(result){
                if(result.Status == 'error'){
                    alert('验证失败..');
                }
                else{
                    alert('验证成功！');
                    $('#systemInitOperBox').show();
                    $('#systemInitValiBox').hide();
                }
                changeBtnStyle(Btn, '验证');
            },
            error: function(){
                alert('验证失败..');
                changeBtnStyle(Btn, '验证');
            }
        });
    }
})

$('#systemInitPswInput').change(function(){             //密码验证
    if(!password_reg.test($(this).val())){
        is_initpsw_legal = false;
        $(this).parent().parent().attr('class', 'form-group has-error has-feedback');
        $(this).parent().children('span').remove();
        $(this).parent().append('<span class="glyphicon glyphicon-remove form-control-feedback"></span>');
    }else{
        is_initpsw_legal = true;
        $(this).parent().parent().attr('class', 'form-group has-success has-feedback');
        $(this).parent().children('span').remove();
        $(this).parent().append('<span class="glyphicon glyphicon-ok form-control-feedback"></span>');
    }
});

$('#systemInitRepswInput').change(function(){           //确认密码验证
    if($(this).val() != $('#systemInitPswInput').val()){
        is_reinitpsw_legal = false;
        $(this).parent().parent().attr('class', 'form-group has-error has-feedback');
        $(this).parent().children('span').remove();
        $(this).parent().append('<span class="glyphicon glyphicon-remove form-control-feedback"></span>');
    }else{
        is_reinitpsw_legal = true;
        $(this).parent().parent().attr('class', 'form-group has-success has-feedback');
        $(this).parent().children('span').remove();
        $(this).parent().append('<span class="glyphicon glyphicon-ok form-control-feedback"></span>');
    }
});

$('#hasAccountInput').change(function(){
    if($(this).prop('checked')){
        $('#systemInitRepswBox').hide();
        is_reinitpsw_legal = true;
    }else{
        $('#systemInitRepswBox').show();
    }
})
$('#addWorkcellBtn').click(function(){
    var Btn = this;
    if(is_initpsw_legal && is_reinitpsw_legal){ 
        changeBtnStyle(Btn, '添加');       
        var transData = {
            'Workcell': $('#systemInitAddWorkcellInput').val(),
            'UserID': $('#systemInitUserIDInput').val(),
            'Password': $('#systemInitPswInput').val(),
            'HasAccount': $('#hasAccountInput').prop('checked')
        };
        $.ajax({ 
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(transData),
            url: '',           //url待改
            success: function(result){
                if(result.Status == 'error'){
                    alert('添加失败..');
                }
                else{
                    $('#systemInitModal').modal('hide');
                    alert('添加成功！');
                }
                changeBtnStyle(Btn, '添加');
            },
            error: function(){
                alert('添加失败..');
                changeBtnStyle(Btn, '添加');
            }
        });
    }
})
$('#delWorkcellBtn').click(function(){
    var Btn = this;
    changeBtnStyle(Btn, '删除'); 
    $.ajax({ 
        type: 'GET',
        contentType: 'application/json',
        url: '' + $('#systemInitDelWorkcellInput').val(),           //url后附删除的工作部门名
        success: function(result){
            if(result.Status == 'error'){
                alert('删除失败..');
            }
            else{
                $('#systemInitModal').modal('hide');
                alert('删除成功！');
            }
            changeBtnStyle(Btn, '删除');
        },
        error: function(){
            alert('删除失败..');
            changeBtnStyle(Btn, '删除');
        }
    });
})
//#endregion
