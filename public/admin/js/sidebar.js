const d = document;
const breakpoints = {
    sm: 540,
    md: 720,
    lg: 960,
    xl: 1140
};
var sidebar = document.getElementById('sidebarMenu');
var content = document.getElementsByClassName('content')[0];
if (sidebar && d.body.clientWidth < breakpoints.lg) {
    sidebar.addEventListener('shown.bs.collapse', function() {
        document.querySelector('body').style.position = 'fixed';
    });
    sidebar.addEventListener('hidden.bs.collapse', function() {
        document.querySelector('body').style.position = 'relative';
    });
}

if (sidebar) {
    if (localStorage.getItem('sidebar') === 'contracted') {
        sidebar.classList.add('notransition');
        content.classList.add('notransition');

        sidebar.classList.add('contracted');

        setTimeout(function() {
            sidebar.classList.remove('notransition');
            content.classList.remove('notransition');
        }, 500);

    } else {
        sidebar.classList.add('notransition');
        content.classList.add('notransition');

        sidebar.classList.remove('contracted');

        setTimeout(function() {
            sidebar.classList.remove('notransition');
            content.classList.remove('notransition');
        }, 500);
    }

    var sidebarToggle = d.getElementById('sidebar-toggle');
    sidebarToggle.addEventListener('click', function() {
        if (sidebar.classList.contains('contracted')) {
            sidebar.classList.remove('contracted');
            localStorage.removeItem('sidebar', 'contracted');
        } else {
            sidebar.classList.add('contracted');
            localStorage.setItem('sidebar', 'contracted');
        }
    });

    sidebar.addEventListener('mouseenter', function() {
        if (localStorage.getItem('sidebar') === 'contracted') {
            if (sidebar.classList.contains('contracted')) {
                sidebar.classList.remove('contracted');
            } else {
                sidebar.classList.add('contracted');
            }
        }
    });

    sidebar.addEventListener('mouseleave', function() {
        if (localStorage.getItem('sidebar') === 'contracted') {
            if (sidebar.classList.contains('contracted')) {
                sidebar.classList.remove('contracted');
            } else {
                sidebar.classList.add('contracted');
            }
        }
    });
}
