(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','http://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-33492470-2', {
  'cookieDomain': 'none'
});
//ga('send', 'pageview');

$(document).ready(function() {
  // global google analytics event tracker
  $(document).on('click', '.ga', function(e) {
    console.log('ga-debug', 'click', $(this).attr('ga-cat'), $(this).attr('ga-label'));
    //ga('send', 'event', $(e.currentTarget).attr('ga-cat'), 'click', $(e.currentTarget).attr('ga-label'));
  });
});
