////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//定义全局变量
var jData = [];                 //全体数据
var searchType = ''; 
var pageSize = 16;              //一页最多显示16条信息
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
                $('tbody').append('<tr><td>' + data[i]['Code']
                + '</td><td>' + data[i]['Name']
                + '</td><td>' + data[i]['Family']
                + '</td><td>' + data[i]['Model']
                + '</td><td>' + data[i]['PartNo']
                + '</td><td><button class="btn act-btn" onclick="getInfo(this);">查看详情</button>'
                + '<button class="btn act-btn" onclick="getEntity(this);">查看实体</button>'
                + '</td></tr>');
            }
        }
    });
}
$(window).on('load', function(){
    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/ToolDefinitionList.json',  //后端Url，待改
        success: function(result){
            displayTable(result);
            jData = result;
        },
        error: function(){
            alert('获取信息失败，请刷新重试...');
        }
    })
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//查找
function chooseSearchType(e){
    $('#searchTypeBtn').text($(e).text());
    searchType = $(e).text();
    $('#paramInput').focus();
}

$('#searchBtn').click(function(){
    var param = $('#paramInput').val();
    switch(searchType){
        case 'Code':
            displayTable(jData.filter(item => { return item.Code == param}));
            break;
        case 'Name':
            displayTable(jData.filter(item => { return item.Name == param}));
            break;
        case 'Family':
            displayTable(jData.filter(item => { return item.Family == param}));
            break;
        case 'Model':
            displayTable(jData.filter(item => { return item.Model == param}));
            break;
        default:
            displayTable(jData);
            $('#paramInput').val('');
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//获取夹具定义的详细信息
function getInfo(e){
    var code = $(e).parent().parent().children().eq(0).text();
    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/ToolDefinitionInfo.json',  //code附在url后  "...?code=' + code
        success: function(result){
            
            $('#Code').val(result.Code);
            $('#Name').val(result.Name);
            $('#Family').val(result.Family);
            $('#Model').val(result.Model);
            $('#PartNo').val(result.PartNo);
            $('#UPL').val(result.UPL);
            $('#UsedFor').val(result.UsedFor);
            $('#PMPeriod').val(result.PMPeriod);
            $('#PMContent').val(result.PMContent);
            $('#OwnerID').val(result.OwnerID);
            $('#OwnerName').val(result.OwnerName);
            $('#RecOn').val(result.RecOn);
            $('#RecorderID').val(result.RecorderID);
            $('#RecorderName').val(result.RecorderName);
            $('#EditOn').val(result.EditOn);
            $('#EditorID').val(result.EditorID);
            $('#EditorName').val(result.EditorName);
            $('#Workcell').val(result.Workcell);
        },
        error: function(){
            alert('获取数据失败，请稍后重试...')
        }
    });

    $('#InfoModal').modal('show');
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//修改夹具定义信息
$('#EditBtn').click(function(){
    var transData = {
        'Code': $('#Code').val(),
        'Name': $('#Name').val(),
        'Family': $('#Family').val(),
        'Model': $('#Model').val(),
        'PartNo': $('#PartNo').val(),
        'UPL': $('#UPL').val(),
        'UsedFor': $('#UsedFor').val(),
        'PMPeriod': $('#PMPeriod').val(),
        'PMContent': $('#PMContent').val(),
        'OwnerID': $('#OwnerID').val(),
        'OwnerName': $('#OwnerName').val(),
        'RecOn': $('#RecOn').val(),
        'RecorderID': $('#RecorderID').val(),
        'RecorderName': $('#RecorderName').val(),
        'EditOn': $('#EditOn').val(),
        'EditorID': $('#EditorID').val(),
        'EditorName': $('#EditorName').val(),
        'Workcell': $('#Workcell').val()
    };
    $.ajax({
        type: 'POST',
        dataType: 'JSON',
        contentType: 'application/json',
        data: transData,
        url: '',                                    //待改
        success: function(result){
            if(result.Status == 'success'){
                alert('修改成功！');
                window.location = '../HTML/AdminToolDefinitionDisplay.html';
            }else{
                alert('修改失败，请稍后重试...');
            }
        },
        error: function(){
            alert('修改失败，请稍后重试...');
        }
    });

    refleshTable();
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//获取夹具实体列表
function getEntity(e){
    var code = $(e).parent().parent().children().eq(0).text();
    window.location = '../HTML/DisplayToolEntity.html?code=' + code;
}