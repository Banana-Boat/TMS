//局部刷新iframe
function changeContent(url){
    $('#contentIframe').attr('src', url);
}

//注销用户
$('#logoutBtn').click(function(){
    if(confirm('确定注销吗？')){
        $.ajax({
            type: 'GET',
            dataType: 'JSON',
            url: '',                               
            success: function(result){
                if(result.Status == 'error'){
                    alert('注销失败，请稍后重试...');
                }else{
                    window.location = ''            //跳回登陆页
                }
            },
            error: function(){
                alert('注销失败，请稍后重试...');
            } 
        });
    }
    
})
