import Swal from 'sweetalert2'

const $swal = Swal.mixin({
    buttonsStyling: false,
    position: 'top',
    showConfirmButton: false,
    customClass: {
        //popup: '_swal2_popup',
        confirmButton: 'btn btn-outline-primary px-4 mx-2 mb-2',
        denyButton: 'btn btn-outline-primary px-4 mx-2 mb-2',
        cancelButton: 'btn btn-outline-primary px-4 mx-2 mb-2',
        footer: '_swal2_footer',
        icon: '_swal_icon',
        title:  '_swal_title',
        htmlContainer: '_swal_html_container',
        closeButton: '_swal_close_button',
    },
    showCloseButton: true,
    
    //iconHtml: '<i>fff</i>'

    //toast: true,
    //position: 'top-end',
    //showConfirmButton: false,
    //timer: 3000,
    //timerProgressBar: true,
    //didOpen: (toast) => {
    //    toast.addEventListener('mouseenter', Swal.stopTimer)
    //    toast.addEventListener('mouseleave', Swal.resumeTimer)
    //}
})

//const $swal = async function (opts) {
//    return await swall.fire(opts)
//}

export default $swal 