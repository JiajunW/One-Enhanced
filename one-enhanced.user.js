// ==UserScript==
// @name        「ONE·一个」网站增强
// @namespace   https://github.com/jiajunw/one-enhanced
// @description 为「ONE·一个」网站增加方便的功能
// @icon        https://raw.githubusercontent.com/JiajunW/One-Enhanced/master/res/icon.png
// @include     http://wufazhuce.com/one/vol*
// @version     1.2.0
// @resource    custom_css https://raw.githubusercontent.com/JiajunW/One-Enhanced/master/style/style.css
// @grant       GM_addStyle
// @grant       GM_getResourceText
// @grant       GM_xmlhttpRequest
// ==/UserScript==

function add_style() {
    GM_addStyle(GM_getResourceText("custom_css"));
}

function get_today_no() {
    var the_day_before_first = new Date(2012, 10 - 1, 7);
    var today = new Date();

    var diff = new Date(today - the_day_before_first);
    var days = diff / 1000 / 60 / 60 / 24;
    return Math.floor(days);
}

function get_cur_no() {
    var url_path = document.location.pathname;
    var re = /^\/one\/vol\.(\d+)/g;
    var matches = re.exec(url_path);
    if (matches && matches.length > 1) {
        return parseInt(matches[1]);
    }
}

function dom(tag, attr, inner) {
    var tag = document.createElement(tag);
    for (var key in attr) {
        if (attr.hasOwnProperty(key)) {
            tag.setAttribute(key,attr[key]);
        }
    }
    if (inner) {
        tag.innerHTML = inner;
    }
    return tag;
}

function add_nav() {
    var new_nav = dom('nav', { id : 'enhanced-navbar' });
    document.body.appendChild(new_nav);

    var url = '/one/vol.';
    if (cur < newest) {
        var url_next = url + (cur + 1);
        var new_nav_newer = dom(
            'a',
            { id : 'enhanced-newer', href : url_next },
            '<span class="glyphicon glyphicon-circle-arrow-left"></span>'
        );
        new_nav.appendChild(new_nav_newer);
    }

    if (cur > oldest) {
        var url_prev = url + (cur - 1);
        var new_nav_older = dom(
            'a',
            { id : 'enhanced-older', href : url_prev },
            '<span class="glyphicon glyphicon-circle-arrow-right"></span>'
        );
        new_nav.appendChild(new_nav_older);
    }

    var doSomething = function(e) {
        e.preventDefault();

        var tag = e.target.tagName.toLowerCase();
        var url;
        var hash = document.location.hash;
        if (tag == 'span') {
            url = e.target.parentNode.href;
        } else {
            url = e.target.href;
        }

        document.location.href = url + hash;
    };

    var nodes = document.querySelectorAll('#enhanced-navbar a');
    for (var i = 0; i < nodes.length; ++i) {
        nodes[i].addEventListener('click', doSomething, false);
    }

    add_style();
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function add_random_link() {
    var rand = getRandomInt(oldest, newest);
    var rand_url = '/one/vol.' + rand;

    var navbar = document.querySelector('#one-navbar .navbar-right');
    var recent = document.querySelector('#one-navbar .navbar-right > li');
    var rand_link = '<a href="' + rand_url + '"><span class="visible-xs">ONE<br />偶遇</span><span class="hidden-xs">ONE 偶遇</span></a>';
    var rand_item = dom('li', null, rand_link);
    navbar.insertBefore(rand_item, recent);
}

function main() {
    var header = document.querySelector('.page-header > h1');
    if (header && header.innerHTML.trim() === '404 Not Found') {
        // this is a 404 page
    } else {
        add_nav();
        add_random_link();
    }
}

var newest = get_today_no(),
    oldest = 1,
    cur    = get_cur_no();
var tomorrow_url = '/one/vol.' + (newest + 1);

GM_xmlhttpRequest({
    url: tomorrow_url,
    method: "HEAD",
    onload: function(response) {
        if (response.status == 200) {
            // has already published
            // so plus 1 to newest
            newest += 1;
        } else if (response.status == 404) {
            // not published yet.
        }
        main();
    }
});
