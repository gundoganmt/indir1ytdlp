document.addEventListener('DOMContentLoaded', () => {
    $('.check_proxy').on('click', function(e) {
      const xhr = new XMLHttpRequest();
      var proxy_id = $(this).attr('data-proxy-id');
      var url = '/proxy_check/' + proxy_id;
      $('#check_'+proxy_id).text("Checking...")
  
      xhr.open('GET', url);
      xhr.onload = () => {
        if (xhr.status == 200) {
          const result = JSON.parse(xhr.responseText);
          if (result.success) {
            $('#check_'+proxy_id).text("Success")
            $('#check_'+proxy_id).css("background-color", "green");
            $('#check_'+proxy_id).css("border-color", "green");
          }
          else {
            $('#check_'+proxy_id).text("Failed")
            $('#check_'+proxy_id).css("background-color", "red");
            $('#check_'+proxy_id).css("border-color", "red");
          }
        }
      }
      xhr.send();
    })

    $('.delete_proxy').on('click', function(e){
        Swal.fire({
            title: 'Demo mode active',
            text: "This feature is disabled for demo",
            icon: 'warning',
            showCancelButton: true,
        })

        // const xhr = new XMLHttpRequest();
        // var proxy_id = $(this).attr('data-proxy-id');
        // var url = '/delete_proxy/' + proxy_id;
    
        // Swal.fire({
        //   title: 'Are you sure?',
        //   text: "You won't be able to revert this!",
        //   icon: 'warning',
        //   showCancelButton: true,
        //   confirmButtonColor: '#3085d6',
        //   cancelButtonColor: '#d33',
        //   confirmButtonText: 'Yes, delete it!'
        // }).then((result) => {
        //   if (result.isConfirmed) {
        //     xhr.open('GET', url);
        //     xhr.onload = () => {
        //       if (xhr.status == 200){
        //         const result = JSON.parse(xhr.responseText);
        //         if (result.success) {
        //           $('#'+proxy_id).hide('slow', function(){ $('#'+proxy_id).remove(); });
        //           Swal.fire(
        //             'Deleted!',
        //             "Proxy deleted successfully!",
        //             'success'
        //           )
        //         }
        //         else {
        //           Swal.fire(
        //             'Error!',
        //             "Something went wrong refresh the page and try again!",
        //             'error'
        //           )
        //         }
        //       }
        //     }
        //     xhr.send();
        //   }
        // })
    })

    $('.create_proxy').on('click', function(e){
        Swal.fire({
            title: 'Demo mode active',
            text: "This feature is disabled for demo",
            icon: 'warning',
            showCancelButton: true,
        })
    })
})
