////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//定义全局变量
var initData = [];              //全体数据         
var pageSize = 12;              //一页最多显示12条信息
var filterBy = {                //存放筛选条件
    'Code': '',
    'Name': '',
    'Family': '',
    'Model': ''
};   
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
                let tempStr = ''
                tempStr += '<tr><td>' + data[i].Code
                    + '</td><td>' + data[i].Name
                    + '</td><td>' + data[i].Family
                    + '</td><td>' + data[i].Model;
                
                tempPartNo = data[i].PartNo.split(' ')[0];
                for(let p = 1; p < data[i].PartNo.split(' ').length; p++){
                    tempPartNo += '<br>' + data[i].PartNo.split(' ')[p]
                }
                tempStr += '</td><td>' + tempPartNo
                    + '</td><td>' + data[i].OwnerID + '<br>' + data[i].OwnerName
                    + '</td><td><button class="btn act-btn" onclick="getInfo(this);">查看详情</button>'
                    + '<button class="btn act-btn" onclick="getEntity(this);">查看实体</button>'
                    + '</td></tr>';
                $('tbody').append(tempStr);
            }
        }
    });
}

$(window).on('load', function(){
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
    $.ajax({                    //获取family、model字典
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/FamModPMDict.json',  //后端Url，待改
        success: function(result){
            if(result.Status == 'error'){
                alert('获取数据失败，请稍后重试..');
            }else{
                for(let p in result.Family)
                    $('#familyFilterInput').append('<option value="' + result.Family[p] + '">' + result.Family[p] + '</option>');
                for(let n in result.Model)
                    $('#modelFilterInput').append('<option value="' + result.Model[n] + '">' + result.Model[n] + '</option>');
            }
        },
        error: function(){
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
        tempData = tempData.filter(item => {return item.Code.indexOf(filterBy.Code) != -1});
    if(filterBy.Name != '')
        tempData = tempData.filter(item => {return item.Name.indexOf(filterBy.Name) != -1});
    if(filterBy.Family != '')
        tempData = tempData.filter(item => {return item.Family.indexOf(filterBy.Family) != -1});
    if(filterBy.Model != '')
        tempData = tempData.filter(item => {return item.Model.indexOf(filterBy.Model) != -1});
    
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
//#region 获取夹具定义详细信息
function getInfo(e){
    var code = $(e).parent().parent().children().eq(0).text();
    $.ajax({
        type: "GET",
        dataType: "JSON",
        url: "../TestData/ToolDefinitionInfo.json",  //code附在url后  "...?code=" + code
        success: function(result){
            if(result.Status == 'error'){
                alert('获取数据失败，请稍后重试..');
            }else{
                $('#Code').text(result.Code);
                $('#Name').text(result.Name);
                $('#Family').text(result.Family);
                $('#Model').text(result.Model);
                $('#PartNo').text(result.PartNo);
                $('#UPL').text(result.UPL);
                $('#UsedFor').text(result.UsedFor);
                $('#PMPeriod').text(result.PMPeriod);
                $('#PMContent').text(result.PMContent);
                $('#OwnerID').text(result.OwnerID);
                $('#OwnerName').text(result.OwnerName);
                $('#RecOn').text(result.RecOn);
                $('#RecorderID').text(result.RecorderID);
                $('#RecorderName').text(result.RecorderName);
                $('#EditOn').text(result.EditOn);
                $('#EditorID').text(result.EditorID);
                $('#EditorName').text(result.EditorName);
                $('#Workcell').text(result.Workcell);
            }
        },
        error: function(){
            alert('获取数据失败，请稍后重试...')
        }
    });

    $('#InfoModal').modal('show');
}
//#endregion

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 获取夹具实体列表
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