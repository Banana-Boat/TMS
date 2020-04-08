////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//定义全局变量
var initData = [];
var searchType = '';
var bulkOperType = '';
var cacheTbodyType = 'Out';
var pageSize = 20;              //一页最多显示16条信息
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 获取定义列表、刷新待申请列表（函数）
$(window).on('load', function(){
    refreshTable();
    refreshCache();
});
function refreshTable(){
    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/ToolEntityList.json',  //后端Url
        success: function(result){
            if(result.Status == 'error'){
                alert('获取数据失败，请稍后重试..');
            }else{
                function compare(a, b){
                    if(a.State == '可用' && b.State == '可用')  return 0;
                    else if(a.State == '可用')  return -5;
                    else if(b.State == '可用')  return 5;
                    else    return a.State.localeCompare(b.State);
                }
                initData = result.sort(compare);    //将实体数据按照状态排序  可用放最前
                displayTable(initData);
            }
        },
        error: function(){
            alert('获取信息失败，请稍后重试...');
        }
    });
}
function displayTable(data){                                                
    $('#paginationToolEntity').jqPaginator({
        first: '<li class="first"><a href="javascript:;">首页</a></li>',
        prev: '<li class="prev"><a href="javascript:;"><<</a></li>',
        next: '<li class="next"><a href="javascript:;">>></a></li>',
        last: '<li class="last"><a href="javascript:;">末页</a></li>',
        page: '<li class="page"><a href="javascript:;">{{page}}</a></li>',
        totalPages: Math.ceil(data.length / pageSize),
        totalCounts: data.length,
        pageSize: pageSize,
        onPageChange: function(num){
            $('#definitionTbody').empty();
            var begin = (num - 1) * pageSize;
            var n = 1;
            for(var i = begin; i < data.length && i < begin + pageSize; i++){
                var appendData = 
                    '<tr><th>' + n
                    + '</th><td>' + data[i].Code
                    + '</td><td>' + data[i].SeqID
                    + '</td><td>' + data[i].RegDate
                    + '</td><td>' + data[i].UsedCount
                    + '</td><td>' + data[i].State
                    + '</td><td><button class="btn act-btn" onclick="getInfo(this);">查看详情</button>';
                
                switch(data[i].State){    //根据夹具不同状态设定不同的操作
                    case '可用':
                        appendData += '<button class="btn act-btn" onclick="addToOut(this);">出库</button>'
                        + '<button class="btn act-btn" onclick="addToRepair(this);">报修</button>'
                        + '<button class="btn act-btn" onclick="addToScrap(this);">报废</button></td></tr>';
                        $('#definitionTbody').append(appendData);
                        break;
                    case '待入库':
                        appendData += '<button class="btn act-btn" onclick="addToIn(this);">入库</button>'
                        + '<button class="btn act-btn" onclick="addToRepair(this);">报修</button>'
                        + '<button class="btn act-btn" onclick="addToScrap(this);">报废</button></td></tr>';
                        $('#definitionTbody').append(appendData);
                        break;
                    case '已报修':
                        appendData += '<button class="btn act-btn" onclick="addToIn(this);">入库</button>'
                        + '<button class="btn act-btn" onclick="addToScrap(this);">报废</button></td></tr>';
                        $('#definitionTbody').append(appendData);
                        break;
                    case '已报废':
                        appendData += '</td></tr>';
                        $('#definitionTbody').append(appendData);
                        break;
                }
                n++;   //当前页面序号
            }
        }
    });
}
function refreshCache(){
    $('#outTbody').empty();
    $('#inTbody').empty();
    $('#repairTbody').empty();
    $('#scrapTbody').empty();
    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/CacheList.json',   //待改  后端URL
        success: function(result){
            if(result.Status == 'error'){
                alert('获取数据失败，请稍后重试..');
            }else{
                function addToCacheTbody(tbodyID, len, array){    //将数据分类归入不同表格
                    for(var i = 0; i < len; i++){
                        $('#' + tbodyID).append('<tr><td>' + array[i].Code
                        + '</td><td>' + array[i].SeqID
                        + '</td><td><i class="glyphicon glyphicon-remove cache-remove-icon" onclick="remove(this);"></i></td></tr>')
                    }
                }
                addToCacheTbody('outTbody', result.Out.length, result.Out);
                addToCacheTbody('inTbody', result.In.length, result.In);
                addToCacheTbody('repairTbody', result.Repair.length, result.Repair);
                addToCacheTbody('scrapTbody', result.Scrap.length, result.Scrap);
            }
        },
        error: function(){
            alert('待提交申请中，部分夹具被其他用户操作，系统已自动将其去除');
        }
    });
}
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
        case '按使用次数':
            displayTable(initData.filter(item => { return item.UsedCount == param}));
            break;
        case '按夹具状态':
            displayTable(initData.filter(item => { return item.State == param}));
            break;
        default:
            $('#paramInput').val('');
            displayTable(initData);
    }
});
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 批量加入申请列表
function submitByAjax(data){          //url待填
    $.ajax({
        type: 'POST',
        dataType: 'JSON',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify(data),
        url: '',  
        success: function(result){
            if(result.Status == 'error'){
                alert('操作失败，请稍后重试...');
            }else{
                alert('操作成功！');
                refreshCache();
                refreshTable();
            }
        },
        error: function(){
            alert('操作失败，请稍后重试...');
        }
    });
}
function chooseBulkOperType(e){
    $('#bulkOperTypeBtn').text($(e).text());
    bulkOperType = $(e).text();
    $('#num1Input').focus();
}
$('#bulkOperBtn').click(function(){
    var transData = [];
    var displayedData = $('#definitionTbody').children();
    var num1 = Number.parseInt($('#num1Input').val());
    var num2 = Number.parseInt($('#num2Input').val());
    try{
        if(!(num1 >= 1 && num2 <= pageSize && num1 <= num2 && Number.isInteger(num1)) && Number.isInteger(num2))
            throw '序号格式错误';
        switch(bulkOperType){
            case '出库':
                for(let i = num1; i < num2; i++){
                    let state = displayedData.eq(i).children().eq(5).text();
                    if(state == '可用')
                        transData.push({
                            'Code': displayedData.eq(i).children().eq(1).text(),
                            'SeqID': displayedData.eq(i).children().eq(2).text(),
                            'Type': 'Out'
                        });
                    else    throw '夹具选择错误';
                }
                break;
            case '入库':
                for(let i = num1; i < num2; i++){
                    let state = displayedData.eq(i).children().eq(5).text();
                    if(state == '已报修')
                        transData.push({
                            'Code': displayedData.eq(i).children().eq(1).text(),
                            'SeqID': displayedData.eq(i).children().eq(2).text(),
                            'Type': 'Out'
                        });
                    else    throw '夹具选择错误';
                }
                break;
            case '报废':
                for(let i = num1; i < num2; i++){
                    let state = displayedData.eq(i).children().eq(5).text();
                    if(state != '已报废')
                        transData.push({
                            'Code': displayedData.eq(i).children().eq(1).text(),
                            'SeqID': displayedData.eq(i).children().eq(2).text(),
                            'Type': 'Out'
                        });
                    else    throw '夹具选择错误';
                }
                break;
        }
        submitByAjax(transData);
    }
    catch(err){
        alert(err + '，请重新填写...');
    } 
})
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 获取夹具定义的详细信息
function getInfo(e){
    var code = $(e).parent().parent().children().eq(0).text();
    var seqID = $(e).parent().parent().children().eq(1).text();
    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/ToolEntityInfo.json',  //code附在url后  '...?Code=' + code + '&SeqID=' + seqID
        success: function(result){
            if(result.Status == 'error'){
                alert('获取数据失败，请稍后重试..');
            }else{
                $('#Code').text(result.Code);
                $('#SeqID').text(result.SeqID);
                $('#Buyoff').text(result.Buyoff);
                $('#RegDate').text(result.RegDate);
                $('#UsedCount').text(result.UsedCount);
                $('#State').text(result.State);
                $('#BillNo').text(result.BillNo);
                $('#StoreHouse').text(result.StoreHouse);
                $('#LastTestTime').text(result.LastTestTime);
                $('#TotalUsedTime').text(result.TotalUsedTime);
                $('#Image').attr('src', result.Image);
                
                $('#InfoModal').modal('show');
            }
        },
        error: function(){
            alert('获取数据失败，请稍后重试...')
        }
    });
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region  加入临时申请列表
// 加入出库单
function addToOut(e){
    var code = $(e).parent().parent().children().eq(1).text();
    var seqID = $(e).parent().parent().children().eq(2).text();
    var transData = [];
    transData.push({'Code': code, 'SeqID': seqID, 'Type': 'Out'});
    //submitByAjax(transData)
}

//加入入库单
function addToIn(e){
    var code = $(e).parent().parent().children().eq(1).text();
    var seqID = $(e).parent().parent().children().eq(2).text();
    var transData = [];
    transData.push({'Code': code, 'SeqID': seqID, 'Type': 'In'});
    //submitByAjax(transData)
}

// 加入报修单
function addToRepair(e){
    var code = $(e).parent().parent().children().eq(1).text();
    var seqID = $(e).parent().parent().children().eq(2).text();
    $('#repairCode').val(code);
    $('#repairSeqID').val(seqID);
    $('#RepairModal').modal('show');
}

//预览图片
$('#repairImageInput').change(function(){
    var f = document.getElementById('repairImageInput').files[0];
    var fileReader = new FileReader();
    fileReader.readAsDataURL(f);
    fileReader.onload = function(){
        $('#repairImage').attr('src', fileReader.result);
        $('.imageScan').addClass('nodisplay');
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
$("#repairBtn").click(function(){  
    var Btn = this;
    if($('#repairImageInput').val() != ''){
        changeBtnStyle(Btn, '确认提交');
        var transData = new FormData(document.getElementById('repairForm'));   
        $.ajax({ 
            type: 'POST',  
            dataType: 'JSON',
            url: '',                            //后端url待填 
            cache: false,                       //上传文件不需缓存
            processData: false,                 //需设置为false。因为data值是FormData对象，不需要对数据做处理
            contentType: false, 
            data: transData,
            success: function(result){
                if(result.Status == 'error'){
                    alert('操作失败，请稍后重试...');
                }else{
                    alert('操作成功！');
                }
                changeBtnStyle(Btn, '确认提交');
            },
            error: function(){
                alert('操作失败，请稍后重试...');
                changeBtnStyle(Btn, '确认提交');
            }
        })
    }
})

// 加入报废单
function addToScrap(e){
    var code = $(e).parent().parent().children().eq(1).text();
    var seqID = $(e).parent().parent().children().eq(2).text();
    var transData = [];
    transData.push({'Code': code, 'SeqID': seqID, 'Type': 'Scrap'});
    //submitByAjax(transData)
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region  缓存窗
//缓存窗隐藏
$('.cache-icon').click(function(){
    if($('.cache-content').css('display') == 'none'){
        $('.cache-tab').show();
        $('.cache-content').show();
        $('.cache-title').show();
        $('.cache-box').width(300);
    }else{
        $('.cache-tab').hide();
        $('.cache-content').hide();
        $('.cache-title').hide();
        $('.cache-box').width(56);
    }
});

//缓存窗tab按钮
function hideAllCacheTbody(){
    for(var i = 1; i < 5; i++){
        $('#cacheTable').children().eq(i).hide();
    }
}
function changeTab(e){
    if($(e).text() == '出库'){
        hideAllCacheTbody();
        $('#outTbody').show();
        cacheTbodyType = 'Out';
    }else if($(e).text() == '入库'){
        hideAllCacheTbody();
        $('#inTbody').show();
        cacheTbodyType = 'In';
    }else if($(e).text() == '报修'){
        hideAllCacheTbody();
        $('#repairTbody').show();
        cacheTbodyType = 'Repair';
    }else{
        hideAllCacheTbody();
        $('#scrapTbody').show();
        cacheTbodyType = 'Scrap';
    }
    $(e).parent().children().eq(0).removeClass('a-active');
    $(e).parent().children().eq(1).removeClass('a-active');
    $(e).parent().children().eq(2).removeClass('a-active');
    $(e).parent().children().eq(3).removeClass('a-active');
    $(e).addClass('a-active');
}

//缓存窗单个清除按钮
function remove(e){ 
    var code = $(e).parent().parent().children().eq(0).text();
    var seqID = $(e).parent().parent().children().eq(1).text();
    var transData = [];
    transData.push({'Code': code, 'SeqID': seqID, 'Type': cacheTbodyType});
    /* $.ajax({
        type: 'POST',
        dataType: 'JSON',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify(transData),
        url: '',  //待改  后端接口
        success: function(result){
            if(result.Status == 'error'){
                alert('操作失败，请稍后重试...');
            }
        } 
    }); */

    refreshCache();
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 获取Url查询字符串
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 滚动条监听，操作窗固定
$(window).scroll(function(){
    if($(window).scrollTop() > 100)
        $('.oper-box').addClass('oper-box-sticky');
    else
        $('.oper-box').removeClass('oper-box-sticky');
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