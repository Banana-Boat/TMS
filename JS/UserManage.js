///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//全局变量
var pageSize = 20;              //一页最多显示20条信息
var jData = [];
var searchType = '';
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 展示表格  
function displayTable(data){
    $('#paginationUserInfoList').jqPaginator({
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
                let tempStr = '<tr><td>' + data[i]['UserID']
                    + '</td><td>' + data[i]['Name'];

                if(data[i]['Email'] != null)                    //邮箱可能为null
                    tempStr += '</td><td>' + data[i]['Email']
                else
                    tempStr += '</td><td>' + '/'
                
                tempStr += '</td><td>' + data[i]['Privilege']
                    + '</td><td>' + data[i]['Workcell']

                if(data[i]['LastLogin'] != null)                //最后登录时间可能为null
                    tempStr += '</td><td>' + data[i]['LastLogin']
                else
                    tempStr += '</td><td>' + '/'

                tempStr += '</td><td><button class="btn act-btn" onclick="showEditModal(this);">修改</button>'
                    + '<button class="btn act-btn" onclick="delUser(this);">删除</button>'
                    + '</td></tr>'
                $('tbody').append(tempStr);
            }
        }
    });
}
function refleshTable(){
    $.ajax({
        type: "GET",
        dataType: "JSON",
        url: "../TestData/UserInfoList.json",
        success: function(result){
            if(result.Status == 'error'){
                alert('获取数据失败，请稍后重试..');
            }else{
                displayTable(result);
                jData = result;
            }
        },
        error: function(){
            alert('获取信息失败，请稍后刷新重试...');
        }
    });
}
$(window).on('load', refleshTable());
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 查找
function chooseSearchType(e){
    $('#searchTypeBtn').text($(e).text());
    searchType = $(e).text();
    $('#paramInput').focus();
}

$('#searchBtn').click(function(){
    var param = $('#paramInput').val();
    switch(searchType){
        case 'UserID':
            displayTable(jData.filter(item => { return item.UserID == param}));
            break;
        case 'Name':
            displayTable(jData.filter(item => { return item.Name == param}));
            break;
        case 'Privilege':
            displayTable(jData.filter(item => { return item.Privilege == param}));
            break;
        case 'Workcell':
            displayTable(jData.filter(item => { return item.Workcell == param}));
            break;
        default:
            $('#paramInput').val('');
            displayTable(jData);
    }
});
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 修改用户信息
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
function showEditModal(e){
    $('#UserID').val($(e).parent().parent().children().eq(0).text());
    $('#NewPrivilege').val($(e).parent().parent().children().eq(3).text());

    $('#editModal').modal('show');
}
$('#EditBtn').click(function(){
    var Btn = this;
    changeBtnStyle(Btn, '确认修改');
    var transData = {
        'UserID': $('#UserID').val(),
        'NewPrivilege': $('#NewPrivilege').val()
    };
    /* $.ajax({
        type: 'POST',
        dataType: 'JSON',
        contentType: 'application/json',
        data: transData,
        url: '',               //待填
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
            alert('修改失败，请稍后重试...');
            changeBtnStyle(Btn, '确认修改');
        }
    }); */
});
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 删除用户信息
function delUser(e){
    var userID = $(e).parent().parent().children().eq(0).text();
    if(confirm('是否需要删除工号为' + userID + '用户？')){
        /* $.ajax({
            type: 'POST',
            dataType: 'JSON',
            url: '',               //待填  ?UserID=userID
            success: function(result){
                if(result.Status == 'success'){
                    alert('删除成功！');
                    refleshTable();
                }else{
                    alert('删除失败，请稍后重试...');
                }
            },
            error: function(){
                alert('删除失败，请稍后重试...')
            }
        }); */
    }
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 添加用户
$('#showAddModalBtn').click(function(){
    $('#addModal').modal('show');
});
$('#AddBtn').click(function(){
    var Btn = this;
    changeBtnStyle(Btn, '确认添加');
    var transData = {
        'UserID': $('#NewUserUserID').val(),
        'Name': $('#NewUserName').val(),
        'Privilege': $('#NewUserPrivilege').val()
    };
    /* $.ajax({
        type: 'POST',
        dataType: 'JSON',
        contentType: 'application/json',
        data: transData,
        url: '',                      //待填
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
            alert('添加失败，请稍后重试...');
            changeBtnStyle(Btn, '确认添加');
        }
    }); */
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