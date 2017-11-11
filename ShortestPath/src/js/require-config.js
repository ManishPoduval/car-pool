require.config({
    paths: {
        'jquery': '../../components/jquery/dist/jquery',
        'jquery.cookie': '../../components/jquery.cookie/jquery.cookie',
        'bootstrap': '../../components/bootstrap/dist/js/bootstrap.min',
        'knockout': '../../components/knockout/build/output/knockout-latest',
        'postal': '../../components/postal/lib/postal',
        'lodash': '../../components/lodash/lodash',
        'json2': '../../components/json2/lib/json2/static/json2',
        'font-awesome': '../../components/font-awesome/css/font-awesome',
        'async': '../../components/async/dist/async'
    },
    shim: {
        bootstrap: {
            dep: ['jquery'],
            exports: 'bootstrap'
        },
    },
    deps: ['jquery', 'jquery.cookie', 'bootstrap', 'json2']
});