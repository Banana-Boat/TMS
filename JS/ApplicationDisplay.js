//////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 展示表格、刷新
function refreshTable(){
    $.ajax({ 
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/ApplicationList(user).json',  //后端Url，待改
        success: function(result){
            if(result.Status == 'error'){
                alert('获取数据失败，请稍后重试..');
            }else{
                $('tbody').empty();
                for(let i = 0; i < result.length; i++){
                    $('tbody').append('<tr><td>' + result[i].OrderID
                        + '</td><td>' + result[i].Type
                        + '</td><td>' + result[i].State
                        + '</td><td>' + result[i].FIID + '&nbsp&nbsp&nbsp' + result[i].FIName
                        + '</td><td>' + result[i].LIID + '&nbsp&nbsp&nbsp' + result[i].LIName
                        + '</td><td>' + result[i].ApplicationTime
                        + '</td><td><button class="btn act-btn" onclick="getInfo(this);">查看包含夹具</button>'
                        + '<button class="btn act-btn" onclick="revoke(this);">撤销</button>'
                        + '</td></tr>');
                }
            }
        },
        error: function(){
            alert('获取信息失败，请刷新重试...');
        }
    });
}
$(window).on('load', refreshTable);
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 查看包含夹具
function getInfo(e){
    let orderID = $(e).parent().parent().children().eq(0).text();
    $.ajax({ 
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/ApplicationInfo(user).json',  //orderID附在url后  "...?orderID=" + 
        success: function(result){
            if(result.Status == 'error'){
                alert('获取数据失败，请稍后重试..');
            }else{
                $('#ToolTextarea').text('');
                for(let i = 0; i < result.length; i++){          //刷新富文本框显示夹具
                    let temp = $('#ToolTextarea').text();
                    $('#ToolTextarea').text(temp + 'No.' + (i + 1) + '    ' 
                        + result[i].Code + '    ' 
                        + result[i].SeqID + '\n');
                }
                $('#ApplicationInfoModal').modal('show');
            }
        },
        error: function(){
            alert('获取信息失败，请刷新重试...');
        }
    });
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 撤销申请
function revoke(e){
    $.ajax({ 
        type: 'GET',
        dataType: 'JSON',
        url: '',                            // url待改  orderID附在url后  "...?orderID=" + 
        success: function(result){
            if(result.Status == 'error'){
                alert('撤销失败，请稍后重试..');
            }else{
                refreshTable();
                alert('撤销成功');
            }
        },
        error: function(){
            alert('撤销失败，请刷新重试...');
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