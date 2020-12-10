
const divLogout = document.querySelector('.js-div-logout');


function nullToDash(value) {
    if (value == '' || value == null || value.length === 0) return '-';
    else return value;
}


function initCommon() {

    divLogout.addEventListener('click', function() {
        if (!confirm('로그아웃 하시겠습니까?')) return;

        fetch('/admin/webapi/logout', {
            method: 'POST'
        })
        .then(function(data) {
            return data.json();
        })
        .then(function(response) {
            if (response.status != 'OK') {
                alert('에러가 발생했습니다.');
                return;
            }
    
            location.href = '/admin/login';
        });
    });

}
initCommon();
