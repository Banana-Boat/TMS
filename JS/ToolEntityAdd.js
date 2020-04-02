/////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 导入字典
$(window).on('load', function(){
    $.ajax({
        type: 'GET',
        dataType: 'JSON',
        url: '../TestData/CodeStoreHouseDict.json',             //url待改
        success: function(result){
            if(result.Status == 'error'){
                alert('获取下拉列表数据失败，请自行填写');
                $('#Code').replaceWith('<input class="form-control" id="Code">');
                $('#StoreHouse').replaceWith('<input class="form-control" id="StoreHouse">');
            }else{
                function compare(a, b){
                    return a.localeCompare(b);
                }
                let tempCodeDisc = result['Code'].sort(compare);
                let tempStoreHouseDisc = result['StoreHouse'].sort(compare);
                for(let p in tempCodeDisc){
                    $('#Code').append('<option value="' + tempCodeDisc[p] + '">' + tempCodeDisc[p] + '</option>');
                }
                for(let p in tempStoreHouseDisc){
                    $('#StoreHouse').append('<option value="' + tempStoreHouseDisc[p] + '">' + tempStoreHouseDisc[p] + '</option>');
                }
            }
        },
        error: function(){
            alert('获取下拉列表数据失败，请自行填写');
            $('#Code').replaceWith('<input class="form-control" id="Code">');
            $('#StoreHouse').replaceWith('<input class="form-control" id="StoreHouse">');
        }
    })
})
//#endregion

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 预览图片
$('#Image').change(function(){
    var f = document.getElementById('Image').files[0];
    var fileReader = new FileReader();
    fileReader.readAsDataURL(f);
    fileReader.onload = function(){
        $('#displayImage').attr('src', fileReader.result);
        $('.imageScan').hide()
    }
});
//#endregion

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//#region 提交表单
//校验
function validate(){
    if($('#Buyoff').val() != '' && $('#BillNo').val() != '' && $('#Image').val() != ''){
        return true;
    }else{
        alert('信息填写有误，请重新填写');
        return false;
    }
}
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
$("#SubmitBtn").click(function(){  
    var Btn = this;
    if(validate()){
        changeBtnStyle(Btn, '确认录入');
        var transData = new FormData(document.getElementById('addForm')); 
        console.log(transData.get('Image'))    
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
                changeBtnStyle(Btn, '确认录入');
            },
            error: function(){
                alert('操作失败，请稍后重试...');
                changeBtnStyle(Btn, '确认录入');
            }
        })
    }
})
//#endregion